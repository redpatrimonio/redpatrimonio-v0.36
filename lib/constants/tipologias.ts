// lib/constants/tipologias.ts

export const CATEGORIAS = [
  'Monumentos Arquitectónicos',
  'Arte y Expresión Cultural',
  'Sitios Funerarios',
  'Asentamientos Humanos',
  'Infraestructura Prehispánica',
  'Hallazgos y Evidencias',
  'Qhapaq Ñan',
  'Sitios Ceremoniales',
] as const

export type Categoria = typeof CATEGORIAS[number]

export const TIPOLOGIAS: { [key in Categoria]: string[] } = {
  'Monumentos Arquitectónicos': [
    'Pucará',
    'Tambo',
    'Ushnu',
    'Colca',
    'Pirca',
    'Andén',
    'Kancha',
    'Kallanka',
    'Torreón',
    'Apacheta',
    'Muro perimetral',
    'Plaza ceremonial',
    'Plataforma',
    'Recinto habitacional',
    'Estructura circular',
    'Megalito', // ✅ NUEVO
  ],
  'Arte y Expresión Cultural': [
    'Petroglifo',
    'Pictografía',
    'Geoglifo',
    'Línea de piedra',
    'Grabado en roca',
    'Mural',
    'Megalito', // ✅ NUEVO (también aquí)
  ],
  'Sitios Funerarios': [
    'Cementerio precolombino',
    'Túmulo',
    'Enterratorio',
    'Chullpa',
    'Momia',
    'Contexto funerario',
    'Estructura circular',
  ],
  'Asentamientos Humanos': [
    'Aldea',
    'Poblado',
    'Campamento',
    'Conchales',
    'Alero habitado',
    'Cueva habitada',
    'Refugio',
    'Asentamiento',
    'Recinto habitacional',
  ],
  'Infraestructura Prehispánica': [
    'Camino del Inca',
    'Sendero prehispánico',
    'Canal de riego',
    'Acequia',
    'Puente precolombino',
    'Pozo de agua',
    'Mina prehispánica',
    'Cantera',
    'Salinera',
    'Andén',
  ],
  'Hallazgos y Evidencias': [
    'Cerámica dispersa',
    'Lítico',
    'Concha trabajada',
    'Textil',
    'Metal trabajado',
    'Osamentas humanas',
    'Restos arqueológicos',
    'Petroglifo',
  ],
  'Qhapaq Ñan': [
    'Pucará',
    'Tambo',
    'Camino del Inca',
    'Sendero prehispánico',
    'Puente precolombino',
  ],
  'Sitios Ceremoniales': [
    'Santuario de altura',
    'Templo',
    'Altar',
    'Sitio de ofrendas',
    'Huaca',
    'Centro ceremonial',
    'Ushnu',
    'Kallanka',
  ],
}

export const NIVEL_ACCESO = [
  { value: 'publico', label: 'Público - Accesible sin restricciones' },
  { value: 'restringido', label: 'Restringido - Requiere autorización (no mostrar en mapa)' },
  { value: 'resguardado', label: 'Resguardado - Con resguardo (nivel por defecto)' },
] as const

export const ESTADO_CONSERVACION = [
  'Excelente',
  'Bueno',
  'Regular',
  'Malo',
  'Ruinoso',
  'Destruido',
] as const

export const CULTURAS = [
  'Inca',
  'Diaguita',
  'Atacameña',
  'Mapuche',
  'Aonikenk',
  'Chango',
  'Chinchorro',
  'Huentelauquén',
  'El Molle',
  'Las Ánimas',
  'Aconcagua',
  'Chono',
  'Kawésqar',
  'Yagán',
  'Indeterminada',
  'Otra',
] as const

export const PERIODOS = [
  'Arcaico',
  'Formativo',
  'Intermedio Tardío',
  'Inca',
  'Contacto español',
  'Indeterminado',
] as const
