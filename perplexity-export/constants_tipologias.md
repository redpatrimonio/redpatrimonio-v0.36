## lib/constants/tipologias.ts
```typescript
// Clasificación CMN (Consejo Monumentos Nacionales)
export const CLASIFICACION_CMN = [
  'Sitio Arqueológico',
  'Hallazgo Aislado',
 
] as const

// Categorías temáticas
export const CATEGORIAS = [
  'Sitios habitacionales',
  'Arte rupestre',
  'Estructuras ceremoniales o funerarias',
  'Infraestructura productiva',
  'Sistemas viales',
  'Fortificaciones',
  'Hallazgos aislados',
  'Arquitectura histórica',
  'Patrimonio industrial',
  'Otro'
] as const

// Tipologías por categoría
export const TIPOLOGIAS: Record<string, string[]> = {
  'Sitios habitacionales': [
    'Aldea',
    'Campamento',
    'Conchales',
    'Refugio rocoso',
    'Pukará',
    'Tambo',
    'Complejo habitacional'
  ],
  'Arte rupestre': [
    'Petroglifos',
    'Pictografías',
    'Geoglifos',
    'Arte mobiliar'
  ],
  'Estructuras ceremoniales o funerarias': [
    'Túmulo funerario',
    'Cementerio',
    'Chenque',
    'Ushnu',
    'Altar',
    'Plataforma ceremonial',
    'Sepultura'
  ],
  'Infraestructura productiva': [
    'Terrazas de cultivo',
    'Sistema de riego',
    'Corrales',
    'Apachetas',
    'Colcas (depósitos)',
    'Salinas',
    'Minas',
    'Canteras'
  ],
  'Sistemas viales': [
    'Qhapaq Ñan (Camino Inca)',
    'Camino tropero',
    'Puente',
    'Tambo'
  ],
  'Fortificaciones': [
    'Pukará',
    'Muralla',
    'Torre de vigilancia'
  ],
  'Hallazgos aislados': [
    'Material lítico',
    'Material cerámico',
    'Material óseo',
    'Material textil',
    'Resto arquitectónico aislado'
  ],
  'Arquitectura histórica': [
    'Iglesia o capilla',
    'Hacienda',
    'Casona',
    'Fuerte o fortín',
    'Faro',
    'Estación ferroviaria',
    'Puente histórico'
  ],
  'Patrimonio industrial': [
    'Salitreras',
    'Minas',
    'Molinos',
    'Fundiciones',
    'Hornos',
    'Talleres'
  ],
  'Otro': [
    'No determinado',
    'Otro (especificar)'
  ]
}

// Culturas prehispánicas e históricas
export const CULTURAS = [
  'Inca',
  'Diaguita',
  'Molle',
  'Atacameña',
  'Aymara',
  'Mapuche',
  'Huilliche',
  'Pehuenche',
  'Picunche',
  'Chango',
  'Selk\'nam',
  'Yagán',
  'Kawésqar',
  'Tehuelche',
  'Chinchorro',
  'Tiwanaku',
  'Colonial',
  'Republicano',
  'No determinado',
  'Otro'
] as const

// Periodos cronológicos
export const PERIODOS = [
  'Arcaico',
  'Formativo',
  'Intermedio Tardío',
  'Tardío/Inca',
  'Colonial',
  'Republicano',
  'Contemporáneo',
  'No determinado'
] as const

// Estados de conservación
export const ESTADO_CONSERVACION = [
  'Bueno',
  'Regular',
  'Malo',
  'En ruinas',
  'Destruido',
  'No determinado'
] as const

// Condición de emplazamiento
export const CONDICION_EMPLAZAMIENTO = [
  'In situ',
  'Alterado',
  'Descontextualizado',
  'Removido',
  'No determinado'
] as const

// Tipo de propiedad
export const TIPO_PROPIEDAD = [
  'Fiscal',
  'Privada',
  'Comunitaria',
  'Municipal',
  'Mixta',
  'No determinado'
] as const

// Nivel de acceso (CON DESCRIPCIONES)
export const NIVEL_ACCESO = [
  {
    valor: 'Espacio Publico',
    descripcion: 'Libre acceso sin restricciones. Ej: plaza, camino, orilla de río.'
  },
  {
    valor: 'Area Protegida',
    descripcion: 'Administrado por institución. Con horarios, guías o guardaparques. Ej: Parque Nacional, Reserva.'
  },
  {
    valor: 'Acceso Restringido',
    descripcion: 'Requiere autorización previa del propietario o administrador.'
  },
  {
    valor: 'Prohibido',
    descripcion: 'Acceso no permitido. Sitio cerrado al público.'
  }
]

// Usos de suelo actuales
export const USOS_SUELO = [
  'Agrícola',
  'Ganadero',
  'Forestal',
  'Minero',
  'Urbano',
  'Industrial',
  'Turístico',
  'Conservación',
  'Sin uso aparente',
  'Otro'
] as const

// Regiones de Chile
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
  'Magallanes'
] as const

// Comunas por región (muestra - expandir según necesidad)
export const COMUNAS: Record<string, string[]> = {
  'Metropolitana': ['Santiago', 'Providencia', 'Las Condes', 'Maipú', 'Puente Alto', 'La Florida', 'Peñalolén', 'Ñuñoa', 'Quilicura', 'Cerrillos', 'Estación Central', 'Renca', 'Huechuraba', 'Independencia', 'Recoleta', 'Conchalí', 'Lo Prado', 'Quinta Normal', 'Pudahuel', 'Cerro Navia', 'Lo Barnechea', 'Vitacura', 'Macul', 'San Joaquín', 'La Granja', 'La Pintana', 'San Ramón', 'San Miguel', 'La Cisterna', 'El Bosque', 'Pedro Aguirre Cerda', 'Lo Espejo', 'PAC', 'San Bernardo', 'Puente Alto', 'Pirque', 'San José de Maipo', 'Colina', 'Lampa', 'Tiltil', 'Padre Hurtado', 'Peñaflor', 'Talagante', 'El Monte', 'Isla de Maipo', 'Curacaví', 'María Pinto', 'Melipilla', 'Alhué', 'San Pedro', 'Buin', 'Paine', 'Calera de Tango'],
  'Valparaíso': ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana', 'Casablanca', 'Isla de Pascua', 'San Antonio', 'Cartagena', 'Con-Con'],
  'Antofagasta': ['Antofagasta', 'Calama', 'Tocopilla', 'Mejillones', 'San Pedro de Atacama', 'Taltal'],
  'Arica y Parinacota': ['Arica', 'Putre', 'Camarones', 'General Lagos'],
  'Tarapacá': ['Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Pica', 'Huara', 'Camiña', 'Colchane'],
  'Atacama': ['Copiapó', 'Caldera', 'Chañaral', 'Diego de Almagro', 'Vallenar', 'Huasco'],
  'Coquimbo': ['La Serena', 'Coquimbo', 'Ovalle', 'Illapel', 'Vicuña', 'Andacollo'],
  'O\'Higgins': ['Rancagua', 'Machalí', 'Graneros', 'Codegua', 'Requínoa', 'Doñihue', 'Coltauco', 'Coinco', 'Olivar', 'Mostazal', 'San Vicente', 'Pichidegua', 'Peumo', 'Las Cabras', 'San Fernando', 'Chimbarongo', 'Placilla', 'Nancagua', 'Chépica', 'Santa Cruz', 'Lolol', 'Pumanque', 'Palmilla', 'Peralillo', 'Rengo', 'Malloa', 'Quinta de Tilcoco', 'Pichilemu', 'Navidad', 'Litueche', 'La Estrella', 'Marchihue', 'Paredones'],
  'Maule': ['Talca', 'Constitución', 'Curepto', 'Empedrado', 'Maule', 'Pelarco', 'Pencahue', 'Río Claro', 'San Clemente', 'San Rafael', 'Cauquenes', 'Chanco', 'Pelluhue', 'Curicó', 'Hualañé', 'Licantén', 'Molina', 'Rauco', 'Romeral', 'Sagrada Familia', 'Teno', 'Vichuquén', 'Linares', 'Colbún', 'Longaví', 'Parral', 'Retiro', 'San Javier', 'Villa Alegre', 'Yerbas Buenas'],
  'Ñuble': ['Chillán', 'Chillán Viejo', 'Bulnes', 'Cobquecura', 'Coelemu', 'Coihueco', 'El Carmen', 'Ninhue', 'Ñiquén', 'Pemuco', 'Pinto', 'Portezuelo', 'Quillón', 'Quirihue', 'Ránquil', 'San Carlos', 'San Fabián', 'San Ignacio', 'San Nicolás', 'Treguaco', 'Yungay'],
  'Biobío': ['Concepción', 'Talcahuano', 'Hualpén', 'Chiguayante', 'San Pedro de la Paz', 'Penco', 'Tomé', 'Coronel', 'Lota', 'Hualqui', 'Santa Juana', 'Laja', 'Quilleco', 'Cabrero', 'Yumbel', 'Tucapel', 'Antuco', 'San Rosendo', 'Los Ángeles', 'Nacimiento', 'Negrete', 'Mulchén', 'Quilaco', 'Santa Bárbara', 'Lebu', 'Arauco', 'Curanilahue', 'Los Álamos', 'Cañete', 'Contulmo', 'Tirúa'],
  'Araucanía': ['Temuco', 'Padre Las Casas', 'Lautaro', 'Perquenco', 'Vilcún', 'Cunco', 'Melipeuco', 'Curarrehue', 'Pucón', 'Villarrica', 'Freire', 'Pitrufquén', 'Gorbea', 'Loncoche', 'Toltén', 'Teodoro Schmidt', 'Saavedra', 'Carahue', 'Nueva Imperial', 'Cholchol', 'Galvarino', 'Ercilla', 'Collipulli', 'Lonquimay', 'Curacautín', 'Victoria', 'Traiguén', 'Lumaco', 'Purén', 'Los Sauces', 'Angol', 'Renaico'],
  'Los Ríos': ['Valdivia', 'Mariquina', 'Lanco', 'Los Lagos', 'Futrono', 'Río Bueno', 'La Unión', 'Paillaco', 'Corral', 'Máfil', 'Panguipulli', 'Lago Ranco'],
  'Los Lagos': ['Puerto Montt', 'Puerto Varas', 'Osorno', 'Castro', 'Ancud', 'Quellón', 'Chonchi', 'Dalcahue', 'Puqueldón', 'Quemchi', 'Quinchao', 'Curaco de Vélez', 'Calbuco', 'Cochamó', 'Fresia', 'Frutillar', 'Llanquihue', 'Los Muermos', 'Maullín', 'San Juan de la Costa', 'San Pablo', 'Purranque', 'Puyehue', 'Río Negro', 'Puerto Octay', 'Chaitén', 'Futaleufú', 'Hualaihué', 'Palena'],
  'Aysén': ['Coyhaique', 'Aysén', 'Chile Chico', 'Cisnes', 'Cochrane', 'Guaitecas', 'Lago Verde', 'O\'Higgins', 'Río Ibáñez', 'Tortel'],
  'Magallanes': ['Punta Arenas', 'Puerto Natales', 'Porvenir', 'Primavera', 'Timaukel', 'Cabo de Hornos', 'Antártica', 'Laguna Blanca', 'Río Verde', 'San Gregorio', 'Torres del Paine']
}
```
