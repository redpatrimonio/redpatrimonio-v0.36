# CHECKPOINT — Sistema de Ingesta de Sitios via Agente IA
**Fecha última actualización:** 7 de junio 2026  
**Fecha creación:** 5 de junio 2026  
**Repo:** [redpatrimonio/redpatrimonio-v0.36](https://github.com/redpatrimonio/redpatrimonio-v0.36)  
**Checkpoint anterior:** `CHECKPOINT_04_Abril_2026_Mapa_Ficha.md`

---

## ⚠️ Decisiones tomadas el 7 de junio 2026 (actualizan el checkpoint anterior)

| Decisión | Valor anterior | Valor definitivo |
|---|---|---|
| Formato de output del agente | JSON | **CSV** |
| Formato de carga en la app | JSON | **CSV** |
| Campo `codigo_accesibilidad` | A / B / C / pendiente | **A / B / C únicamente** |
| Separador interno de `tipologias` | coma | **pipe `\|`** |
| Campos `cultura_asociada` y `periodo_cronologico` | unidos como `cultura_periodo` | **separados en dos columnas** |
| Ubicación del kit de ingesta | `/_checkpoints/` | **`/_kit_ingesta/`** |

---

## 1. Contexto y objetivo de esta etapa

El objetivo es construir un **flujo completo de ingesta masiva de sitios patrimoniales**, donde un agente de IA procesa un documento fuente (PDF, texto, tabla, video u otro), extrae los sitios uno a uno, completa los datos faltantes consultando la web o preguntando al usuario, y entrega un **CSV listo para ser revisado y publicado desde el panel de administración de la app**.

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

### 2.2 Campos obligatorios reales (NOT NULL sin default)

**`sitios_master`:**
- `nombre_sitio` (text)
- `latitud` (double)
- `longitud` (double)

**`lugares_capas`:**
- `nombre` (text)
- `latitud` (double)
- `longitud` (double)
- `capa` (ENUM)

### 2.3 Campos con default que actúan como estado de flujo

| Campo | Tabla | Default | Significado |
|---|---|---|---|
| `estado_validacion` | `sitios_master` | `'pendiente'` | Bandeja de revisión |
| `estado` | `lugares_capas` | `'pendiente'` | Bandeja de revisión |
| `es_premium` | `lugares_capas` | `false` | No se cobra por defecto |
| `zoom_minimo` | `lugares_capas` | `8` | Visible desde zoom 8 |

### 2.4 Lo que NO es la bandeja de ingesta

`reportes_nuevos` es el flujo **ciudadano de denuncia**. Tiene campos como `rut_denunciante`, `infractor_nombre`, `obra_actividad`. **No se usa para ingesta técnica.**

---

## 3. Kit de ingesta — estado actual

Ubicación en el repo: [`/_kit_ingesta/`](https://github.com/redpatrimonio/redpatrimonio-v0.36/tree/main/_kit_ingesta)

| Archivo | Estado | Descripción |
|---|---|---|
| `instrucciones_agente_extractor.md` | ✅ Subido | Instrucciones completas para el agente IA |
| `plantilla_ingesta_base.csv` | ✅ Subido | Cabecera CSV oficial — fuente de verdad |
| `manual_usuario_ingesta.pdf` | ✅ Subido por el usuario | Manual de uso para ingesta AI y llenado manual |
| `plantilla_ingesta_manual.xlsx` | ⏳ Pendiente | Tabla Excel guiada para llenado manual |

---

## 4. Cabecera CSV oficial — fuente de verdad

**No modificar bajo ninguna circunstancia sin actualizar este checkpoint.**

```
tipo_de_registro,nombre,latitud,longitud,descripcion,region,comuna,codigo_accesibilidad,categoria_cmn,tipologias,cultura_asociada,periodo_cronologico,subcategoria,que_lo_cubre,acceso_publico_privado
```

### Campos obligatorios por tipo

| Campo | Todos | arqueologico | memoria | geografico / turistico / comercial |
|---|---|---|---|---|
| tipo_de_registro | ✅ | ✅ | ✅ | ✅ |
| nombre | ✅ | ✅ | ✅ | ✅ |
| latitud / longitud | ✅ | ✅ | ✅ | ✅ |
| descripcion | ✅ | ✅ | ✅ | ✅ |
| region / comuna | ✅ | ✅ | ✅ | ✅ |
| codigo_accesibilidad | — | ✅ | ✅ | — |
| categoria_cmn | — | ✅ | — | — |
| que_lo_cubre | — | — | ✅ | — |
| subcategoria | — | — | — | ✅ |

### Valores permitidos — campos controlados

**`tipo_de_registro`:** `arqueologico` | `memoria` | `geografico` | `turistico` | `comercial`

**`codigo_accesibilidad`** (solo arqueologico y memoria):
- `A` — Sitio conocido públicamente, sin riesgo de saqueo. Coordenadas exactas publicables.
- `B` — Sitio sensible. Coordenadas difusas para el público general.
- `C` — Sitio muy frágil o privado. Coordenadas en reserva estricta para expertos.
- **No existe valor "pendiente".** Lo asigna el bibliotecario o revisor. El agente puede sugerir uno basado en el documento, pero el valor final lo define siempre un humano.

**`categoria_cmn`:** `Aldea` | `Alero` | `Arte rupestre` | `Cantera` | `Cementerio` | `Conchal` | `Estructuras` | `Geoglifo` | `Hallazgo aislado` | `Paradero` | `Pucará` | `Sitio habitacional` | `Tumba` | `Villa` | `Otro`

**`tipologias`** (múltiples valores separados por `|`): `Alfarería` | `Bioantropológico` | `Carpintería de ribera` | `Histórico` | `Industria lítica` | `Metal` | `Orgánico` | `Textil` | `Otro`

**`region`:** `Arica y Parinacota` | `Tarapacá` | `Antofagasta` | `Atacama` | `Coquimbo` | `Valparaíso` | `Metropolitana` | `O'Higgins` | `Maule` | `Ñuble` | `Biobío` | `La Araucanía` | `Los Ríos` | `Los Lagos` | `Aysén` | `Magallanes`

**`acceso_publico_privado`:** `publico` | `privado`

---

## 5. Mapeo CSV → Supabase

### Para sitios_master (arqueologico / memoria)

| Columna CSV | Columna Supabase | Notas |
|---|---|---|
| tipo_de_registro | capa_destino | arqueologico o memoria |
| nombre | nombre_sitio | |
| latitud | latitud | |
| longitud | longitud | |
| descripcion | descripcion_ubicacion | |
| region | region | |
| comuna | comuna | |
| codigo_accesibilidad | codigo_accesibilidad | A / B / C |
| categoria_cmn | categoria_general | |
| tipologias | tipologias | Array, separado por `\|` en CSV |
| cultura_asociada | cultura_asociada | |
| periodo_cronologico | periodo_cronologico | |
| acceso_publico_privado | tipo_propiedad | publico / privado |

### Para lugares_capas (geografico / turistico / comercial)

| Columna CSV | Columna Supabase | Notas |
|---|---|---|
| tipo_de_registro | capa | valor del ENUM |
| nombre | nombre | |
| latitud | latitud | |
| longitud | longitud | |
| descripcion | descripcion | |
| region | region | |
| comuna | comuna | |
| subcategoria | subcategoria | |
| acceso_publico_privado | origen_acceso | publico / privado |

---

## 6. Flujo completo de ingesta — paso a paso

```
[Documento fuente: PDF / texto / tabla / video]
        │
        ▼
[Agente IA — instrucciones_agente_extractor.md]
        │  Extrae sitios uno a uno
        │  Completa con búsqueda web cuando puede
        │  Pregunta al usuario lo que no puede inferir
        │  Entrega vista previa en tabla
        │  Usuario aprueba → genera CSV
        ▼
[Archivo CSV — cabecera oficial de 15 columnas]
        │
        ▼
[Panel de carga en la app — /admin/ingesta] ← POR CONSTRUIR
        │  Upload o paste del CSV
        │  Vista previa del lote
        │  Detección de duplicados potenciales
        │  Validación de campos obligatorios por tipo
        ▼
[Revisión y aprobación — /admin/pendientes] ← POR CONSTRUIR
        │  El mapper rutea según tipo_de_registro:
        │    arqueologico / memoria → sitios_master
        │    geografico / turistico / comercial → lugares_capas
        │  estado_validacion: pendiente → publicado
        ▼
[Sitio visible en el mapa de la app]
```

---

## 7. Tareas pendientes — en orden de ejecución

### TAREA 1 — Kit de ingesta ✅ COMPLETADA (7 junio 2026)
- [x] Instrucciones del agente actualizadas y subidas a `_kit_ingesta/`
- [x] Plantilla CSV base subida a `_kit_ingesta/`
- [x] Manual de usuario creado y subido a `_kit_ingesta/`
- [ ] Plantilla Excel (`plantilla_ingesta_manual.xlsx`) — pendiente

### TAREA 2 — Revisar descalces de columnas entre CSV y Supabase
- [ ] Confirmar nombre exacto de cada columna en `sitios_master` y `lugares_capas`
- [ ] Verificar los valores actuales del ENUM `capa` en `lugares_capas`
- [ ] Confirmar si `tipologias` y `tipologia_especifica` son la misma columna o distintas
- [ ] Confirmar si `capa_destino` y `categoria_sitio` son distintos o el mismo rol

### TAREA 3 — Mapper CSV → Supabase
- [ ] Función `mapearRegistroASitiosMaster(fila)` → shape de `sitios_master`
- [ ] Función `mapearRegistroALugaresCapa(fila)` → shape de `lugares_capas`
- [ ] Función `insertarLote(filas[])` → inserción masiva con manejo de errores por fila

**Archivos a crear:**
- `lib/ingesta/mapper.ts`
- `lib/ingesta/insertarLote.ts`

### TAREA 4 — Ruta de ingesta en la app (`/admin/ingesta`)
- [ ] `app/admin/ingesta/page.tsx`
- [ ] Componente de upload/paste del CSV
- [ ] Validador de estructura (campos obligatorios por tipo)
- [ ] Vista previa del lote en tabla editable
- [ ] Detección de duplicados contra sitios existentes

**Archivos a crear:**
- `app/admin/ingesta/page.tsx`
- `components/ingesta/CsvUploader.tsx`
- `components/ingesta/LotePreview.tsx`
- `lib/ingesta/validator.ts`
- `lib/ingesta/duplicateChecker.ts`

### TAREA 5 — Panel de revisión (`/admin/pendientes`)
- [ ] `app/admin/pendientes/page.tsx`
- [ ] Query sitios_master WHERE estado_validacion = 'pendiente'
- [ ] Query lugares_capas WHERE estado = 'pendiente'
- [ ] Tarjeta por sitio con acciones: Aprobar / Rechazar / Editar
- [ ] Filtro por lote de ingesta

**Archivos a crear:**
- `app/admin/pendientes/page.tsx`
- `components/admin/TarjetaPendiente.tsx`
- `lib/admin/aprobarSitio.ts`

### TAREA 6 — Protección de rutas admin
- [ ] Verificar que `/admin/**` esté protegido en `middleware.ts`
- [ ] Confirmar que el rol `admin` existe en `usuarios_autorizados`

### TAREA 7 — Test de flujo completo
- [ ] Elegir un PDF real de fuente patrimonial
- [ ] Correr el agente extractor
- [ ] Subir el CSV resultante en `/admin/ingesta`
- [ ] Revisar y publicar desde `/admin/pendientes`
- [ ] Verificar que los sitios aparecen en el mapa

---

## 8. Decisiones técnicas pendientes

| Decisión | Estado |
|---|---|
| ¿El CSV llega por upload de archivo o por paste de texto? | ❓ Por confirmar |
| ¿`tipologias` y `tipologia_especifica` son la misma columna? | ❓ Revisar en Supabase |
| ¿Cuáles son los valores válidos del ENUM `capa` en `lugares_capas`? | ❓ Revisar en Supabase |
| ¿La detección de duplicados es automática o solo un aviso? | Por definir |
| ¿Se registra el usuario que aprueba cada sitio? | ✅ `id_usuario_reviso` ya existe en `sitios_master` |

---

## 9. Notas sobre descalces detectados en `sitios_master`

1. **Columna duplicada de tipologías:** existe tanto `tipologia_especifica` (ARRAY) como `tipologias` (ARRAY). Hay que decidir cuál es la canónica antes de construir el mapper.
2. **`capa_destino` vs `categoria_sitio`:** dos campos que podrían cumplir el mismo rol. Confirmar antes de programar.
3. **Timestamps mixtos:** `timestamp_revision` y `timestamp_publicacion` son `timestamp without time zone`; `timestamp_creado` es `timestamp with time zone`. Inconsistencia menor, no urgente.

---

*Checkpoint actualizado el 7 de junio 2026 tras sesión de trabajo.*  
*Decisión central: CSV como formato canónico definitivo en todo el flujo de ingesta.*  
*Próximo hito: completar Tarea 2 (verificar columnas Supabase) antes de construir el mapper.*
