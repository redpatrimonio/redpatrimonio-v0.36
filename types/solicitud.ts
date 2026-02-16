// Tipos para sistema de solicitudes de contacto

export interface InfoContactoSitio {
  id_info: string
  id_sitio: string
  
  // Campos estructurados (opcionales)
  nombre_contacto?: string | null
  email_contacto?: string | null
  telefono_contacto?: string | null
  organizacion?: string | null
  
  // Campo libre principal
  info_adicional?: string | null
  
  // Metadata
  creado_por?: string | null
  timestamp_creado?: string
  actualizado_por?: string | null
  timestamp_actualizado?: string | null
}

export interface SolicitudContacto {
  id_solicitud: string
  id_sitio: string
  id_usuario_solicitante: string
  
  // Solicitud
  motivo_solicitud: string
  info_adicional_solicitante?: string | null
  timestamp_solicitud: string
  
  // Estado
  estado: 'pendiente' | 'aprobada' | 'rechazada'
  timestamp_respuesta?: string | null
  id_usuario_revisor?: string | null
  notas_rechazo?: string | null
}

// Tipo extendido para mostrar en UI (con joins)
export interface SolicitudContactoExtendida extends SolicitudContacto {
  nombre_sitio?: string
  solicitante?: {
    nombre_completo: string
    email: string
  }
  revisor?: {
    nombre_completo: string
  }
}
