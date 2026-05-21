# CHECKPOINT 05 — Sistema Visual Consolidado
**Fecha:** 20 Mayo 2026
**Commit base:** `8138b06`

---

## Estado al cierre de este checkpoint

### Sistema de diseño (globals.css + tailwind.config.ts)
- Tokens CSS completos definidos en `--bg`, `--surface`, `--surface-2`, `--border`, `--border-m`, `--text`, `--muted`, `--faint`, `--accent`, `--accent-pale`, `--btn`, `--btn-light`
- Paleta semántica: `--cobre`, `--tierra`, `--ladrillo`, `--musgo`, `--antracita`
- Tipografía: DM Sans (cuerpo/UI) + Cormorant Garamond (display/títulos) — via Google Fonts en CSS
- Todos los tokens disponibles como clases Tailwind via `tailwind.config.ts`
- Fixes de Leaflet en globals.css intactos

### Páginas migradas al sistema visual
| Página | Ruta | Estado |
|---|---|---|
| Home | `app/page.tsx` | ✅ Completa — one-screen mobile+desktop, logo, 4 pasos |
| Panel / Perfil | `app/perfil/page.tsx` | ✅ Completa — SVGs, paleta sistema, lógica roles intacta |
| Entrada reportes | `app/reportar-inicio/page.tsx` | ✅ Completa — SVGs, textos actualizados, paleta sistema |

### Navbar / Footer
- `Navbar.tsx` — paleta nueva, sin hardcode de colores viejos
- `Footer.tsx` — 5 ítems (Inicio/Mapa/Reportar/Panel/Más), botón central destacado
- `layout.tsx` — Inter eliminado, fonts vienen de CSS

---

## Pendiente (próxima sesión)
- Flujos de reporte: `app/reportar/page.tsx` (hallazgo arqueológico, pasos 2-4)
- Flujo riesgo: `app/reportar/riesgo/page.tsx`
- Revisar modales (`AgregarInfoContactoModal` y otros en `/components/modals/`)
- Dashboard páginas: `/dashboard/revisar`, `/dashboard/aprobar`, `/dashboard/publicados`

---

## Convenciones establecidas
- **Sin emojis como íconos** — SVGs con fondos tintados `rgba(color, opacidad)`
- **Sin colores Tailwind externos** (`bg-gray-50`, `bg-yellow-100`, etc.) en páginas migradas
- **Títulos de página** en Cormorant Garamond 300, sin preguntas retóricas
- **Estados**: pendiente=tierra / aprobada=musgo / rechazada=ladrillo
- **Roles**: founder=cobre / partner=accent / experto=musgo / publico=antracita
