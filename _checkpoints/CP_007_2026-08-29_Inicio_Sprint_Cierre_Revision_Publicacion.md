# CP_007 — Inicio Sprint Cierre: Revisión, Aprobación y Publicación
**Fecha:** 29 agosto 2026  
**Estado:** Preparado para ejecución  
**Módulo:** Proceso Interno (Dashboard: Revisar, Aprobar, Publicados)  
**Versión objetivo:** v0.5 Pre-Lanzamiento Oficial  

---

## 1. Contexto y Objetivos del Sprint

Este sprint aborda la actualización gráfica y consolidación visual definitiva de las páginas de gestión interna de reportes arqueológicos en RedPatrimonio. Se aplica el sistema tipográfico y de tokens CSS aprobado sin alterar la lógica de negocio ni el esquema relacional en Supabase.

### Reglas de Diseño Acordadas
- **Tono institucional:** Eliminación completa de emojis en interfaces, reemplazándolos por iconografía SVG sobria, tipografía jerárquica y badges con tokens de color.
- **Tipografía:** Títulos en Cormorant Garamond 300 (`font-display font-light`), textos descriptivos y etiquetas en DM Sans (`font-sans`).
- **Paleta de tokens (`globals.css` / `stepStyles.ts`):**
  - Fondos: `--bg` (`#171614`), `--surface` (`#1D1B19`), `--surface-2` (`#26231F`), `--nav` (`#1E1C1A`).
  - Textos: `--text` (`#DDE6E0`), `--muted` (`#7A8C82`), `--faint` (`#495249`).
  - Acentos semánticos: `--accent` (`#8FB5A4`), `--btn` (`#2A2724`), `--btn-light` (`#DDE6E0`), `--ladrillo` (`#A85040`), `--musgo` (`#4E8A60`).

---

## 2. Alcance del Sprint (Estructura de Archivos)

### Fase 1: Listados de Gestión
- `app/dashboard/revisar/page.tsx` (Estado Rojo: Reportes pendientes de validación por equipo experto)
- `app/dashboard/aprobar/page.tsx` (Estado Amarillo: Reportes validados listos para publicación)
- `app/dashboard/publicados/page.tsx` (Estado Verde: Fichas publicadas con filtro por categoría)

### Fase 2: Formularios de Detalle y Edición
- `app/dashboard/revisar/[id]/page.tsx` (Detalle de revisión técnica, contacto del reportante y pase a amarillo)
- `app/dashboard/aprobar/[id]/page.tsx` (Formulario de catalogación, asignación de Código A/B/C y pase a verde)
- `app/dashboard/publicados/[id]/page.tsx` (Vista y actualización de ficha publicada)

---

## 3. Estructura de Datos y Jerarquía en Tarjetas de Listado

Las tarjetas de los tres listados compartirán un layout sobrio y estructurado:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ CATEGORÍA / TIPO REPORTE                                    HACE X TIEMPO   │
│ Título del Reporte o Sitio (Cormorant Garamond 300)                         │
│ Región, Comuna · Tipología específica                                       │
│ Autor del reporte · Código de accesibilidad (A/B/C) · Estado             →  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Próximo Paso Inmediato
Comenzar con la implementación de **Fase 1: Listados de Gestión** (`revisar/page.tsx`, `aprobar/page.tsx`, `publicados/page.tsx`).
