# CHECKPOINT 06 — Verificación de tablas Supabase y preparación del sistema de ingesta
**Fecha:** 7 de junio 2026  
**Repo:** [redpatrimonio/redpatrimonio-v0.36](https://github.com/redpatrimonio/redpatrimonio-v0.36)  
**Checkpoint anterior:** `CHECKPOINT_05_Junio_2026_Sistema_Ingesta.md`

---

## 1. Lo que se completó en esta sesión

### 1.1 Kit de ingesta — COMPLETO (salvo .xlsx)

Ubicación: [`/_kit_ingesta/`](https://github.com/redpatrimonio/redpatrimonio-v0.36/tree/main/_kit_ingesta)

| Archivo | Estado |
|---|---|
| `instrucciones_agente_extractor.md` | ✅ Subido |
| `plantilla_ingesta_base.csv` | ✅ Subido |
| `manual_usuario_ingesta.pdf` | ✅ Subido por el usuario |
| `plantilla_ingesta_manual.xlsx` | ⏳ Pendiente |

### 1.2 Manual de usuario

- Formato final: HTML exportable a PDF.
- Tono profesional, directo, con calidez.
- Índice con 7 secciones en orden lógico de uso.
- Incluye instrucciones para uso del agente, lotes, retomado de conversación y referencia completa de los 15 campos del CSV.
- Archivo generado: `manual_usuario_ingesta.html` (también disponible como `.md`).

### 1.3 Checkpoint 05 actualizado

- Formato canónico definitivo: **CSV en todo el flujo** (no JSON).
- Cabecera oficial de 15 columnas definida como fuente de verdad.
- Mapa de campos CSV → Supabase actualizado.
- Tareas reordenadas según nueva información.

---

## 2. Verificación de tablas Supabase — resultados

**Proyecto:** `lbsdxnafreajwdxqwhnx` (redpatrimonio's Project, sa-east-1)

### 2.1 Tablas relevantes para el sistema de ingesta

| Tabla | Uso | RLS |
|---|---|---|
| `sitios_master` | Sitios arqueológicos | ✅ Activo |
| `sitios_memoria` | Sitios de memoria | ✅ Activo |
| `lugares_capas` | Geográfico, turístico, comercial, lugar_interes, museo | ❌ Desactivado |
| `inv_fichas` | Fichas de investigación interna | ❌ Desactivado |
| `inv_cola` | Cola de investigación | ❌ Desactivado |
| `inv_log` | Log de investigación | ❌ Desactivado |

### 2.2 Descalces del checkpoint 05 — resueltos

| Duda anterior | Respuesta confirmada |
|---|---|
| ¿`tipologias` y `tipologia_especifica` son lo mismo? | No. `tipologia_especifica` es el campo de reportes/sitios_master (forma libre). `tipologias` es el campo del kit de ingesta (array controlado). El mapper usa `tipologias`. |
| ¿Valores válidos del ENUM `capa` en `lugares_capas`? | `geografico` \| `turistico` \| `comercial` \| `lugar_interes` \| `museo` |
| ¿`capa_destino` vs `categoria_sitio`? | Son distintos. `capa_destino` define la tabla de destino del sitio. `categoria_sitio` es un descriptor interno (`sitio_arqueologico`, `hallazgo_aislado`). El mapper usa `capa_destino`. |
| ¿`memoria` va a `sitios_master`? | **No.** Existe tabla propia `sitios_memoria` con columnas específicas (`que_lo_cubre`, `periodo_ocultamiento`, etc.). Los sitios de memoria van ahí. |

---

## 3. Mapa de tablas de destino — DEFINITIVO

| `tipo_de_registro` en CSV | Tabla Supabase | Notas |
|---|---|---|
| `arqueologico` | `sitios_master` | `capa_destino = 'arqueologico'` |
| `memoria` | `sitios_memoria` | Tabla propia con `que_lo_cubre` |
| `geografico` | `lugares_capas` | `capa = 'geografico'` |
| `turistico` | `lugares_capas` | `capa = 'turistico'` |
| `comercial` | `lugares_capas` | `capa = 'comercial'` |

---

## 4. Mapeo CSV → Supabase — DEFINITIVO

### Para `sitios_master` (arqueologico)

| Columna CSV | Columna Supabase | Notas |
|---|---|---|
| nombre | nombre_sitio | |
| latitud | latitud | |
| longitud | longitud | |
| descripcion | descripcion_breve | |
| region | region | |
| comuna | comuna | |
| codigo_accesibilidad | codigo_accesibilidad | A / B / C |
| categoria_cmn | categoria_general | |
| tipologias | tipologias | Array; separado por `\|` en CSV |
| cultura_asociada | cultura_asociada | |
| periodo_cronologico | periodo_cronologico | |
| acceso_publico_privado | origen_acceso | publico / privado |
| tipo_de_registro | capa_destino | valor: `arqueologico` |
| — | estado_validacion | default `pendiente` (no viene del CSV) |

### Para `sitios_memoria` (memoria)

| Columna CSV | Columna Supabase | Notas |
|---|---|---|
| nombre | nombre | |
| latitud | latitud | |
| longitud | longitud | |
| descripcion | descripcion | |
| que_lo_cubre | que_lo_cubre | |
| region | region | (no existe en tabla — campo a verificar) |
| comuna | comuna | (no existe en tabla — campo a verificar) |
| codigo_accesibilidad | — | No existe en sitios_memoria ⚠️ |
| — | estado | default `pendiente` |

> ⚠️ **Pendiente:** `sitios_memoria` no tiene columnas `region`, `comuna` ni `codigo_accesibilidad`. Definir si se agregan por migración o si se omiten del CSV para este tipo.

### Para `lugares_capas` (geografico / turistico / comercial)

| Columna CSV | Columna Supabase | Notas |
|---|---|---|
| nombre | nombre | |
| latitud | latitud | |
| longitud | longitud | |
| descripcion | descripcion | |
| region | region | |
| comuna | comuna | |
| subcategoria | subcategoria | |
| acceso_publico_privado | — | No existe en lugares_capas ⚠️ |
| tipo_de_registro | capa | valor del ENUM |
| — | estado | default `pendiente` |

> ⚠️ **Pendiente:** `lugares_capas` no tiene columna `acceso_publico_privado` ni equivalente. Definir si se agrega o se omite.

---

## 5. ⚠️ Alerta de seguridad — RLS desactivado

Las siguientes tablas no tienen Row Level Security activo. Cualquier usuario con la `anon key` puede leer y modificar todos sus datos:

- `lugares_capas`
- `inv_cola`, `inv_fichas`, `inv_log`
- `reportes_cmn`
- `spatial_ref_sys`

**No activar RLS sin definir políticas primero** — si se activa sin políticas, la tabla queda completamente bloqueada para todos.

Esto debe resolverse en una sesión dedicada antes del lanzamiento. Ver: [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security)

---

## 6. Tareas pendientes — orden de ejecución

### TAREA A — Página `/admin/ingesta` ← PRÓXIMO PASO
- [ ] Descarga del kit: links a archivos en `_kit_ingesta/`
- [ ] Upload de CSV: recibir archivo, parsearlo, mostrar vista previa en tabla
- [ ] Sin escritura a Supabase todavía — solo revisión visual

**Archivos a crear:**
- `app/admin/ingesta/page.tsx`
- `components/ingesta/CsvUploader.tsx`
- `components/ingesta/LotePreview.tsx`

### TAREA B — Resolver campos faltantes en `sitios_memoria` y `lugares_capas`
- [ ] Decidir si `sitios_memoria` necesita `region`, `comuna`, `codigo_accesibilidad`
- [ ] Decidir si `lugares_capas` necesita `acceso_publico_privado`
- [ ] Si se agregan: crear migración en Supabase
- [ ] Si se omiten: actualizar cabecera CSV y manual

### TAREA C — Mapper CSV → Supabase
- [ ] `lib/ingesta/mapper.ts`: funciones de mapeo para cada tipo
- [ ] `lib/ingesta/validator.ts`: validación de campos obligatorios por tipo
- [ ] `lib/ingesta/insertarLote.ts`: inserción masiva con manejo de errores por fila

### TAREA D — Panel de revisión `/admin/pendientes`
- [ ] Vista de sitios con `estado_validacion = 'pendiente'` en `sitios_master`
- [ ] Vista de sitios con `estado = 'pendiente'` en `sitios_memoria` y `lugares_capas`
- [ ] Acciones: Aprobar / Rechazar / Editar por sitio

### TAREA E — RLS y protección de rutas
- [ ] Definir políticas RLS para `lugares_capas`, `inv_cola`, `inv_fichas`, `inv_log`
- [ ] Verificar protección de `/admin/**` en `middleware.ts`
- [ ] Confirmar rol `founder`/`partner` en `usuarios_autorizados` para acceso admin

### TAREA F — Plantilla Excel
- [ ] Crear `plantilla_ingesta_manual.xlsx` con columnas, dropdowns y validaciones
- [ ] Subir a `_kit_ingesta/`

---

## 7. Cabecera CSV oficial — fuente de verdad

```
tipo_de_registro,nombre,latitud,longitud,descripcion,region,comuna,codigo_accesibilidad,categoria_cmn,tipologias,cultura_asociada,periodo_cronologico,subcategoria,que_lo_cubre,acceso_publico_privado
```

15 columnas. No modificar sin actualizar este checkpoint y el manual.

---

*Checkpoint creado el 7 de junio 2026.*  
*Próximo hito: construir `/admin/ingesta` con descarga de kit y vista previa de CSV.*
