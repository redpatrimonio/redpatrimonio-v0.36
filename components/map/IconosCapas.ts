import L from 'leaflet'

// ─── Funciones base ───────────────────────────────────────────────────────────

function crearIconoCapa(svgInner: string, colorBorde: string): L.DivIcon {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="16"
        fill="rgba(80,80,80,0.3)"
        stroke="${colorBorde}"
        stroke-width="2"/>
      ${svgInner}
    </svg>`

  return L.divIcon({
    className: '',
    html: svg,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  })
}

function crearIconoArea(color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="width:30px;height:30px;border-radius:50%;background-color:${color};opacity:0.4;cursor:pointer;"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  })
}

// ─── Colores de borde del perímetro ──────────────────────────────────────────
// Nivel 1 especiales
const VERDE_CENIZA = '#6B8C5A'  // Arqueológico
const AZUL_CENIZA  = '#4A6B8A'  // Museo
// Niveles 1–3 resto
const BLANCO = '#FFFFFF'
// Niveles 4–5
const GRIS   = '#9CA3AF'

// ─── SVGs internos (todos en blanco sobre fondo gris semitransparente) ────────

// Vasija cerámica — Arqueológico
// Perfil de pieza: cuerpo curvo, cuello estrecho, base y boca marcadas
const vasijaSVG = `
  <path d="M13 25 C12 21 11 18 13 14 C14 11 16 10 18 10 C20 10 22 11 23 14 C25 18 24 21 23 25 Z"
    fill="none" stroke="white" stroke-width="1.8" stroke-linejoin="round"/>
  <line x1="15" y1="10" x2="21" y2="10"
    stroke="white" stroke-width="1.8" stroke-linecap="round"/>
  <line x1="13" y1="25" x2="23" y2="25"
    stroke="white" stroke-width="1.8" stroke-linecap="round"/>`

// Bandera — Lugar de interés (borde blanco) y Turístico/Cultural (borde gris)
// Mismo SVG, diferente colorBorde en la llamada
const banderaSVG = `
  <line x1="13" y1="11" x2="13" y2="26"
    stroke="white" stroke-width="2" stroke-linecap="round"/>
  <path d="M13 11 L23 14.5 L13 18 Z"
    fill="none" stroke="white" stroke-width="1.8" stroke-linejoin="round"/>`

// Columnas — Museo
const columnasSVG = `
  <line x1="12" y1="24" x2="24" y2="24" stroke="white" stroke-width="2" stroke-linecap="round"/>
  <line x1="12" y1="13" x2="24" y2="13" stroke="white" stroke-width="2" stroke-linecap="round"/>
  <line x1="14" y1="13" x2="14" y2="24" stroke="white" stroke-width="2" stroke-linecap="round"/>
  <line x1="18" y1="13" x2="18" y2="24" stroke="white" stroke-width="2" stroke-linecap="round"/>
  <line x1="22" y1="13" x2="22" y2="24" stroke="white" stroke-width="2" stroke-linecap="round"/>`

// Montaña — Patrimonio Natural
// Pico principal + pico secundario más suave detrás
const montañaSVG = `
  <polyline points="10,26 18,12 26,26"
    fill="none" stroke="white" stroke-width="2"
    stroke-linejoin="round" stroke-linecap="round"/>
  <polyline points="15,26 20,18 25,26"
    fill="none" stroke="white" stroke-width="1.5" stroke-opacity="0.55"
    stroke-linejoin="round" stroke-linecap="round"/>`

// Huellas — Rastros de Memoria
// Dos plantas de pie como rectángulos redondeados rotados, en diagonal ascendente
const huellasSVG = `
  <rect x="10" y="17" width="7" height="10" rx="3.5"
    fill="none" stroke="white" stroke-width="1.8"
    transform="rotate(-12 13.5 22)"/>
  <rect x="19" y="9" width="7" height="10" rx="3.5"
    fill="none" stroke="white" stroke-width="1.8"
    transform="rotate(12 22.5 14)"/>`

// Cubiertos — Bar / Restaurant
// Tenedor (izquierda): mango + 2 puas externas + travesaño
// Cuchillo (derecha): hoja recta + curva de filo
const cubiertosSVG = `
  <line x1="14" y1="16" x2="14" y2="26" stroke="white" stroke-width="2" stroke-linecap="round"/>
  <line x1="12" y1="11" x2="12" y2="16" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="16" y1="11" x2="16" y2="16" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="12" y1="16" x2="16" y2="16" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="22" y1="11" x2="22" y2="26" stroke="white" stroke-width="2" stroke-linecap="round"/>
  <path d="M20 11 C22 12.5 22 15 22 16"
    fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round"/>`

// Bolsa — Comercio
const bolsaSVG = `
  <rect x="11" y="16" width="14" height="10" rx="2"
    fill="none" stroke="white" stroke-width="2"/>
  <path d="M15 16 C15 13 21 13 21 16"
    fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/>`

// ─── Exportaciones por nivel ──────────────────────────────────────────────────

// Nivel 1 — siempre visibles desde zoom 8
export const iconoArqueologico    = crearIconoCapa(vasijaSVG,    VERDE_CENIZA)
export const iconoLugarInteres    = crearIconoCapa(banderaSVG,   BLANCO)
export const iconoMuseo           = crearIconoCapa(columnasSVG,  AZUL_CENIZA)

// Nivel 2 — visible desde zoom 10
export const iconoPatrimonioNatural = crearIconoCapa(montañaSVG, BLANCO)

// Nivel 3 — visible desde zoom 12
export const iconoRastrosMemoria  = crearIconoCapa(huellasSVG,   BLANCO)

// Nivel 4 — visible desde zoom 14
export const iconoTuristico       = crearIconoCapa(banderaSVG,   GRIS)

// Nivel 5 — visible desde zoom 15
export const iconoComercial       = crearIconoCapa(bolsaSVG,     GRIS)
export const iconoComercialPremium = crearIconoCapa(bolsaSVG,    GRIS)
export const iconoBarRestaurant   = crearIconoCapa(cubiertosSVG, GRIS)

// Área difusa para códigos B y C (movida desde MapView.tsx)
// Se usa cuando el usuario no puede ver coordenadas exactas
export const areaB = crearIconoArea('#3b82f6')  // azul — código B
export const areaC = crearIconoArea('#374151')  // gris oscuro — código C