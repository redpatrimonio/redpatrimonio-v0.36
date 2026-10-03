export interface CompendioDef {
  slug: string
  nombre: string
  autor: string
  anio: number
  descripcionCorta: string
  referencia: string
}

export const COMPENDIOS_DISPONIBLES: CompendioDef[] = [
  {
    slug: 'stehberg_1975',
    nombre: 'Diccionario de sitios arqueológicos de Chile Central',
    autor: 'Rubén Stehberg',
    anio: 1975,
    descripcionCorta: 'Compendio histórico de sitios arqueológicos de Chile Central.',
    referencia: 'Stehberg, R. (1975). Diccionario de sitios arqueológicos de Chile Central. Publicación Ocasional N° 17, Museo Nacional de Historia Natural, Santiago de Chile.',
  },
]
