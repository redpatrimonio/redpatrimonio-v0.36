# CHECKPOINT CP_001 — Baseline (Estado previo al CP_002)

> Documento el estado real de la app **antes** del hilo que produjo CP_002.
> Construido el 2026-05-02 leyendo el repo `redpatrimonio-v0.36` rama `main`.
> Este checkpoint sirve de referencia para futuros agentes programadores.
> **No refleja ideas o documentos conceptuales anteriores — refleja código materializado.**

---

## Stack y configuración base

- **Framework:** Next.js 14 App Router (`'use client'` en páginas interactivas)
- **Base de datos:** Supabase (PostgreSQL), cliente browser vía `@supabase/ssr`
- **Estilos:** Tailwind CSS
- **Repo:** `redpatrimonio/redpatrimonio-v0.36`, rama `main`
- **Cliente Supabase:** `lib/supabase/client.ts` — factory `createBrowserClient` con vars de entorno `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Sistema de autenticación y roles

### `components/auth/AuthProvider.tsx`
- Contexto React global que expone: `user` (Supabase Auth User), `usuario` (perfil app), `loading`, `signOut`, `refreshProfile`
- Al iniciar sesión, hace query a tabla `usuarios_autorizados` filtrando por `id_usuario = auth.user.id`
- El objeto `usuario` contiene el campo `rol` que determina todos los accesos

### Roles activos (jerarquía ascendente)

| Rol | Acceso dashboard |
|---|---|
| `publico` | Solo mapa, reportar, mis-reportes, perfil |
| `experto` | + Revisar (rojos) |
| `partner` | + Aprobar (amarillos) + Publicados |
| `founder` | Todo + Panel Usuarios |

### Helpers de rol (`lib/utils/role.ts`)
- `esExpertoOMas(rol)` → experto, partner, founder
- `esPartnerOMas(rol)` → partner, founder
- `esFounder(rol)` → solo founder

### Tabla `usuarios_autorizados`
Campos relevantes: `id_usuario`, `nombre_completo`, `email`, `rol`, `telefono`

---

## Tablas Supabase principales

### `reportes_nuevos` — tabla central del flujo

Columnas confirmadas por lectura de código:

```
id_reporte, nombre_reporte,
latitud, longitud,
region, comuna, descripcion_ubicacion,
categoria_general, tipologia_especifica (text[]),
cultura_asociada, periodo_cronologico,
estado_conservacion, tipo_riesgo_principal,
nivel_proteccion, nivel_acceso,
amenazas, recinto_privado (bool),
estado_validacion,           ← 'rojo' | 'amarillo' | 'verde'
timestamp_creado, timestamp_publicacion,
-- Accesibilidad (v0.4)
origen_acceso,               ← 'publico' | 'privado'
nivel_accesibilidad,         ← 'abierto' | 'controlado' | 'protegido' | 'restringido'
codigo_accesibilidad,        ← calculado al publicar ('A' | 'B' | 'C')
imagen_url,                  ← imagen principal legacy
-- Contacto — comunes
autor_reporte, id_usuario, telefono_usuario_contacto,
contacto_propietario_posible (bool), contacto_propietario_info,
-- Contacto — solo riesgo
es_anonimo (bool), autoriza_contacto (bool),
correo_usuario_contacto,
temporalidad_riesgo,         ← 'pasado' | 'activo' | 'inminente'
-- Publicación
id_usuario_publico,          ← quien publicó (founder/partner)
id_usuario_solicitante       ← (referenciado en solicitudes_contacto)
```

**Discriminador hallazgo/riesgo:** `categoria_general = 'arqueologia_en_riesgo'`

### `reportes_medios` — archivos multimedia

```
id_medio, id_reporte (FK),
url_publica, descripcion_imagen,
tipo_medio, prioridad_visualizacion (int)
```

- La foto con mayor `prioridad_visualizacion` es la principal
- Usado en todas las vistas lista (thumbnail) y detalle (galería)

### `solicitudes_contacto`

```
id_solicitud, id_sitio (FK → reportes_nuevos),
id_usuario_solicitante (FK → usuarios_autorizados),
id_usuario_revisor,
motivo_solicitud, info_adicional_solicitante,
estado,                      ← 'pendiente' | 'aprobada' | 'rechazada'
timestamp_solicitud, timestamp_respuesta,
notas_rechazo
```

### `info_contacto_sitios`

```
id_sitio (FK), nombre_contacto, email_contacto,
telefono_contacto, organizacion, info_adicional
```

- Se crea al aprobar una solicitud de contacto (modal `AgregarInfoContactoModal`)

---

## Flujo de reportes — pipeline de validación

```
[Usuario público] → /reportar → INSERT reportes_nuevos (estado: 'rojo')
        ↓
