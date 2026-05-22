# CP_006 — Formularios Reportar: Hallazgo y Riesgo
**Fecha:** 22 mayo 2026  
**Estado:** ✅ Completo  
**Commit de cierre:** `3e9b2c6`

---

## Contexto

Este checkpoint consolida el trabajo realizado sobre los dos flujos de reporte ciudadano de la app. Ambos flujos graban en la misma tabla `reportes_nuevos` en Supabase y se diferencian por el campo `categoria_general`.

---

## 1. Flujo Reportar Hallazgo (`app/reportar/hallazgo`)

### Arquitectura resultante
- **Orquestador:** `app/reportar/hallazgo/page.tsx` — solo maneja estado global y paso a paso
- **5 steps separados** en `components/reportar/`:
  - `StepUbicacion.tsx` — mapa + GPS + coordenadas manuales + geocoding inverso (Nominatim)
  - `StepCaracterizacion.tsx` — tipo de sitio, tipología, cultura, cronología, acceso
  - `StepEstado.tsx` — estado de conservación, riesgos, protección
  - `StepFotos.tsx` / `StepMultimedia.tsx` — upload de imágenes a `reportes-medios`
- **Componentes UI compartidos:** `StepWrapper`, `StepButton` (en `components/ui/`)
- **Tokens de estilo:** `lib/ui/stepStyles.ts` (CSS vars del sistema)

### Problemas resueltos
| Problema | Solución |
|---|---|
| `page.tsx` monolítico (~37KB) ilegible | Extracción en 5 steps independientes |
| Hardcoded Tailwind + colores hex | Reemplazado por `var(--accent)`, `var(--text)`, etc. |
| Botón GPS: ícono centrado (se ve raro) | Ícono anclado izquierda, texto centrado con `flex:1` |
| Texto "(ej. desde GPS Garmin)" visible | Eliminado del label de coordenadas manuales |
| Tipografía inconsistente con el resto de la app | Títulos en Cormorant Garamond 300, labels en DM Sans |
| Inputs sin estado focus visual | `onFocus/onBlur` con `S.inputFocus` / `S.inputBlur` |

### Geocoding inverso (StepUbicacion)
- Al hacer clic en el mapa o usar GPS, se llama a Nominatim para obtener región y comuna automáticamente
- `normalizarRegion()` mapea los nombres largos del CMN a los valores cortos del sistema
- Los selects de región/comuna usan `REGIONES` y `COMUNAS` de `lib/constants/tipologias`

---

## 2. Flujo Reportar Riesgo (`app/reportar/riesgo`)

### Arquitectura resultante
- **Un solo archivo:** `app/reportar/riesgo/page.tsx` — flujo ciudadano compacto, 4 pasos en un archivo
- Diseño intencionalmente más simple y conversacional que el flujo de hallazgo
- **MapPicker** desde `components/map/MapPicker` (distinto al de hallazgo)

### Estructura de los 4 pasos
| Paso | Contenido |
|---|---|
| 1 — Identidad | Anónimo / Personal-Comunidad, datos de contacto opcionales, autoriza contacto |
| 2 — Situación | Temporalidad (ya ocurrió / activo / inminente), tipo de obra (chips CMN), descripción libre, infractor |
| 3 — Ubicación | Mapa interactivo, región, comuna, cómo se llega |
| 4 — Evidencia | Fotos (máx. 5), fecha observación, notas extra, resumen + confirmación |

### Campos que escribe en Supabase (`reportes_nuevos`)
```
categoria_general: 'arqueologia_en_riesgo'
tipo_riesgo_principal    — primer chip de obra seleccionado (value CMN)
temporalidad_riesgo      — pasado | activo | inminente
amenazas                 — descripcion + notasExtra concatenados
fecha_observacion
nombre_proyecto
infractor_conocido / infractor_nombre / infractor_contacto
es_anonimo / autoriza_contacto
correo_usuario_contacto / telefono_usuario_contacto
latitud / longitud / region / comuna / descripcion_ubicacion
estado_validacion: 'rojo'
nivel_acceso: 'Espacio Publico'
```
Fotos suben a bucket `reportes-medios` y se registran en tabla `reportes_medios`.

### Problemas resueltos
| Problema | Solución |
|---|---|
| Diseño visual desconectado del sistema (Tailwind + hex hardcoded) | Reemplazado por tokens CSS del sistema |
| Tipografía diferente al resto de la app | Títulos Cormorant Garamond 300, body DM Sans |
| Header con color hardcoded `#10454B` | Reemplazado por `var(--btn)` (antracita del sistema) |
| Logo RP sin coherencia visual | Fondo `rgba(143,181,164,0.15)` + color `var(--accent)` |
| Inputs/selects sin sistema de focus | `stepStyles` + `onFocus/onBlur` |
| Botones con colores inconsistentes (`#B6875D`, `#10454B`) | `S.btnPrimary` / `S.btnSecondary` |
| Cards de selección con colores hardcoded | `var(--accent)`, `var(--border-m)`, `var(--surface-2)` |
| **Lógica de negocio y BD** | **Sin tocar** |

---

## Sistema de estilos compartido

### `lib/ui/stepStyles.ts`
Tokens centralizados que usan todos los formularios:
- `input`, `textarea`, `select` + `inputFocus` / `inputBlur`
- `btnPrimary`, `btnSecondary`, `btnAction`, `btnRemove`
- `fieldLabel`, `fieldHint`, `required`
- `errorBox`, `successBox`, `loadingBox`, `infoBox`
- `stepTitle`, `stepSubtitle`, `dropZone`, `summaryBox`

### `globals.css` — variables relevantes
```css
--bg: #171614          /* fondo global */
--surface: #1D1B19     /* tarjetas */
--surface-2: #26231F   /* inputs, chips inactivos */
--accent: #8FB5A4      /* verde ceniza — UI activo */
--btn: #2A2724         /* antracita — headers oscuros */
--text: #DDE6E0
--muted: #7A8C82
--faint: #495249
--ladrillo: #A85040    /* error / riesgo */
--musgo: #4E8A60       /* validado */
--border-m: rgba(210,220,215,0.14)
```

---

## Pendiente (fuera de este checkpoint)
- Flujo de **Denuncia** (`app/reportar/denuncia` o similar) — mismos patrones, campos específicos de denuncia formal
- Flujo de **Revisión** — proceso interno, usa los mismos patrones UI pero distinto actor
- Página `/gracias` de riesgo — revisar coherencia visual (no tocada en esta sesión)
