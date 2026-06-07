# CHECKPOINT 07 — 07 Junio 2026
## Sistema de Ingesta — UI y Flujo Completo

---

## Base de datos (Supabase)

### Tablas nuevas

**`lotes_ingesta`**
| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | auto |
| `titulo` | text NOT NULL | puesto por quien sube |
| `notas_subida` | text | nota libre al subir |
| `nombre_archivo` | text NOT NULL | nombre original del .csv |
| `url_csv` | text | ruta en bucket: `csv/{id}.csv` |
| `subido_por` | uuid FK → auth.users | NOT NULL |
| `fecha_subida` | timestamptz | default now() |
| `n_filas` | integer | contado al parsear |
| `estado` | text | pendiente / en_revision / aprobado / rechazado |
| `notas_revision` | text | comentarios del bibliotecario |

**`lotes_ingesta_pdfs`**
| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | auto |
| `id_lote` | uuid FK → lotes_ingesta | ON DELETE CASCADE |
| `url_pdf` | text NOT NULL | ruta en bucket: `pdfs/{id_lote}/{nombre}.pdf` |
| `titulo` | text NOT NULL | |
| `autor` | text | |
| `anio` | integer | CHECK 1800–2100 |
| `referencia` | text | revista, fuente, etc. |

### Bucket Storage
- Nombre: `ingesta-lotes` (privado)
- Límite: 20 MB por archivo
- MIME permitidos: `text/csv`, `application/pdf`
- Estructura: `csv/{id_lote}.csv` / `pdfs/{id_lote}/{nombre}.pdf`

### Función y RLS
- `es_rol_interno()` — verifica founder / partner / experto + activo = true
- RLS `lotes_ingesta`: SELECT / INSERT / UPDATE para roles internos
- RLS `lotes_ingesta_pdfs`: SELECT / INSERT para roles internos
- RLS Storage INSERT/SELECT: roles internos
- RLS Storage DELETE: solo founder

---

## Rutas y componentes

### Rutas nuevas
| Ruta | Archivo | Estado |
|---|---|---|
| `/ingesta-inicio` | `app/ingesta-inicio/page.tsx` | ✅ nuevo |
| `/ingesta` | `app/ingesta/page.tsx` | ✅ nuevo |

### Ruta modificada
| Ruta | Archivo | Cambio |
|---|---|---|
| `/reportar-inicio` | `app/reportar-inicio/page.tsx` | Card "Sitios en Publicaciones" al final |

### Componentes nuevos
| Archivo | Descripción |
|---|---|
| `components/ingesta/LoteUploader.tsx` | Formulario completo: título, nota, drop CSV, PDFs opcionales. Sube a Storage y registra en BD. |
| `components/ingesta/LotesRecientes.tsx` | Lista los últimos 10 lotes del equipo con estado, email, fecha, n° filas, n° PDFs. |

---

## Flujo completo

```
/reportar-inicio
  └─ card "Sitios en Publicaciones"
       ├─ sin sesión  → bloqueada (opacidad 0.45)
       └─ logueado    → /ingesta-inicio

/ingesta-inicio
  ├─ [Kit de recopilación] → modal con 3 descargas directas vía raw.githubusercontent.com
  │     ├─ Manual de usuario - Kit Red Patrimonio.pdf
  │     ├─ instrucciones_agente_extractor.md
  │     └─ plantilla_ingesta_base.csv
  └─ [Subir lote CSV] → /ingesta

/ingesta
  ├─ Sección "Subir nuevo lote" (LoteUploader)
  │     ├─ Título obligatorio
  │     ├─ Nota opcional
  │     ├─ Drop zone CSV con validación de cabecera y conteo de filas
  │     └─ PDFs opcionales (título, autor, año, referencia)
  └─ Sección "Lotes recientes" (LotesRecientes)
        └─ Últimos 10 lotes — email, fecha, filas, PDFs, badge estado
```

---

## Pendiente (próxima sesión)

- `/ingesta/[id]` — vista de detalle del lote para el bibliotecario
- Cambio de estado: `pendiente → en_revision → aprobado`
- Lógica de aprobación: mapper CSV → `sitios_master` / `sitios_memoria`
- Reasignación de PDFs del lote al sitio correspondiente al aprobar
- Botón de acceso a Ingesta desde `/dashboard/aprobar`
