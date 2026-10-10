# 📋 CHECKPOINT CP_010 — Sistema de Compendios Documentales (v0.5)

**Fecha:** 4 de octubre de 2026  
**Versión:** RedPatrimonio v0.5  
**Repo:** `redpatrimonio/redpatrimonio-v0.36`  
**Archivo:** `_checkpoints/CP_010_2026-10-04_Compendios_Documentales_v05.md`  
**Estado:** ✅ PRODUCCIÓN ACTIVA (Supabase + GitHub + Vercel)  

---

## 1. Propósito y Definición Conceptual

Los **Compendios Documentales** son colecciones arqueológicas e históricas científicas completas (libros, catastros, boletines o diccionarios arqueológicos) digitalizadas y georreferenciadas para visualizarse como capas dentro del mapa de RedPatrimonio.

A diferencia de los reportes ciudadanos en terreno, un compendio rescata obras patrimoniales existentes preservando el rigor editorial, la fuente original y el crédito formal a quien realizó la labor de compilación y georreferenciación digital.

El primer compendio operativo en producción es el **Diccionario de sitios arqueológicos de Chile Central (Rubén Stehberg, 1975)** con 107 sitios georreferenciados.

---

## 2. Backend / Base de Datos (Supabase)

### Tabla Principal: `public.sitios_compendio`

Cada fila representa un sitio arqueológico documentado dentro de una obra o compendio específico.

| Columna | Tipo | Restricción / Formato | Descripción |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Identificador único del sitio en el compendio |
| `id_sitio` | `uuid` | FK nullable a `sitios_master` | Enlace opcional si el sitio fue homologado al master |
| `nombre_sitio` | `text` | `NOT NULL` | Nombre del sitio registrado en la obra |
| `alias_local` | `text` | nullable | Otros nombres conocidos |
| `latitud` | `float8` | `NOT NULL`, check -90..90 | Coordenada Y (WGS84) |
| `longitud` | `float8` | `NOT NULL`, check -180..180 | Coordenada X (WGS84) |
| `region` | `text` | nullable | Región administrativa de Chile |
| `comuna` | `text` | nullable | Comuna administrativa |
| `localidad_sector` | `text` | nullable | Sector específico o topónimo local del compendio |
| `descripcion_breve` | `text` | nullable | Resumen / subtítulo descriptivo del sitio |
| `descripcion_detallada` | `text` | nullable | Texto íntegro del reporte o ficha del texto |
| `categoria_general` | `text` | nullable | Categoría (Pucará, Alero, Cementerio, etc.) |
| `categoria_sitio` | `text` | nullable | `sitio_arqueologico` o `hallazgo_aislado` |
| `tipologia_especifica` | `text[]` | Array nullable | Tipologías CMN: Alfarería, Lítica, Estructura, etc. |
| `cultura_asociada` | `text` | nullable | Cultura asociada (ej: Inca, Aconcagua, Bato, Diaguita) |
| `periodo_cronologico` | `text` | nullable | Período (ej: Agroalfarero Tardío, Intermedio) |
| `cronologia_general` | `text` | nullable | `Prehispánico`, `Histórico`, `Ambos` |
| `codigo_accesibilidad` | `text` | check `A`, `B`, `C` (default `'B'`) | Nivel de resguardo y difusión de coordenadas |
| `capa_destino` | `text` | nullable | Destino en capas (default `'arqueologico'`) |
| `fuente_principal` | `text` | nullable | Cita bibliográfica precisa (ej: `R. Stehberg (1975)`) |
| `declarado_cmn` | `boolean`| nullable | Indica si cuenta con declaratoria oficial |
| `estado_validacion` | `text` | `pendiente`, `verde`, `observado` | Estado de revisión interna |
| `compendio_slug` | `text` | `NOT NULL` | Identificador de la colección (ej: `stehberg_1975`, `mapocho_incaico`) |
| **`autor_original`** | `text` | nullable | Autor(es) de la obra física (ej: `Rubén Stehberg`) |
| **`titulo_obra`** | `text` | nullable | Título del libro/artículo (ej: `Diccionario de sitios arqueológicos de Chile Central`) |
| **`anio_publicacion`** | `integer`| nullable | Año de publicación de la obra original (ej: `1975`) |
| **`institucion_editora`**| `text` | nullable | Editorial o institución que publicó el texto (ej: `Museo Nacional de Historia Natural — Publicación Ocasional N° 17`) |
| **`compilador_digital`** | `text` | nullable | Responsable de la georreferenciación y digitalización (ej: `Carlos Verdugo Rotella`) |
| **`url_portada`** | `text` | nullable | Imagen de la portada o documento para miniatura |
| **`url_pdf`** | `text` | nullable | Link oficial al PDF online del texto completo |

