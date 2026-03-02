import L from 'leaflet'

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

// Montaña — geografico
const geoSVG = `
  <polyline points="10,26 18,12 26,26"
    fill="none" stroke="white" stroke-width="2"
    stroke-linejoin="round" stroke-linecap="round"/>
  <polyline points="14,26 20,18 28,26"
    fill="none" stroke="white" stroke-width="2" stroke-opacity="0.5"
    stroke-linejoin="round" stroke-linecap="round"/>`

// Columnas — turistico
const turSVG = `
  <line x1="12" y1="24" x2="24" y2="24" stroke="white" stroke-width="2" stroke-linecap="round"/>
  <line x1="12" y1="13" x2="24" y2="13" stroke="white" stroke-width="2" stroke-linecap="round"/>
  <line x1="14" y1="13" x2="14" y2="24" stroke="white" stroke-width="2" stroke-linecap="round"/>
  <line x1="18" y1="13" x2="18" y2="24" stroke="white" stroke-width="2" stroke-linecap="round"/>
  <line x1="22" y1="13" x2="22" y2="24" stroke="white" stroke-width="2" stroke-linecap="round"/>`

// Bolsa/comercio — comercial
const comSVG = `
  <rect x="11" y="16" width="14" height="10" rx="2"
    fill="none" stroke="white" stroke-width="2"/>
  <path d="M15 16 C15 13 21 13 21 16"
    fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/>`

// Ojo — memoria
const memSVG = `
  <path d="M8 18 C11 13 25 13 28 18 C25 23 11 23 8 18Z"
    fill="none" stroke="white" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="18" cy="18" r="3"
    fill="none" stroke="white" stroke-width="2"/>`

export const iconoGeografico  = crearIconoCapa(geoSVG, '#2d6a4f')
export const iconoTuristico   = crearIconoCapa(turSVG, '#1d3557')
export const iconoComercial   = crearIconoCapa(comSVG, '#e76f51')
export const iconoComercialPremium = crearIconoCapa(comSVG, '#f4a261')
export const iconoMemoria     = crearIconoCapa(memSVG, '#6b3fa0')
