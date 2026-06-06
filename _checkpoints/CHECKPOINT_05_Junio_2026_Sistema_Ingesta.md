# CHECKPOINT — Sistema de Ingesta de Sitios via Agente IA
**Fecha:** 5 de junio 2026  
**Repo:** [redpatrimonio/redpatrimonio-v0.36](https://github.com/redpatrimonio/redpatrimonio-v0.36)  
**Checkpoint anterior:** `CHECKPOINT_04_Abril_2026_Mapa_Ficha.md`

---

## 1. Contexto y objetivo de esta etapa

El objetivo de esta etapa es construir un **flujo completo de ingesta masiva de sitios patrimoniales**, donde un agente de IA (cualquier LLM usando las instrucciones del extractor) procesa un PDF de fuente patrimonial, extrae los sitios uno a uno, completa los datos faltantes consultando la web o preguntando al usuario, y entrega un JSON listo para ser **revisado y publicado desde el panel de administración de la app**.

Este flujo es distinto al formulario ciudadano (`reportes_nuevos`) — es un proceso **técnico, interno, masivo**, para poblar la base de datos con fuentes bibliográficas, inventarios y fichas existentes.

---

## 2. Arquitectura del sistema — estado actual confirmado

### 2.1 Dos tablas de destino en Supabase

El tipo de registro determina a qué tabla va cada sitio:

| Tipo de registro | Tabla destino en Supabase | Notas |
|---|---|---|
| `arqueologico` | `sitios_master` | Campo `capa_destino = 'arqueologico'` |
| `memoria` | `sitios_master` | Campo `capa_destino = 'memoria'` |
| `geografico` | `lugares_capas` | Campo `capa` (ENUM) |
| `turistico` | `lugares_capas` | Campo `capa` (ENUM) |
| `comercial` | `lugares_capas` | Campo `capa` (ENUM) |
| `lugarinteres` | `lugares_capas` | Campo `capa` (ENUM) |
| `museo` | `lugares_capas` | Campo `capa` (ENUM) |

### 2.2 Campos obligatorios reales (NOT NULL sin default)

**`sitios_master`:**
- `nombre_sitio` (text)
- `latitud` (double)
- `longitud` (double)
- *(El resto de NOT NULL tienen defaults: `estado_validacion = 'pendiente'`, `origen_acceso = 'publico'`, etc.)*

**`lugares_capas`:**
- `nombre` (text)
- `latitud` (double)
- `longitud` (double)
- `capa` (ENUM — valor del tipo de registro)

### 2.3 Campos con default que actúan como estado de flujo

Estos campos no hay que enviarlos, se asignan solos y son la base del flujo de revisión:

| Campo | Tabla | Default | Significado |
|---|---|---|---|
| `estado_validacion` | `sitios_master` | `'pendiente'` | Bandeja de revisión |
| `estado` | `lugares_capas` | `'pendiente'` | Bandeja de revisión |
| `es_premium` | `lugares_capas` | `false` | No se cobra por defecto |
| `zoom_minimo` | `lugares_capas` | `8` | Visible desde zoom 8 |

### 2.4 Lo que NO es la bandeja de ingesta

`reportes_nuevos` es el flujo **ciudadano de denuncia**. Tiene campos como `rut_denunciante`, `infractor_nombre`, `obra_actividad`. **No se usa para ingesta técnica.** No mezclar.

---

## 3. Componentes del sistema — estado actual de cada pieza

### 3.1 Instrucciones del agente extractor (`instrucciones_agente_extractor.md`)
- **Estado:** ✅ Existe, funciona conceptualmente
- **Problemas detectados:**
  - El output actual está especificado como **CSV**, pero el flujo de la app necesita **JSON**
  - Los nombres de campos del CSV no coinciden exactamente con los nombres de columna en Supabase (ej. `culturaperiodo` vs `cultura_asociada` + `periodo_cronologico` separados)
  - El campo `tipoderegistro` del CSV no tiene un mapeo explícito a `capa_destino` (sitios_master) ni a `capa` (lugares_capas)
  - No distingue explícitamente qué campos son solo para `sitios_master` y cuáles son solo para `lugares_capas`

### 3.2 Plantilla CSV (`plantilla_ingesta.csv`)
- **Estado:** ✅ Existe como cabecera de 15 campos
- **Problemas detectados:**
  - Campos insuficientes para cubrir ambas tablas
  - Falta columna `subcategoria` (requerida por `lugares_capas`)
  - `cultura_asociada` y `periodo_cronologico` deben ser columnas separadas
  - Ausencia de campos de control del flujo (`origen_ingesta`, `id_lote`)

### 3.3 Panel de revisión / publicación en la app
- **Estado:** ❌ No existe todavía
- Hay rutas de reportes ciudadanos (`/mis-reportes`, `/reportar`) pero no hay interfaz para revisar y aprobar registros ingresados por el agente

### 3.4 Endpoint / API de recepción del JSON
- **Estado:** ❌ No existe todavía
- No hay ruta en el app que reciba el JSON del agente y lo inserte en Supabase

---

## 4. Mapa de campos — plantilla canónica

Esta es la cabecera JSON canónica que el agente debe producir, mapeada 1:1 con las tablas de Supabase:

### Campos universales (aplican a todos los tipos)

| Campo en JSON | Columna en Supabase | Tabla | Obligatorio | Notas |
|---|---|---|---|---|
| `tipo_registro` | `capa_destino` / `capa` | ambas | ✅ | Determina la tabla de destino |
| `nombre_sitio` | `nombre_sitio` / `nombre` | ambas | ✅ | Nombre principal del lugar |
| `latitud` | `latitud` | ambas | ✅ | Decimal, ej. -33.4567 |
| `longitud` | `longitud` | ambas | ✅ | Decimal, ej. -70.6543 |
| `region` | `region` | ambas | — | Nombre de región |
| `comuna` | `comuna` | ambas | — | Nombre de comuna |
| `descripcion` | `descripcion_ubicacion` / `descripcion` | ambas | — | Texto libre |
| `url_imagen` | `imagen_url` / `url_imagen` | ambas | — | URL de imagen representativa |

### Campos exclusivos de `sitios_master` (arqueologico / memoria)

| Campo en JSON | Columna en Supabase | Obligatorio | Notas |
|---|---|---|---|
| `categoria_general` | `categoria_general` | — | Ej. "sitio rupestre" |
| `tipologia_especifica` | `tipologia_especifica` | — | Array, ej. ["petroglifo","geoglifo"] |
| `cultura_asociada` | `cultura_asociada` | — | Ej. "Inka", "Atacameño" |
| `periodo_cronologico` | `periodo_cronologico` | — | Ej. "Período Intermedio Tardío" |
| `estado_conservacion` | `estado_conservacion` | — | bueno/regular/malo/destruido |
| `nivel_proteccion` | `nivel_proteccion` | — | MN/ZT/sin_proteccion |
| `tipo_riesgo_principal` | `tipo_riesgo_principal` | — | Texto |
| `recinto_privado` | `recinto_privado` | — | true/false |
| `nivel_accesibilidad` | `nivel_accesibilidad` | — | abierto/restringido/cerrado |
| `codigo_accesibilidad` | `codigo_accesibilidad` | — | A1/A2/B1/B2/C1/C2 |
| `condicion_emplazamiento` | `condicion_emplazamiento` | — | Texto |
| `tipo_propiedad` | `tipo_propiedad` | — | fiscal/privado/municipal |
| `uso_suelo_actual` | `uso_suelo_actual` | — | Texto |
| `cronologia_general` | `cronologia_general` | — | Texto libre |

### Campos exclusivos de `lugares_capas` (turistico / geografico / etc.)

| Campo en JSON | Columna en Supabase | Obligatorio | Notas |
|---|---|---|---|
| `subcategoria` | `subcategoria` | — | Ej. "mirador", "museo" |
| `url_externo` | `url_externo` | — | Web oficial del lugar |
| `horario_visita` | `horario_visita` | — | Texto libre |
| `tarifa_visita` | `tarifa_visita` | — | Texto libre |
| `contacto` | `contacto` | — | Email/teléfono |

### Campos de control del lote (no van a BD, los gestiona la app)

| Campo | Uso |
|---|---|
| `origen_ingesta` | Nombre del PDF o fuente de origen |
| `id_lote` | UUID generado por la app para agrupar registros del mismo proceso |
| `notas_agente` | Observaciones del agente sobre campos dudosos o inferidos |

---

## 5. Flujo completo de ingesta — paso a paso

```
[PDF fuente]
     │
     ▼
[Agente IA usa instrucciones_agente_extractor.md]
     │  - Lee el PDF
     │  - Extrae sitios uno a uno
     │  - Pregunta coordenadas si no están
     │  - Busca en web datos faltantes
     │  - Produce JSON con estructura canónica
     ▼
[Usuario pega/sube el JSON en app]
     │  Ruta: /admin/ingesta  (POR CONSTRUIR)
     │
     ▼
[Panel de previsualización del lote]
     │  - Muestra lista de sitios del JSON
     │  - Permite editar campos individualmente
     │  - Valida campos obligatorios
     │  - Detecta duplicados potenciales
     ▼
[Revisión y aprobación]
     │  - Aprobar uno a uno o en bloque
     │  - El mapper rutea cada registro a la tabla correcta:
     │      tipo arqueologico/memoria → sitios_master
     │      tipo turistico/geografico/etc → lugares_capas
     │  - estado_validacion = 'pendiente' → 'publicado'
     ▼
[Registro visible en el mapa de la app]
```

---

## 6. Tareas de esta etapa — en orden de ejecución

### TAREA 1 — Corregir documentos del agente extractor
- [ ] Actualizar `instrucciones_agente_extractor.md`:
  - Cambiar output de CSV a **JSON**
  - Especificar estructura JSON con los campos canónicos de la Sección 4
  - Añadir instrucción para distinguir campos según tipo de registro
  - Añadir instrucción para generar `notas_agente` con observaciones
  - Añadir instrucción para incluir `origen_ingesta` como nombre del PDF
- [ ] Reemplazar `plantilla_ingesta.csv` por `plantilla_ingesta_ejemplo.json`:
  - Separar `cultura_asociada` y `periodo_cronologico`
  - Añadir todos los campos de la Sección 4
  - Incluir un sitio de ejemplo completo tipo arqueológico y uno tipo turístico

**Archivos a modificar:**
- `instrucciones_agente_extractor.md`
- `plantilla_ingesta.csv` → reemplazar por `plantilla_ingesta_ejemplo.json`

---

### TAREA 2 — Ruta de ingesta en la app (`/admin/ingesta`)
- [ ] Crear ruta `app/admin/ingesta/page.tsx`
- [ ] Componente de upload/paste del JSON del agente
- [ ] Validador de estructura JSON (verificar campos obligatorios por tipo)
- [ ] Vista previa del lote en tabla editable
- [ ] Detección de duplicados contra sitios existentes (por nombre + coordenadas aproximadas)

**Archivos a crear:**
- `app/admin/ingesta/page.tsx`
- `components/ingesta/JsonUploader.tsx`
- `components/ingesta/LotePreview.tsx`
- `components/ingesta/SitioIngesta.tsx`
- `lib/ingesta/validator.ts`
- `lib/ingesta/duplicateChecker.ts`

---

### TAREA 3 — Mapper y escritura en Supabase
- [ ] Función `mapearRegistroASitiosMaster(registro)` → transforma JSON a shape de `sitios_master`
- [ ] Función `mapearRegistroALugaresCapa(registro)` → transforma JSON a shape de `lugares_capas`
- [ ] Función `insertarLote(registros[])` → inserta lote completo con manejo de errores por registro
- [ ] El `tipo_registro` del JSON determina qué mapper y qué tabla usar

**Archivos a crear:**
- `lib/ingesta/mapper.ts`
- `lib/ingesta/insertarLote.ts`

---

### TAREA 4 — Panel de revisión de pendientes
- [ ] Ruta `app/admin/pendientes/page.tsx`
- [ ] Query: `SELECT * FROM sitios_master WHERE estado_validacion = 'pendiente'`
- [ ] Query: `SELECT * FROM lugares_capas WHERE estado = 'pendiente'`
- [ ] Componente de tarjeta de sitio pendiente con botones: Aprobar / Rechazar / Editar
- [ ] Acción de aprobación: actualiza `estado_validacion → 'publicado'` / `estado → 'publicado'`
- [ ] Filtro por origen_ingesta para revisar un lote completo

**Archivos a crear:**
- `app/admin/pendientes/page.tsx`
- `components/admin/TarjetaPendiente.tsx`
- `lib/admin/aprobarSitio.ts`

---

### TAREA 5 — Protección de rutas de admin
- [ ] Verificar que `/admin/**` esté protegido en `middleware.ts` para usuarios con rol `admin`
- [ ] Confirmar que el rol `admin` existe en `usuarios_autorizados` en Supabase
- [ ] Si no existe el campo de rol, añadirlo con migración

---

### TAREA 6 — Test de flujo completo
- [ ] Elegir un PDF real de fuente patrimonial (ej. inventario CMN, ficha FONDART)
- [ ] Correr el agente extractor con el PDF de prueba
- [ ] Pegar el JSON resultante en `/admin/ingesta`
- [ ] Revisar y publicar desde `/admin/pendientes`
- [ ] Verificar que los sitios aparecen en el mapa

---

## 7. Decisiones técnicas pendientes (a confirmar antes de programar)

| Decisión | Opciones | Estado |
|---|---|---|
| ¿El JSON del agente llega por paste o por upload de archivo? | Ambas | ❓ Confirmar preferencia |
| ¿`tipologia_especifica` en `sitios_master` es texto separado por comas o array JSON? | Array JSON (`text[]`) | ✅ Confirmado en Supabase |
| ¿`lugares_capas.capa` es un ENUM definido en Supabase? ¿Cuáles son los valores válidos? | Sí, ENUM USER-DEFINED | ❓ Falta revisar los valores del ENUM |
| ¿La detección de duplicados es automática o solo un aviso? | Solo aviso, decisión humana | Por definir |
| ¿El agente puede subir imágenes al Storage de Supabase o solo URLs externas? | Solo URLs por ahora | Por definir |
| ¿Se registra el nombre del usuario que aprueba cada sitio? | Campos `id_usuario_reviso` y `timestamp_revision` existen en `sitios_master` | ✅ Ya está en el esquema |

---

## 8. Notas sobre la tabla `sitios_master` — descalces detectados

1. **Columna duplicada de tipologías:** existe tanto `tipologia_especifica` (ARRAY) como `tipologias` (ARRAY). Hay que decidir cuál usar y deprecar la otra, o entender si tienen roles distintos.
2. **`capa_destino` vs `categoria_sitio`:** hay dos campos que podrían cumplir el rol de "tipo de registro" dentro de `sitios_master`. Hay que confirmar cuál es el campo canónico para distinguir arqueológico de memoria.
3. **Timestamps mixtos:** `timestamp_revision` y `timestamp_publicacion` son `timestamp without time zone` mientras que `timestamp_creado` es `timestamp with time zone`. Inconsistencia menor, no urgente pero a corregir.

---

## 9. Archivos clave del sistema de ingesta

| Archivo | Ubicación | Propósito |
|---|---|---|
| `instrucciones_agente_extractor.md` | `/_checkpoints/` | Instrucciones para el agente IA |
| `plantilla_ingesta_ejemplo.json` | `/_checkpoints/` | Ejemplo de JSON válido |
| `app/admin/ingesta/page.tsx` | `/app/admin/ingesta/` | Ruta de carga del JSON (POR CREAR) |
| `app/admin/pendientes/page.tsx` | `/app/admin/pendientes/` | Panel de revisión (POR CREAR) |
| `lib/ingesta/mapper.ts` | `/lib/ingesta/` | Mapper JSON → tablas Supabase (POR CREAR) |
| `lib/ingesta/validator.ts` | `/lib/ingesta/` | Validador de estructura JSON (POR CREAR) |
| `lib/ingesta/insertarLote.ts` | `/lib/ingesta/` | Inserción masiva en Supabase (POR CREAR) |

---

## 10. Orden de trabajo recomendado

1. **Primero los documentos del agente** (Tarea 1) — porque definen el contrato de datos. Si el JSON cambia después, todo lo demás cambia.
2. **Segundo, revisar los valores del ENUM `capa`** en Supabase — para confirmar los tipos válidos antes de escribir código.
3. **Tercero, el mapper** (Tarea 3) — sin él, no se puede construir nada en la app.
4. **Cuarto, la ruta de ingesta** (Tarea 2) — la interfaz para pegar/subir el JSON.
5. **Quinto, el panel de pendientes** (Tarea 4) — la interfaz de revisión.
6. **Sexto, protección de rutas** (Tarea 5) — antes del test real.
7. **Séptimo, test completo** (Tarea 6) — con un PDF real.

---

*Checkpoint creado en sesión de trabajo del 5 de junio 2026.*  
*Próximo checkpoint al completar Tareas 1-3.*
