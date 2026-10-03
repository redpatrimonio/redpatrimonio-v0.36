# CHECKPOINT CP_009 — Primer Compendio Documental en el Mapa: Stehberg 1975

**Fecha:** 3 de octubre de 2026  
**Versión:** RedPatrimonio v0.36  
**Rama:** `main` (desplegado vía merge de PR #1 desde `feat/compendio-stehberg-1975`)  
**Autor:** Fundador (visión conceptual, curaduría de datos) & Partner Ingeniero IA (arquitectura y código)  
**Estado:** ✅ Completado, verificado en base de datos y mergeado a producción.

---

## 1. Introducción y origen: ¿de dónde viene todo esto?

RedPatrimonio nació con una base enriquecida y consolidada (`sitios_master`) y un flujo de reporte ciudadano (`reportes_nuevos`). Sin embargo, el patrimonio arqueológico chileno existe en múltiples corpus documentales históricos y catálogos institucionales dispersos: libros clásicos, informes técnicos, expedientes del Consejo de Monumentos Nacionales (CMN) y declaraciones de impacto ambiental del SEIA.

El fundador de RedPatrimonio —arquitecto y colaborador activo en la **Sociedad Chilena de Historia y Geografía (SCHG)** junto al arqueólogo **Rubén Stehberg**— planteó incorporar el primer compendio documental a la plataforma en homenaje al legado de don Rubén: el **"Diccionario de sitios arqueológicos de Chile Central" (1975)**, publicado originalmente por el Museo Nacional de Historia Natural (MNHN).

Este primer paso inaugura una nueva línea arquitectónica en RedPatrimonio: **capas de investigación documental conmutable**, que en el futuro sumarán:
- El compendio del **Mapocho Incaico** (serie de papers fundamentales de Stehberg y Sotomayor).
- La nómina completa del **CMN** (~10.000 sitios).
- La base de datos arqueológica del **SEIA** (~40.000 sitios georreferenciados).

Para que esta escala no colapsara la tabla `sitios_master` (que contiene fichas enriquecidas con fotos, revisiones humanas y metadatos complejos), se tomó una decisión estructural de primer orden: **separar físicamente los compendios documentales en su propia tabla**, permitiendo superposiciones de capas sobre un mismo punto geográfico (lectura estratigráfica del mapa).

---

## 2. Decisiones de diseño y arquitectura cerradas

1. **Separación de datos:** `sitios_master` queda 100% intacta. Los compendios viven en `public.sitios_compendio`.
2. **Identificación por slug:** cada compendio tiene un `compendio_slug` técnico (`stehberg_1975`), lo que permite que una sola tabla albergue múltiples compendios a futuro.
3. **Seguridad y privacidad (Lógica B intacta):**
   - Todos los sitios de Stehberg 1975 se clasifican como **Código de Accesibilidad B**.
   - **Usuarios público:** ven la coordenada desplazada 300 metros de forma determinista para proteger el sitio in situ; entre zoom 10 y 15 ven un área difusa (círculo `areaB`); en zoom 16 o superior se oculta.
   - **Usuarios experto / partner / founder:** ven la coordenada exacta con el icono de la vasija y pueden abrir el sitio directamente en Google Maps.
4. **Estado inicial del mapa:** los compendios **inician apagados** por defecto para mantener la limpieza visual y no saturar el rendimiento ni el campo visual del usuario.
5. **UI desacoplada:**
   - **Botón Compendios:** control alargado con icono de pin centrado en la parte inferior del mapa (`leaflet-bottom`, `left: 50%`, `transform: translateX(-50%)`), que abre un modal dedicado.
   - **Búsqueda textual:** se mantiene conceptualmente separada para una siguiente fase.
   - **Filtro por tipologías:** se desacopla para ser incorporado sobre esta misma base en el siguiente sprint.
6. **Ficha técnica:** adaptada para soportar origen `'compendio'`, mostrando el badge *"Compendio Stehberg 1975"*, comuna/región, categoría, tipologías y cita bibliográfica, sin exigir fotos ni publicaciones PDF inexistentes en la publicación de 1975.

---

## 3. Bitácora detallada de cambios

### A. Base de Datos (Supabase — sa-east-1 `lbsdxnafreajwdxqwhnx`)

1. **Inspección:** se verificó que la tabla `public.sitios_compendio` existía con 107 filas correspondientes a la extracción OCR del Diccionario de Stehberg, pero todas en estado `pendiente`, sin columna de compendio y sin políticas RLS de lectura pública.
2. **Migración SQL aplicada (`sitios_compendio_slug_y_lectura_publica`):**
   ```sql
   -- 1. Agregar columna de compendio y asignarla al corpus de 1975
   alter table public.sitios_compendio add column if not exists compendio_slug text;
   update public.sitios_compendio set compendio_slug = 'stehberg_1975' where compendio_slug is null;
   alter table public.sitios_compendio alter column compendio_slug set not null;
   create index if not exists idx_sitios_compendio_slug on public.sitios_compendio (compendio_slug);

   -- 2. Activar sitios validados para el mapa
   update public.sitios_compendio set estado_validacion = 'verde' where estado_validacion = 'pendiente';

   -- 3. Habilitar lectura pública bajo RLS (solo filas 'verde')
   create policy "lectura_publica_compendio_verde"
     on public.sitios_compendio
     for select
     to anon, authenticated
     using (estado_validacion = 'verde');
   ```
3. **Verificación:** consulta de solo lectura confirmó 107 filas en `stehberg_1975/verde`, RLS activa, permisos SELECT válidos para `anon` y `authenticated`, y 0 coordenadas inválidas.

### B. Frontend (Repositorio `redpatrimonio/redpatrimonio-v0.36`)

Se creó la rama de trabajo `feat/compendio-stehberg-1975` y se avanzó script por script:

1. **`lib/constants/compendios.ts` (Nuevo — Commit `2a858d5`):**
   Catálogo TypeScript tipado con la interfaz `CompendioDef` y la constante `COMPENDIOS_DISPONIBLES`. Contiene el registro oficial de Stehberg 1975 con su cita formal completa.

2. **`components/map/SitiosCompendio.tsx` (Nuevo — Commit `8c406a9`):**
   Componente React-Leaflet que:
   - Consulta `public.sitios_compendio` filtrando por `compendio_slug in compendiosActivos` y `estado_validacion = 'verde'`.
   - Aplica `desplazarCoordenada(..., 300)` para usuarios públicos.
   - Respeta los tres niveles de zoom de categoría B.
   - Renderiza con el `iconoArqueologico` estándar dentro del cluster general.
   - Genera un popup con badge dorado *"Compendio Stehberg 1975"*, comuna, tipologías, botón Google Maps (condicional) y botón *"Ver ficha"*.

3. **`components/modals/FichaSitioModal.tsx` (Modificado — Commit `6ca6767`):**
   - Amplió la interfaz de props a `origen: 'master' | 'reporte' | 'compendio'`.
   - Agregó el caso `origen === 'compendio'` consultando `public.sitios_compendio` por `id`.
   - Incorporó el badge visual correspondiente y omitió las secciones que no aplican (contacto ciudadano, medios multimedia).

4. **`components/map/SelectorCompendios.tsx` (Nuevo — Commit `50b577b`):**
   - Botón flotante centrado abajo con icono de pin y badge numérico cuando hay compendios activos.
   - Modal accesible con descripción, checkboxes por compendio, año, autor y referencia.
   - Botones "Desactivar todos" y "Aplicar".

5. **`components/map/MapView.tsx` (Modificado — Commit `e1367c3`):**
   - Declaró el estado `compendiosActivos: string[]` inicializado en `[]`.
   - Actualizó `origenSeleccionado` a `'master' | 'reporte' | 'compendio'`.
   - Montó `<SelectorCompendios />` en la interfaz.
   - Montó `<SitiosCompendio />` dentro de `MarkerClusterGroup`, integrando los sitios documentales al algoritmo de clustering existente.

6. **Integración final:** Pull Request #1 creado y mergeado a `main` con squash (Commit `83db63ca48ea04d2d991ba79c743f51aae2be667`).

---

## 4. Estado de verificación técnica

- **Compilación Next.js:** compatible con TypeScript y tipos existentes de `react-leaflet` y `@supabase/ssr`.
- **Compatibilidad Leaflet:** renderizado dentro de `MarkerClusterGroup`, respeta el basemap MapTiler Outdoor v2 configurado previamente.
- **Seguridad RLS:** la app pública lee únicamente filas marcadas como `'verde'`. No existe exposición de escrituras.

---

## 5. Próximos pasos sugeridos (Backlog)

1. **Subir los sitios restantes de Stehberg 1975:** completar el corpus hasta alcanzar los ~300 registros proyectados del libro.
2. **Filtro cruzado por tipologías:** implementar el selector inferior de tipologías (inclusión/exclusión) que interseccione con los compendios activos.
3. **Buscador de sitios:** diseñar el botón gemelo centrado abajo para búsqueda textual sobre `sitios_master` y `sitios_compendio`.
4. **Security hardening:** atender la recomendación pendiente sobre RLS en las 6 tablas operativas (`lugares_capas`, `reportes_cmn`, etc.).
