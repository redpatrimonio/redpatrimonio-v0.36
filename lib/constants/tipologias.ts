// lib/constants/tipologias.ts

// ========== CLASIFICACIÓN CMN ==========
export const CLASIFICACION_CMN = [
  'Sitio Arqueológico',
  'Hallazgo Aislado',
] as const

export type ClasificacionCMN = typeof CLASIFICACION_CMN[number]

// ========== CATEGORÍAS TEMÁTICAS (PARA FILTROS) ==========
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

// ========== TIPOLOGÍAS POR CATEGORÍA (MÚLTIPLES, OPCIONAL) ==========
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
    'Megalito',
  ],
  'Arte y Expresión Cultural': [
    'Petroglifo',
    'Pictografía',
    'Geoglifo',
    'Línea de piedra',
    'Grabado en roca',
    'Mural',
    'Megalito',
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

// ========== CULTURAS ==========
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
  'Otra',
  'Sin información',
] as const

// ========== PERIODOS ==========
export const PERIODOS = [
  'Prehispánico',
  'Histórico',
  'Ambos',
  'Sin información',
] as const

// ========== ESTADO CONSERVACIÓN ==========
export const ESTADO_CONSERVACION = [
  'Bueno',
  'Regular',
  'Grave',
  'Muy grave',
  'Destruido',
  'Sin información',
] as const

// ========== CONDICIÓN EMPLAZAMIENTO ==========
export const CONDICION_EMPLAZAMIENTO = [
  'A cielo abierto',
  'Cueva o Mina',
  'Subacuático',
  'Sin información',
] as const

// ========== TIPO PROPIEDAD ==========
export const TIPO_PROPIEDAD = [
  'Fiscal',
  'Privada',
  'Mixta',
  'Sin información',
] as const

// ========== USOS DE SUELO (CMN 2.8.1) ==========
export const USOS_SUELO = [
  'Agrícola',
  'Área verde',
  'Forestal',
  'Ganadero',
  'Industrial',
  'Infraestructura',
  'Minero',
  'Pesca',
  'Turismo',
  'Equipamiento - Residencial - Red vial',
  'Sin uso',
  'Otro',
  'Sin información',
] as const

// ========== NIVEL ACCESO ==========
export const NIVEL_ACCESO = [
  'Resguardado',
  'Restringido con autorización',
  'Prohibido',
] as const

// ========== REGIONES CHILE ==========
export const REGIONES = [
  'Arica y Parinacota',
  'Tarapacá',
  'Antofagasta',
  'Atacama',
  'Coquimbo',
  'Valparaíso',
  'Metropolitana',
  'O\'Higgins',
  'Maule',
  'Ñuble',
  'Biobío',
  'Araucanía',
  'Los Ríos',
  'Los Lagos',
  'Aysén',
  'Magallanes',
] as const

