export interface ReporteData {
  // Ubicación
  latitud: number
  longitud: number
  region: string
  comuna: string

  // Identificación
  nombre: string
  clasificacionCMN: string
  categoria: string
  tipologia: string[]
  cultura?: string
  periodo?: string
  declarado_cmn?: string

  // Condición
  estadoconservacion: string
  condicionEmplazamiento: string
  descripcion: string
  tipoPropiedad: string
  nivelacceso: string
  usoSuelo?: string
  usoSueloOtro?: string
  amenazas?: string
  contactoPropietarioPosible?: boolean
  contactoPropietarioInfo?: string
  telefonoUsuarioContacto?: string

  // Legado (opcional, mantener compatibilidad)
  recintoprivado?: boolean
  tiporiesgo?: string
  nivelproteccion?: string
}
