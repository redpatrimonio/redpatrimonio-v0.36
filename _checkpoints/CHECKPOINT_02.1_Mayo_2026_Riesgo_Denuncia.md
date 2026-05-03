# CHECKPOINT 02.1 — Mayo 2026
## Reporte Riesgo (correcciones CMN) + Denuncia CMN (nuevo)

**Fecha:** 03 Mayo 2026  
**Rama:** main  
**Commit final:** `1979e97`  
**Agente:** Perplexity (sesión nocturna)

---

## Contexto de esta sesión

Esta sesión parte del estado dejado en el sprint anterior (Checkpoint 02, otro agente), donde ya existían:
- `app/dashboard/revisar/[id]/page.tsx`
- `app/dashboard/aprobar/page.tsx`
- `app/dashboard/publicados/page.tsx`
- `app/dashboard/publicados/[id]/page.tsx` — con botón "Generar denuncia CMN" en **placeholder** (`alert`)

La tarea era: corregir el formulario de reporte riesgo para alinear con la BD/CMN, y construir la página de denuncia conectada al botón.

---

## 1. Modificaciones — `app/reportar/riesgo/page.tsx`

### 1.1 TIPOS_OBRA — refactor crítico
**Antes:** array de strings (labels ciudadanos)  
**Después:** array de objetos `{ label: string, value: string }`

```typescript
const TIPOS_OBRA = [
  { label: 'Construcción / inmobiliaria', value: 'inmobiliario' },
  { label: 'Carretera / camino',          value: 'transporte' },
  { label: 'Agricultura / arado',         value: 'agropecuario' },
  { label: 'Minería',                     value: 'mineria' },
  { label: 'Extracción de áridos',        value: 'extraccion_aridos' },
  { label: 'Forestal',                    value: 'forestal' },
  { label: 'Portuario / acuicultura',     value: 'portuario' },
  { label: 'Sin obra visible',            value: 'sin_obra' },
  { label: 'No sé',                       value: 'indeterminado' },
]
```

- El ciudadano ve el `label` amigable en los chips
- La BD recibe el `value` (vocabulario controlado CMN)
- `tiposObra` guarda un array de `value`, no de `label`

### 1.2 Paso 2 — campos nuevos

**`nombre_proyecto`** (nuevo input):  
- Label: "¿Sabes el nombre del proyecto u obra?"  
- Placeholder: "ej: Loteo Cerro Norte, Proyecto minero La Estrella..."  
- Guarda en columna `nombre_proyecto` de `reportes_nuevos`