[Experto/Partner/Founder] → /dashboard/revisar
  - Lista todos los reportes con estado_validacion = 'rojo'
  - Puede editar campos de caracterización
  - Acción: UPDATE estado_validacion → 'amarillo'
        ↓
[Partner/Founder] → /dashboard/aprobar
  - Lista todos los reportes con estado_validacion = 'amarillo'
  - Puede editar campos de caracterización + accesibilidad (v0.4)
  - Al publicar: calcula codigo_accesibilidad, setea timestamp_publicacion, id_usuario_publico
  - Acción: UPDATE estado_validacion → 'verde'
        ↓
[Mapa público] → muestra solo reportes verde con codigo A/B/C según rol del viewer
```

---

## Dashboard — Rutas implementadas (estado CP_001)

```
app/
  dashboard/
    revisar/
      page.tsx         ← lista rojos, acceso: experto+
      [id]/
        page.tsx       ← detalle editable + botón → amarillo
    aprobar/
      page.tsx         ← lista amarillos, acceso: partner+
      [id]/
        page.tsx       ← detalle editable + accesibilidad v0.4 + botón → verde (publicar)
```

> **Nota:** Las rutas `/dashboard/publicados` y `/dashboard/publicados/[id]` NO existen en CP_001 — fueron creadas en el hilo del CP_002.

---

## Detalle técnico: `revisar/page.tsx`

- Query: `reportes_nuevos` WHERE `estado_validacion = 'rojo'` ORDER BY `timestamp_creado DESC`
- Por cada reporte: query adicional a `reportes_medios` para obtener thumbnail (limit 1, max `prioridad_visualizacion`)
- UI: cards con foto, nombre, categoría, región, comuna, fecha, badge ROJO
- Click → navega a `/dashboard/revisar/[id_reporte]`
- **Sin paginación** — carga todos los rojos

## Detalle técnico: `revisar/[id]/page.tsx`

- Query: `reportes_nuevos` SELECT `*` WHERE `id_reporte = id`
- Query adicional: `reportes_medios` SELECT `*` WHERE `id_reporte = id` ORDER BY `prioridad_visualizacion DESC`
- Formulario **editable** con secciones: Quién reportó (solo lectura), Galería fotos, Ubicación, Caracterización, Estado y Conservación, Observaciones
- Campos de contacto son **solo lectura** — no se guardan en `handleGuardar`
- `handleGuardar`: UPDATE campos de caracterización (NO contacto, NO coordenadas)
- `handleAprobar`: UPDATE `estado_validacion → 'amarillo'`, redirige a lista
- Usa constantes de `lib/constants/tipologias`: `CATEGORIAS`, `TIPOLOGIAS`, `CULTURAS`, `PERIODOS`, `ESTADO_CONSERVACION`
- Banner rojo RIESGO condicional si `categoria_general === 'arqueologia_en_riesgo'`

## Detalle técnico: `aprobar/page.tsx`

- Idéntico a `revisar/page.tsx` pero filtra `estado_validacion = 'amarillo'`
- Acceso restringido: solo `partner` y `founder` (revisar permite además `experto`)
- **Diferencia CP_001 vs CP_002:** En CP_001 NO tiene el botón "✓ Publicados" — ese fue agregado en CP_002

## Detalle técnico: `aprobar/[id]/page.tsx`

- Igual que `revisar/[id]` en estructura base + **sección "Control de Accesibilidad v0.4"** (ya presente en CP_001)
- Campos adicionales: `origen_acceso`, `nivel_accesibilidad` (de `lib/constants/accesibilidad`)
- `handlePublicar`: valida campos obligatorios, calcula `codigo_accesibilidad` via `calcularCodigoAccesibilidad()`, setea `timestamp_publicacion`, `id_usuario_publico`, UPDATE `estado_validacion → 'verde'`
- `nivel_acceso` está en la UI pero marcado como **"(deprecado)"** y deshabilitado
- Usa `lib/utils/accesibilidad.ts`: `calcularCodigoAccesibilidad(origen, nivel)` → 'A' | 'B' | 'C'

---

## Sistema de capas del mapa

### `app/mapa/page.tsx`
- Wrapper minimalista: importa `MapView` con `dynamic` (SSR desactivado)
- Contenedor: `h-[calc(100vh-8rem)]` mobile / `h-[calc(100vh-4rem)]` desktop

### `components/map/MapView.tsx` (componente principal ~14KB)
Orquesta todas las capas. Contiene lógica de:
- Capas activas (estado toggle)
- Nivel de zoom actual
- Rol del usuario (para filtrar visibilidad)

### Componentes de capa activos

| Archivo | Qué renderiza |
|---|---|
| `SitiosMaster.tsx` | Capa arqueológica — lee tabla `sitios_master` |
| `CapasNoArqueologicas.tsx` | Capas turísticas, memoria, geografía — lee tabla `lugares_capas` |
| `ToggleCapas.tsx` | Panel UI para activar/desactivar capas |
| `IconosCapas.ts` | Definición de iconos SVG por tipo de capa |

### Fuentes de datos del mapa (tablas distintas)

```
sitios_master     → sitios arqueológicos curados (ingresados por agente investigador)
lugares_capas     → lugares turísticos, memoria invisible, geografía, comercial
reportes_nuevos   → (verde) reportes ciudadanos aprobados
```

> **Crítico para futuros scripts:** `reportes_nuevos` con `estado_validacion = 'verde'` alimenta el mapa público. Los reportes aprobados aparecen como puntos con código A/B/C que determina su visibilidad según rol del viewer.

### Lógica de visibilidad por código A/B/C

- **A** (abierto/controlado): Visible para todos, punto preciso, verde oscuro
- **B** (protegido): Área difusa ~300m para público; coordenada precisa para expertos+
- **C** (restringido): Solo visible para expertos y roles superiores

---

## Otras rutas de la app (estado CP_001)

```
app/
  (auth)/              ← login/registro (Supabase Auth)
  page.tsx             ← home/landing
  mapa/page.tsx        ← mapa principal
  reportar-inicio/     ← selector hallazgo vs riesgo
  reportar/            ← formulario crowdsourcing
  mis-reportes/        ← historial reportes del usuario
  perfil/page.tsx      ← perfil + panel control + solicitudes contacto
  panel-usuarios/      ← gestión usuarios (founder only)
  sitio/               ← ficha pública de sitio (sitios_master)
  resguardos/          ← sección resguardos
  mas/                 ← sección "más"
  api/                 ← API routes Next.js
  privacidad/          ← página legal
  terminos/            ← página legal
