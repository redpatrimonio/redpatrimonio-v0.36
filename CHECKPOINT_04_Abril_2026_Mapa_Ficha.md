# CHECKPOINT — 04 Abril 2026 · Mapa, Globo y FichaModal

**Fecha:** 4 de abril de 2026  
**Versión:** RedPatrimonio v0.36  
**Repo:** redpatrimonio/redpatrimonio-v0.36  
**Estado:** Funcionalidades desplegadas en main · A/B/C con pin pendiente

---

## Contexto de la sesión

Sesión de debug y corrección de la capa de mapa. Los sitios `sitios_master` ya eran visibles en el mapa pero el globo no mostraba imágenes y el botón "Ver ficha" no abría la modal. Se identificaron y corrigieron tres bugs encadenados.

---

## BD — Cambios estructurales (sesión con Bibliotecario, misma fecha)

| Cambio | Detalle |
|---|---|
| Enum `capa_tipo` | Agregado valor `'museo'` para `lugares_capas` |
| `sitios_master` | Eliminado registro "Geoglifos de Pintados" (estaba duplicado) |
| `medios` | 5 fotos reasignadas al Museo de Sitio Geoglifos de Pintados, prioridades 1→5 sin colisiones |

---

## Arquitectura de capas — Estado consolidado

| Entidad | Tabla | Capa | Ícono |
|---|---|---|---|
| Sitio arqueológico | `sitios_master` | — | Vasija verde |
| Museo de sitio | `sitios_master` | — | Vasija verde |
| Museo independiente (historia, arte, arq. urbano) | `lugares_capas` | `museo` | Columnas azul |
| Lugar de interés internacional | `lugares_capas` | `lugar_interes` | Bandera blanca |

> Nota: el Museo de Sitio Geoglifos de Pintados aparece con ícono vasija porque vive en `sitios_master`. Esto es correcto por ahora — diferenciarlo con ícono propio es tarea futura.

---

## Bugs corregidos

### Bug 1 — Imágenes no aparecían en globo (popup) de sitios master

**Causa:** `SitiosMaster.tsx` no cargaba imágenes desde `medios`.  
**Fix:** Se agregó un segundo fetch a `medios` filtrando por `id_sitio IN [...]` y `prioridad_visualizacion = 1`. El resultado se mapea en un `Record<id_sitio, url>` y se adjunta a cada sitio como `imagen_principal`.  
**Archivo:** `components/map/SitiosMaster.tsx`

### Bug 2 — FichaModal no abría para sitios master (PGRST116 - 0 rows)

**Causa:** `FichaSitioModal` siempre consultaba `reportes_nuevos` con `.eq('id_reporte', idSitio)`. Cuando el id era de `sitios_master`, retornaba 0 filas.  
**Fix:** Se agregó prop `origen: 'master' | 'reporte'`. Según origen, consulta la tabla correcta y mapea los campos a una interfaz normalizada `SitioNormalizado`.  
**Archivo:** `components/modals/FichaSitioModal.tsx`

### Bug 3 — `origen` nunca llegaba a la modal (root cause del Bug 2 en producción)

**Causa:** `MapView.tsx` declaraba `origenSeleccionado` como `'master' | 'reporte' | null` (default `null`) pero no pasaba el prop `origen` al render de `<FichaSitioModal>`. TypeScript no compilaba en error fuerte en este contexto.  
**Fix:** Tipo cambiado a `'master' | 'reporte'` (sin null), default `'master'`. Se pasa `origen={origenSeleccionado}` explícitamente.  
**Archivo:** `components/map/MapView.tsx`

---

## Commits del día

| SHA | Archivo | Descripción |
|---|---|---|
| `34a3caa` | `FichaSitioModal.tsx` | Soporta `origen master/reporte`, normaliza campos, badge de origen |
| `01a34c0` | `MapView.tsx` | Pasa prop `origen` a FichaSitioModal, elimina `null` del tipo |

> `SitiosMaster.tsx` ya tenía el fetch de imágenes implementado desde sesión anterior (commit del 3 abril).

---

## Estado actual de FichaSitioModal

| Aspecto | Comportamiento |
|---|---|
| Fuente datos | `sitios_master` si `origen='master'`, `reportes_nuevos` si `origen='reporte'` |
| Medios master | Tabla `medios` por `id_sitio` |
| Medios reporte | `reportes_medios` por `id_reporte`, fallback a `medios` si vacío |
| Publicaciones | `sitios_publicaciones` con campo dinámico (`id_sitio` o `id_reporte`) |
| Badge visible | 🟢 "Sitio validado" (master) / 🟡 "Reporte comunitario" (reporte) |
| Compartir | URL incluye parámetro `?sitio=ID&origen=master/reporte` |

---

## Pendientes abiertos

| # | Item | Prioridad |
|---|---|---|
| 1 | Códigos A/B/C no se ejecutan en formulario de reporte | 📌 Pin — pendiente |
| 2 | Ícono diferenciado para "Museo de Sitio" vs sitio arqueológico | Baja — diseño futuro |
| 3 | Deep link `/mapa?sitio=ID&origen=...` no está implementado (solo genera URL) | Media |

---

## Decisiones cerradas

- `FichaSitioModal` usa interfaz `SitioNormalizado` como capa de abstracción — no duplicar lógica por tabla
- El prop `origen` es **obligatorio** en `FichaSitioModal` — no tiene default implícito
- `origenSeleccionado` en `MapView` no puede ser `null` — siempre tiene valor antes de abrir la modal
- Imágenes del globo: solo `prioridad_visualizacion = 1`, sin fallback a otras prioridades en el popup