**Sección infractor colapsable** (nuevo bloque):  
- Checkbox "¿Sabes quién está causando el daño?"  
- Si se activa, despliega: `infractor_nombre` + `infractor_contacto` (texto libre)  
- Si se desactiva, limpia ambos campos  
- Estilo consistente con el resto del formulario (borde teal, fondo #e8f4f5)

### 1.3 handleSubmit — correcciones

| Campo BD | Antes | Después |
|---|---|---|
| `tipo_riesgo_principal` | label del chip | `value` CMN (ej: `inmobiliario`) |
| `amenazas` | concatenación con prefijos | solo texto libre del ciudadano (`descripcion` + `notasExtra`) |
| `fecha_observacion` | no se guardaba | columna propia |
| `nombre_proyecto` | no existía | columna propia |
| `infractor_conocido` | no existía | boolean |
| `infractor_nombre` | no existía | columna propia |
| `infractor_contacto` | no existía | columna propia |

### 1.4 Resumen (Paso 4)
- Tipo de obra se muestra con el `label` legible (no el value)
- Si hay infractor capturado, aparece en el resumen antes de enviar
- Fecha de observación aparece en el resumen si fue ingresada

---

## 2. Nuevo — `app/denuncia/[id]/page.tsx`

Página completamente nueva. Acceso: `/denuncia/[id_reporte]`

### Flujo
1. Carga `reportes_nuevos` por `id_reporte` + `reportes_medios`
2. Pre-llena todos los campos editables
3. Arqueólogo edita lo que falta
4. Dos acciones: **Guardar borrador** | **Exportar PDF**

### Pre-llenado automático

| Campo formulario | Fuente en BD |
|---|---|
| Tipo de proyecto | `tipo_riesgo_principal` → mapeado a lista CMN oficial via `TIPO_RIESGO_A_CMN` |
| Obra / actividad | `nombre_proyecto` |
| Nombre del proyecto | `nombre_proyecto` |
| Fecha del hecho | `fecha_observacion` (o `timestamp_creado` si no hay) |
| Descripción hechos | `amenazas` |
| Región | `region` |
| Comuna | `comuna` |
| Descripción ubicación | `descripcion_ubicacion` |
| Coordenadas | `latitud`, `longitud` |
| Infractor nombre | `infractor_nombre` (si `infractor_conocido = true`) |
| Infractor teléfono | `infractor_contacto` |
| Correo denunciante | `user.email` (sesión activa) |

### Mapeo tipo riesgo → CMN

```typescript
const TIPO_RIESGO_A_CMN: Record<string, string> = {
  inmobiliario:      'Inmobiliario',
  transporte:        'Transporte',
  agropecuario:      'Agropecuario',
  mineria:           'Minería',
  extraccion_aridos: 'Otro',
  forestal:          'Forestal',
  portuario:         'Portuario',
  sin_obra:          'Otro',
  indeterminado:     'Otro',
}
```

### Estructura del documento (secciones)
1. **I. Datos del denunciante** — nombre, RUT, profesión, correo, teléfono, domicilio
2. **II. Descripción del hecho** — tipo proyecto (select CMN), obra, nombre proyecto, fecha, descripción libre
3. **III. Ubicación** — región, comuna, descripción lugar, coordenadas WGS84
4. **IV. Presunto infractor** — nombre/razón social, RUT, domicilio, teléfono, correo
5. **V. Registro fotográfico** — grilla 2 columnas con fotos del reporte
6. **Firma + timbre** — líneas en blanco para firma manuscrita

### Guardar borrador
Actualiza `reportes_nuevos` con los campos que el arqueólogo pudo haber editado:
- `nombre_proyecto`, `infractor_nombre`, `infractor_contacto`, `amenazas`

### Exportar PDF
`window.print()` con CSS `@media print` que:
- Oculta la barra de acciones (clase `.no-print`)
- Limpia box-shadow y fondo
- Muestra bordes simples en inputs/textareas

---

## 3. Modificación — `app/dashboard/publicados/[id]/page.tsx`

**Solo cambió el `onClick` del botón generar:**

```typescript
// ANTES
onClick={() => alert('🛠️ Próximamente: ' + (esRiesgo ? 'Generar denuncia CMN' : '...'))}

// DESPUÉS
onClick={() =>
  esRiesgo
    ? router.push(`/denuncia/${reporte.id_reporte}`)
    : alert('🛠️ Próximamente: Generar ficha de registro')
}
```

- Riesgo → navega a `/denuncia/[id]` ✅  
- Hallazgo → sigue con alert placeholder ⬜ (pendiente ficha registro)

---

## 4. Estado del módulo dashboard completo

```
app/dashboard/
├── revisar/[id]/page.tsx     ✅ bloque contacto + banner riesgo
├── aprobar/page.tsx          ✅ 
├── publicados/page.tsx       ✅ tabs Todos/Hallazgos/Riesgo
└── publicados/[id]/page.tsx  ✅ botón riesgo conectado

app/reportar/
└── riesgo/page.tsx           ✅ formulario 4 pasos, campos CMN correctos

app/denuncia/
└── [id]/page.tsx             ✅ NUEVO — documento editable + PDF
```

---

## 5. Columnas que deben existir en `reportes_nuevos`

Estas columnas fueron añadidas en sesiones anteriores o deben verificarse:

| Columna | Tipo | Notas |
|---|---|---|
| `fecha_observacion` | date o timestamptz | ingresada por ciudadano en Paso 4 |
| `nombre_proyecto` | text | nombre del proyecto/obra |
| `infractor_conocido` | boolean | default false |
| `infractor_nombre` | text | nullable |
| `infractor_contacto` | text | texto libre, nullable |

> ⚠️ Si alguna no existe en la BD, el INSERT en `/reportar/riesgo` fallará silenciosamente o lanzará error. Verificar con `SELECT column_name FROM information_schema.columns WHERE table_name = 'reportes_nuevos'` antes de probar.

---

## 6. Pendiente próximo sprint

- [ ] `app/denuncia/[id]` — agregar `middleware.ts` o guard de rol (solo `partner`/`founder` deberían acceder)
- [ ] Ficha de registro hallazgo (`app/ficha/[id]/page.tsx`) — mismo patrón que denuncia pero con campos distintos
- [ ] Botón "Generar ficha registro" en `publicados/[id]` conectado cuando esté lista
- [ ] Considerar tabla separada `denuncias` para tracking (estado, fecha envío CMN, respuesta)

---

## 7. Convenciones establecidas (no cambiar sin consenso)

- Color primario: `#10454B` (teal oscuro)
- Color acción secundaria (botón enviar): `#B6875D` (terracota)
- Fondo app: `#f2f5f6`
- Fondo card seleccionada: `#e8f4f5`
- Border seleccionado: `#10454B`
- Roles con acceso al dashboard: `['partner', 'founder']`
- `categoria_general = 'arqueologia_en_riesgo'` distingue riesgo vs hallazgo en toda la app
- `estado_validacion`: `'rojo'` (ciudadano) → `'amarillo'` (revisado) → `'verde'` (publicado)
