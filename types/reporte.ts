// types/reporte.ts

export type ReporteData = {
  // PASO 1: Ubicación
  latitud?: number
  longitud?: number
  region?: string
  comuna?: string

  // PASO 2: Identificación
  nombre?: string
  clasificacionCMN?: string // 'Sitio Arqueológico' | 'Hallazgo Aislado'
  categoria?: string // Categoría temática (8 opciones)
  tipologia?: string[] // Array, OPCIONAL, default ['No determinado']
  cultura?: string
  periodo?: string

  // PASO 3: Condición y Contexto
  estadoconservacion?: string
  condicionEmplazamiento?: string
  descripcion?: string
  tipoPropiedad?: string
  nivelacceso?: string
  usoSuelo?: string
  usoSueloOtro?: string
  amenazas?: string
  contactoPropietarioPosible?: boolean
  contactoPropietarioInfo?: string
  telefonoUsuarioContacto?: string

  // Legado (mantener compatibilidad)
  recintoprivado?: boolean
  tiporiesgo?: string
  nivelproteccion?: string
}
