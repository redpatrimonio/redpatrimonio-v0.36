# CP_008 — Cierre Fase 1: Actualización Visual de Listados de Gestión
**Fecha:** 29 agosto 2026  
**Estado:** ✅ Completo y subido a producción (rama main)  
**Módulo:** Dashboard de Gestión (Revisar, Aprobar, Publicados)  
**Commits clave:** `65a1f99` (revisar), `7e1f5a9` (aprobar), `f5bd8ff` (publicados)  

---

## 1. Contexto y Objetivos Cumplidos

Se completó la Fase 1 del sprint de cierre previo al lanzamiento oficial. El objetivo fue consolidar y unificar visualmente los tres listados principales del proceso editorial y de gestión técnica de reportes arqueológicos, migrándolos de Tailwind genérico al sistema institucional de tokens CSS y tipografía Cormorant Garamond 300 / DM Sans, sin alterar la lógica de negocio ni las consultas relacionales en Supabase.

---

## 2. Archivos Actualizados

| Ruta | Estado BD | Actor / Rol | Cambios Principales |
|---|---|---|---|
| `app/dashboard/revisar/page.tsx` | `rojo` (Pendiente) | Experto, Partner, Founder | Layout horizontal fijo con foto cuadrada a la izquierda, badges sobrios en `--ladrillo` y `--accent`, tabs de filtro (*Todos*, *Hallazgos*, *Riesgo*), fix de tipología descriptiva para reportes de riesgo, fix de navegación a `/perfil`. |
| `app/dashboard/aprobar/page.tsx` | `amarillo` (Revisado) | Partner, Founder | Mismo layout horizontal consistente, badge de estado en acento `--cobre`, botón de acceso directo a `/dashboard/publicados` y link a `/perfil`. |
| `app/dashboard/publicados/page.tsx` | `verde` (Publicado) | Partner, Founder | Catálogo activo consolidado, visualización de **Código de Accesibilidad A / B / C** en pills dedicados, tabs dinámicos con conteos por tipo. |

---

## 3. Decisiones y Problemas Resueltos

1. **Eliminación Total de Emojis:**
   - Se reemplazaron emojis informales por iconografía SVG sobria y badges semánticos con variables CSS (`--ladrillo`, `--cobre`, `--musgo`, `--accent`).

2. **Resolución de Duplicidad en Reportes de Riesgo:**
   - **Diagnóstico:** Los avisos de riesgo no capturan tipología arqueológica formal, sino que guardan el tipo de obra/amenaza en `tipo_riesgo_principal`. Anteriormente se usaba `categoria_general` como fallback, generando que la palabra "Arqueología en riesgo" apareciera dos veces en la tarjeta.
   - **Solución:** Se implementó un mapeo limpio de `tipo_riesgo_principal` a etiquetas legibles (ej. *Afectación: Construcción / Inmobiliaria*, *Afectación: Minería / Cantera*), aportando contexto técnico directo al evaluador.

3. **Corrección de Enlace Roto (Error 404):**
   - El botón de retorno en los encabezados apuntaba a `/dashboard` (ruta inexistente en App Router). Se corrigió para que dirija de forma consistente al panel del usuario en `/perfil`.

4. **Estructura de Tarjeta Horizontal Estable:**
   - Se definió un contenedor `flex-row` permanente en todos los viewports, fijando la miniatura de imagen cuadrada (`w-24 h-24` móvil, `w-28 h-28` desktop) con `object-cover` para evitar deformaciones con fotos verticales u horizontales, y ordenando la información jerárquica a la derecha con título en Cormorant Garamond.

---

## 4. Estado de Base de Datos y Seguridad (Supabase)

- Esquema `reportes_nuevos` intacto.
- Permisos por rol validados:
  - `/dashboard/revisar`: roles `experto`, `partner`, `founder`.
  - `/dashboard/aprobar` y `/dashboard/publicados`: roles `partner`, `founder`.

---

## 5. Próximo Paso (Fase 2)

Iniciar el **Módulo 2: Detalle y Formulario de Revisión** (`app/dashboard/revisar/[id]/page.tsx`):
- Migración gráfica de la ficha técnica individual y bloque "Quién reportó".
- Banner sobrio de alerta institucional para reportes de riesgo.
- Integración completa de `stepStyles.ts` en inputs, selects y textareas.
