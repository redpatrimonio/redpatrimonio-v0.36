// lib/constants/accesibilidad.ts
// Constantes para el sistema de accesibilidad v0.4

/**
 * Origen de acceso del sitio
 */
export const ORIGEN_ACCESO = ['publico', 'privado'] as const;

/**
 * Niveles de accesibilidad
 * - abierto: Libre acceso sin restricciones
 * - controlado: Con horarios, guías o condiciones específicas
 * - protegido: Requiere autorización previa (ubicación aproximada para público)
 * - restringido: Acceso prohibido o altamente restringido (solo experto+)
 */
export const NIVEL_ACCESIBILIDAD = [
  'abierto',
  'controlado',
  'protegido',
  'restringido'
] as const;

/**
 * Códigos de accesibilidad (calculados automáticamente)
 * - A: abierto/controlado - visible para todos
 * - B: protegido - visible para logueados, ubicación aproximada
 * - C: restringido - visible solo para experto+
 */
export const CODIGO_ACCESIBILIDAD = ['A', 'B', 'C'] as const;

/**
 * Tipos TypeScript para accesibilidad
 */
export type OrigenAcceso = typeof ORIGEN_ACCESO[number];
export type NivelAccesibilidad = typeof NIVEL_ACCESIBILIDAD[number];
export type CodigoAccesibilidad = typeof CODIGO_ACCESIBILIDAD[number];

/**
 * Configuración visual para marcadores en el mapa
 */
export const CONFIGURACION_VISUAL = {
  A: {
    tipo: 'pin',
    color: '#777C3B',
    borderColor: '#FFFFFF',
    borderWidth: 1,
    label: 'Abierto/Controlado',
    size: 'medium-small' // ~30-35px altura
  },
  B: {
    tipo: 'punto_con_area',
    colorPunto: '#41494F',
    borderColor: '#FFFFFF',
    borderWidth: 1,
    colorArea: '#395673',
    opacidadArea: 0.2,
    radioArea: 250, // metros
    label: 'Protegido',
    size: 'small' // ~12-14px diámetro punto
  },
  C: {
    tipo: 'punto',
    color: '#333232',
    borderColor: '#FFFFFF',
    borderWidth: 1,
    label: 'Restringido',
    size: 'small' // ~12-14px diámetro punto
  }
} as const;

/**
 * Radio del área difusa para código B (en metros)
 */
export const RADIO_AREA_PROTEGIDA = 250;
