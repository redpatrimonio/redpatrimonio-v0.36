import { Database } from './database'

// Tipos de las tablas
export type Usuario = Database['public']['Tables']['usuarios_autorizados']['Row']
export type UsuarioInsert = Database['public']['Tables']['usuarios_autorizados']['Insert']
export type UsuarioUpdate = Database['public']['Tables']['usuarios_autorizados']['Update']

export type Reporte = Database['public']['Tables']['reportes_nuevos']['Row']
export type ReporteInsert = Database['public']['Tables']['reportes_nuevos']['Insert']
export type ReporteUpdate = Database['public']['Tables']['reportes_nuevos']['Update']

export type ReporteMedio = Database['public']['Tables']['reportes_medios']['Row']
export type ReporteMedioInsert = Database['public']['Tables']['reportes_medios']['Insert']

export type Sitio = Database['public']['Tables']['sitios_master']['Row']
export type SitioInsert = Database['public']['Tables']['sitios_master']['Insert']
export type SitioUpdate = Database['public']['Tables']['sitios_master']['Update']

export type Medio = Database['public']['Tables']['medios']['Row']
export type MedioInsert = Database['public']['Tables']['medios']['Insert']

// Tipos de roles
export type Rol = 'founder' | 'partner' | 'experto' | 'publico'

// Tipos de estados de validación
export type EstadoValidacion = 'rojo' | 'amarillo' | 'verde'

// Tipo para Supabase Client
export type { Database }

import type { CapaTipo } from './database'

// Estado de visibilidad de capas en el mapa (para los toggles)
export interface EstadoCapas {
  geografico: boolean
  turistico: boolean
  comercial: boolean
  memoria: boolean
}

// Configuración visual por capa
export interface ConfigCapa {
  label: string
  color: string
  emoji: string
  zoomDefault: number
}

export const CONFIG_CAPAS: Record<CapaTipo | 'memoria', ConfigCapa> = {
  geografico: {
    label: 'Geografía / Natural',
    color: '#2d6a4f',
    emoji: '🏔',
    zoomDefault: 6,
  },
  turistico: {
    label: 'Turístico / Cultural',
    color: '#1d3557',
    emoji: '🏛',
    zoomDefault: 10,
  },
  comercial: {
    label: 'Comercial',
    color: '#e76f51',
    emoji: '🏪',
    zoomDefault: 12,
  },
  memoria: {
    label: 'Memoria de Sitio',
    color: '#6b3fa0',
    emoji: '👁',
    zoomDefault: 10,
  },
}