// ========== COMUNAS POR REGIÓN (SUBSET) ==========
export const COMUNAS_POR_REGION: { [key: string]: string[] } = {
  'Metropolitana': [
    'Santiago',
    'Cerrillos',
    'Cerro Navia',
    'Colina',
    'Conchalí',
    'El Bosque',
    'Estación Central',
    'Huechuraba',
    'Independencia',
    'La Cisterna',
    'La Florida',
    'La Granja',
    'La Pintana',
    'La Reina',
    'Las Condes',
    'Lo Barnechea',
    'Lo Espejo',
    'Lo Prado',
    'Macul',
    'Maipú',
    'Ñuñoa',
    'Pedro Aguirre Cerda',
    'Peñalolén',
    'Providencia',
    'Pudahuel',
    'Quilicura',
    'Quinta Normal',
    'Recoleta',
    'Renca',
    'San Joaquín',
    'San Miguel',
    'San Ramón',
    'Vitacura',
    'Puente Alto',
    'Pirque',
    'San José de Maipo',
    'Buin',
    'Calera de Tango',
    'Paine',
    'San Bernardo',
    'Talagante',
    'Melipilla',
  ],
  'Valparaíso': ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana', 'Casablanca', 'Isla de Pascua', 'San Antonio', 'Cartagena', 'Con-Con'],
  'Antofagasta': ['Antofagasta', 'Calama', 'Tocopilla', 'Mejillones', 'San Pedro de Atacama', 'Taltal'],
  'Arica y Parinacota': ['Arica', 'Putre', 'Camarones', 'General Lagos'],
  'Tarapacá': ['Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Pica', 'Huara', 'Camiña', 'Colchane'],
  'Atacama': ['Copiapó', 'Caldera', 'Chañaral', 'Diego de Almagro', 'Vallenar', 'Huasco'],
  'Coquimbo': ['La Serena', 'Coquimbo', 'Ovalle', 'Illapel', 'Vicuña', 'Andacollo'],
   'O\'Higgins': [
    'Rancagua', 'Machalí', 'Graneros', 'Codegua', 'Requínoa', 'Doñihue', 
    'Coltauco', 'Coinco', 'Olivar', 'Mostazal', 'San Vicente', 'Pichidegua',
    'Peumo', 'Las Cabras', 'San Fernando', 'Chimbarongo', 'Placilla', 
    'Nancagua', 'Chépica', 'Santa Cruz', 'Lolol', 'Pumanque', 'Palmilla',
    'Peralillo', 'Rengo', 'Malloa', 'Quinta de Tilcoco', 'Pichilemu',
    'Navidad', 'Litueche', 'La Estrella', 'Marchihue', 'Paredones'
  ],
  'Maule': [
    'Talca', 'Constitución', 'Curepto', 'Empedrado', 'Maule', 'Pelarco',
    'Pencahue', 'Río Claro', 'San Clemente', 'San Rafael', 'Cauquenes',
    'Chanco', 'Pelluhue', 'Curicó', 'Hualañé', 'Licantén', 'Molina',
    'Rauco', 'Romeral', 'Sagrada Familia', 'Teno', 'Vichuquén', 'Linares',
    'Colbún', 'Longaví', 'Parral', 'Retiro', 'San Javier', 'Villa Alegre',
    'Yerbas Buenas'
  ],
  'Ñuble': [
    'Chillán', 'Chillán Viejo', 'Bulnes', 'Cobquecura', 'Coelemu', 'Coihueco',
    'El Carmen', 'Ninhue', 'Ñiquén', 'Pemuco', 'Pinto', 'Portezuelo',
    'Quillón', 'Quirihue', 'Ránquil', 'San Carlos', 'San Fabián', 'San Ignacio',
    'San Nicolás', 'Treguaco', 'Yungay'
  ],
  'Biobío': [
    'Concepción', 'Coronel', 'Chiguayante', 'Florida', 'Hualqui', 'Lota',
    'Penco', 'San Pedro de la Paz', 'Santa Juana', 'Talcahuano', 'Tomé',
    'Hualpén', 'Lebu', 'Arauco', 'Cañete', 'Contulmo', 'Curanilahue',
    'Los Álamos', 'Tirúa', 'Los Ángeles', 'Antuco', 'Cabrero', 'Laja',
    'Mulchén', 'Nacimiento', 'Negrete', 'Quilaco', 'Quilleco', 'San Rosendo',
    'Santa Bárbara', 'Tucapel', 'Yumbel', 'Alto Biobío'
  ],
  'Araucanía': [
    'Temuco', 'Carahue', 'Cunco', 'Curarrehue', 'Freire', 'Galvarino',
    'Gorbea', 'Lautaro', 'Loncoche', 'Melipeuco', 'Nueva Imperial', 'Padre Las Casas',
    'Perquenco', 'Pitrufquén', 'Pucón', 'Saavedra', 'Teodoro Schmidt', 'Toltén',
    'Vilcún', 'Villarrica', 'Cholchol', 'Angol', 'Collipulli', 'Curacautín',
    'Ercilla', 'Lonquimay', 'Los Sauces', 'Lumaco', 'Purén', 'Renaico',
    'Traiguén', 'Victoria'
  ],
  'Los Ríos': [
    'Valdivia', 'Corral', 'Lanco', 'Los Lagos', 'Máfil', 'Mariquina',
    'Paillaco', 'Panguipulli', 'La Unión', 'Futrono', 'Lago Ranco', 'Río Bueno'
  ],
  'Los Lagos': [
    'Puerto Montt', 'Calbuco', 'Cochamó', 'Fresia', 'Frutillar', 'Los Muermos',
    'Llanquihue', 'Maullín', 'Puerto Varas', 'Castro', 'Ancud', 'Chonchi',
    'Curaco de Vélez', 'Dalcahue', 'Puqueldón', 'Queilén', 'Quellón', 'Quemchi',
    'Quinchao', 'Osorno', 'Puerto Octay', 'Purranque', 'Puyehue', 'Río Negro',
    'San Juan de la Costa', 'San Pablo', 'Chaitén', 'Futaleufú', 'Hualaihué',
    'Palena'
  ],
  'Aysén': [
    'Coyhaique', 'Lago Verde', 'Aysén', 'Cisnes', 'Guaitecas', 'Cochrane',
    'O\'Higgins', 'Tortel', 'Chile Chico', 'Río Ibáñez'
  ],
  'Magallanes': [
    'Punta Arenas', 'Laguna Blanca', 'Río Verde', 'San Gregorio', 'Cabo de Hornos',
    'Antártica', 'Porvenir', 'Primavera', 'Timaukel', 'Natales', 'Torres del Paine'
  ],
}