### Regla Arquitectónica para Agentes de Ingesta (Backend):
- **Omitir `estado_conservacion`:** Los registros históricos reflejan el estado del sitio al momento de la publicación del texto, no un estado de conservación verificado en terreno hoy. Por ello, la tabla `sitios_compendio` no incluye esa columna y ninguna consulta SQL o mutación frontend debe solicitarla.
- **Autoría Cuádruple:** Todo compendio debe diferenciar siempre:
  1. `autor_original`: Investigador(es) autor(es) de la obra.
  2. `titulo_obra`: Nombre formal del texto publicado.
  3. `institucion_editora`: Entidad que publicó la edición física.
  4. `compilador_digital`: Persona responsable de la georreferenciación y digitalización para RedPatrimonio.

---

## 3. Frontend / Componentes en el Mapa (Next.js + Leaflet)

### A. Globo del Mapa (`components/map/SitiosCompendio.tsx`)

El globo (Popup) es autosuficiente, legible y mantiene coherencia de escala con los sitios master.

1. **Dimensiones y Escala Visual:**
   - Popup de Leaflet: `maxWidth={380}` y `minWidth={320}`.
   - Contenedor interno: `width: 330px; maxWidth: 85vw` (cubre entre el 70% y 85% de la pantalla en dispositivos móviles).
2. **Paleta y Tipografía Regularizada:**
   - Paleta institucional sobria: `#10454B` (verde institucional), `#1f2937` (títulos y texto fuerte), `#4b5563` / `#6b7280` (textos secundarios y fuentes), `#f9f8f5` (fondos neutros).
   - Sin colores estridentes (sin morados ni rojos en cuerpo de texto).
   - Emojis restringidos: únicamente el pin rojo 📍 para la línea de ubicación geográfica.
3. **Estructura Interna:**
   - **Header:** Miniatura cuadrada sobria con sello de año + Nombre del sitio + `📍 Comuna · Región`.
   - **Cuerpo:**
     - `Sector: [localidad_sector]`
     - Subtítulo: `descripcion_breve` (en cursiva sobria).
     - Caja de texto: `descripcion_detallada` (con scroll interno si excede 90px de alto).
     - `Fuente: [fuente_principal]` (leída directamente desde la base de datos).
     - Badges de tipologías en gris claro neutro (`#f3f4f6`).
   - **Caja de Créditos:**
     - `Autor: [autor_original]`
     - `Compilación: [compilador_digital]`
   - **Botones de Acción (Bottom):**
     - Botón primario: **"Ver Ficha"** (abre el modal detallado).
     - Botón secundario: **"Abrir en Google Maps"** (enlace satelital `&t=k`).

### B. Ficha Documental Expandible (`components/modals/FichaSitioModal.tsx`)

Se abre al pulsar *"Ver Ficha"* y gestiona la visualización profunda del registro.

1. **Cabecera:** Si el sitio no posee fotografías de terreno propias, muestra la miniatura con el sello editorial del compendio.
2. **Datos técnicos:** Muestra Categoría, Tipología, Cultura, Período, Código de accesibilidad y Fuente.
3. **Publicación y Lectura de PDF:**
   - Bloque *"Documento Científico / Publicación"*.
   - Botón directo **"Abrir PDF"** que enlaza al documento oficial en una nueva pestaña (`target="_blank"`), permitiendo al usuario leerlo online o descargarlo según su navegador.
4. **Créditos Digitales:**
   - Bloque formal que distingue la obra original, su autor, la entidad editora y el responsable de la compilación y estructuración digital (`compilador_digital`).

### C. Conmutador de Capas (`components/map/ToggleCapas.tsx`)

- **Posicionamiento:** Anclado de forma fija e independiente (`position: absolute; top: 68px; right: 12px; z-index: 1000`) para que nunca sea tapado por el top banner ni se mueva al desplegarse.
- **Dropdown flotante:** El panel cae hacia abajo (`top: 44px; right: 0`) sin desplazar el botón trigger.
- **Aislamiento de eventos:** Eventos Leaflet (`onClick`, `onMouseDown`, `onTouchStart`) aislados con `e.stopPropagation()` y listener global para cerrar el panel al tocar fuera (*click outside*).
- **Compendios integrados:** Incluye la sección *"Compendios documentales"* con el switch de **Stehberg 1975** activo por defecto.

---

## 4. Guía para Futuros Compendios (ej: Mapocho Incaico)

Para incorporar una nueva colección documental (como *Mapocho Incaico*, 2012):

1. **Definir el slug:** Asignar un identificador único en minúsculas (ej: `mapocho_incaico`).
2. **Ingesta en `sitios_compendio`:**
   - Asegurarse de completar los 4 campos de autoría:
     - `autor_original`: ej. `'Rubén Stehberg y Gonzalo Sotomayor'`
     - `titulo_obra`: ej. `'Mapocho incaico'`
     - `anio_publicacion`: `2012`
     - `institucion_editora`: ej. `'Boletín del Museo Nacional de Historia Natural'`
     - `compilador_digital`: `'Carlos Verdugo Rotella'`
     - `url_pdf`: Enlace al PDF oficial
     - `compendio_slug`: `'mapocho_incaico'`
3. **Registrar en Frontend:**
   - Agregar la entrada en `lib/constants/compendios.ts` y en el listado de compendios de `ToggleCapas.tsx`.