```

---

## Sistema de solicitudes de contacto (en `/perfil`)

Flujo implementado en `app/perfil/page.tsx`:
1. Usuario solicita contacto de un sitio → INSERT `solicitudes_contacto` (estado: `pendiente`)
2. Partner/Founder ve solicitudes en `/perfil` → modal `AgregarInfoContactoModal` → INSERT `info_contacto_sitios` + UPDATE `solicitudes_contacto.estado → 'aprobada'`
3. Solicitante ve su solicitud aprobada → botón "Ver" → modal muestra datos de `info_contacto_sitios`

---

## Constantes de dominio

### `lib/constants/tipologias.ts`
- `CATEGORIAS`: lista categorías generales de sitios
- `TIPOLOGIAS`: objeto keyed por categoría → array tipologías
- `CULTURAS`: culturas precolombinas/históricas
- `PERIODOS`: periodos cronológicos
- `ESTADO_CONSERVACION`: estados posibles

### `lib/constants/accesibilidad.ts`
- `ORIGEN_ACCESO`: `['publico', 'privado']`
- `NIVEL_ACCESIBILIDAD`: `['abierto', 'controlado', 'protegido', 'restringido']`

### `lib/utils/accesibilidad.ts`
```
calcularCodigoAccesibilidad(origen, nivel):
  abierto | controlado → 'A'
  protegido            → 'B'
  restringido          → 'C'
```

---

## Patrones de código a mantener

- Toda página con estado usa `'use client'` + hooks
- Guard de rol siempre en `useEffect` + redirect a `/perfil` si no autorizado
- `createClient()` se instancia a nivel de módulo (fuera del componente) — un cliente por módulo
- `select('*')` para detalle de reporte — no hay query builder tipado aún
- Sin paginación en ninguna lista — pendiente cuando el volumen crezca
- Sin React Query ni SWR — todo con `useState` + `useEffect` manual
- Fotos: se cargan por separado de los reportes (loop individual por reporte en listas)

---

## Lo que NO existe en CP_001 (creado en CP_002)

- `app/dashboard/publicados/page.tsx`
- `app/dashboard/publicados/[id]/page.tsx`
- Botón "✓ Publicados" en `aprobar/page.tsx`
- Bloque "👤 Quién reportó" en `revisar/[id]/page.tsx`

---

*Generado leyendo código real del repo. Fecha de corte: 2026-05-02.*
