# CHECKPOINT — Sistema Cromático + Portada UI
**Fecha:** 19 de Mayo 2026  
**Estado:** ✅ APROBADO  
**Repo:** redpatrimonio/redpatrimonio-v0.36  

---

## Contexto

Se realizó una revisión completa de la identidad visual de la app, partiendo del mockup HTML de la portada y definiendo un sistema cromático coherente, mineral y sobrio, alineado con el carácter patrimonial-arqueológico de la plataforma.

---

## Decisiones cerradas

### 1. Estructura de portada (Home)
- Pantalla única, sin scroll — portada de app, no landing page
- Layout mobile-first con bottom navigation de 5 ítems
- Layout desktop: hero izquierda + mapa visual derecha
- Sin estadísticas (a definir después) ni sección de actividad reciente
- Bloque "01/02/03" como guía de uso, no como marketing
- CTAs aparecen **una sola vez** (en el hero), sin redundancia con el bottom nav

### 2. Navegación mobile — Bottom Nav
Orden definitivo: `Inicio · Mapa · [Reportar] · Panel · Más`

- **Inicio**: ícono casa
- **Mapa**: ícono brújula/círculo
- **Reportar** (central): botón circular sobrio, fondo transparente verde pálido, borde sutil, glow mínimo, ícono `+`
- **Panel**: ícono dashboard/rectángulo (antes "Biblioteca")
- **Más**: ícono tres puntos horizontales

### 3. Paleta cromática — tokens definitivos

#### Base — Grafito cálido
| Token CSS | Hex | Rol |
|---|---|---|
| `--bg` | `#171614` | Fondo global (referencia imagen aprobada) |
| `--surface` | `#1D1B19` | Cards / superficies |
| `--surface-2` | `#26231F` | Hover / estado secundario |
| `--nav` | `#1E1C1A` | Navbar top + bottom (referencia imagen aprobada) |
| `--text` | `#DDE6E0` | Texto principal |
| `--muted` | `#7A8C82` | Texto secundario |
| `--faint` | `#495249` | Texto tenue / labels |

#### Acentos — Familia mineral patrimonial
| Token | Hex | Rol |
|---|---|---|
| `--accent` | `#8FB5A4` | **Verde ceniza** — acento identidad, UI activo, tipografía display em |
| `--cta-pale` | `#A8CFBF` | **Verde pálido** — CTA botón central bottom nav |
| `--btn` | `#2A2724` | **Antracita** — botones de sistema/acciones |
| `--btn-light` | `#DDE6E0` | **Claro neutro** — botones banner/intro (contraste puro) |
| `--cobre` | `#C27840` | **Cobre** — acción de reportar y flujo de usuario |
| `--tierra` | `#9B6845` | **Tierra** — categorías patrimoniales, tags de tipología |
| `--ladrillo` | `#A85040` | **Ladrillo** — estado de riesgo / alerta / requiere atención |
| `--musgo` | `#4E8A60` | **Musgo** — estado publicado / validado |
| `--antracita` | `#526058` | **Antracita UI** — bordes activos, estructura, neutro sistema |

#### Lógica de botones (definición cerrada)
- **Banner/intro CTA principal**: fondo claro `#DDE6E0`, texto oscuro — contraste puro sin color
- **Botones de sistema/acciones**: antracita `#2A2724`, texto claro
- **Botón Reportar (bottom nav)**: verde pálido `#A8CFBF`, transparente, solo borde + glow
- El **cobre** queda reservado para el flujo específico de reporte y acciones que requieren atención del usuario

#### Estados de sitio (sin semáforo)
| Estado | Color |
|---|---|
| Publicado | Musgo `#4E8A60` |
| En evaluación | Verde ceniza `#8FB5A4` |
| Recibido | Tierra `#9B6845` |
| Requiere atención | Ladrillo `#A85040` |

#### Pins en el mapa
| Tipo | Color |
|---|---|
| Sitio A — público | Verde ceniza `#8FB5A4` |
| Sitio B — controlado | Tierra `#9B6845` |
| Sitio C — restringido | Antracita `#526058` |
| En riesgo | Ladrillo `#A85040` |

### 4. Tipografía
- **Display / títulos**: Cormorant Garamond, weight 300, con `em` en verde ceniza `#8FB5A4`
- **UI / cuerpo**: DM Sans, 300–500
- Texto principal: `#DDE6E0` — Texto secundario: `#7A8C82` — Tenue: `#495249`

---

## Próximos pasos

1. **`globals.css`** — escribir tokens CSS con la paleta cerrada (CSS custom properties + Tailwind extend)
2. **Navbar top** — aplicar chrome en `#1E1C1A`, logo, links con estado activo en verde ceniza
3. **Bottom nav** — implementar componente con los 5 ítems y el botón central definido
4. **Home page** — aplicar la estructura one-screen aprobada al código real
5. **Página Reportar** — formulario paso a paso (siguiente sprint)

---

## Archivos de referencia

- Mockup portada aprobado: `rp-home-v9.html` (en sesión Perplexity)
- Paleta visual: `rp-paleta-v3.html` (en sesión Perplexity)
