'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'

const supabase = createClient()

interface AgregarInfoContactoModalProps {
  idSitio: string
  idSolicitud: string
  nombreSitio: string
  onClose: () => void
  onSuccess?: () => void
}

export function AgregarInfoContactoModal({ 
  idSitio, 
  idSolicitud,
  nombreSitio, 
  onClose,
  onSuccess 
}: AgregarInfoContactoModalProps) {
  const { user } = useAuth()
  
  const [formData, setFormData] = useState({
    nombre_contacto: '',
    email_contacto: '',
    telefono_contacto: '',
    organizacion: '',
    info_adicional: ''
  })
  
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault()
    
    if (!user) return
    if (!formData.nombre_contacto && !formData.email_contacto && !formData.telefono_contacto) {
      setError('Debes llenar al menos un campo de contacto')
      return
    }
    
    setGuardando(true)
    setError(null)

    try {
      // 1. Insertar o actualizar info de contacto
      const { error: infoError } = await supabase
        .from('info_contacto_sitios')
        .upsert({
          id_sitio: idSitio,
          nombre_contacto: formData.nombre_contacto || null,
          email_contacto: formData.email_contacto || null,
          telefono_contacto: formData.telefono_contacto || null,
          organizacion: formData.organizacion || null,
          info_adicional: formData.info_adicional || null,
          creado_por: user.id,
          timestamp_creado: new Date().toISOString(),
          actualizado_por: user.id,
          timestamp_actualizado: new Date().toISOString()
        }, {
          onConflict: 'id_sitio'
        })

      if (infoError) throw infoError

      // 2. Actualizar solicitud a "aprobada"
      const { error: solicitudError } = await supabase
        .from('solicitudes_contacto')
        .update({
          estado: 'aprobada',
          timestamp_respuesta: new Date().toISOString(),
          id_usuario_revisor: user.id
        })
        .eq('id_solicitud', idSolicitud)

      if (solicitudError) throw solicitudError

      alert('✅ Solicitud aprobada e info de contacto guardada')
      onSuccess?.()
      onClose()
    } catch (err: any) {
      console.error('Error guardando info:', err)
      setError(err.message || 'Error al guardar información')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Agregar Información de Contacto
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          {nombreSitio}
        </p>

        <form onSubmit={handleGuardar} className="space-y-4">
          
          {/* Nombre Contacto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de contacto
            </label>
            <input
              type="text"
              value={formData.nombre_contacto}
              onChange={(e) => setFormData({ ...formData, nombre_contacto: e.target.value })}
              placeholder="Ej: Juan Pérez"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email de contacto
            </label>
            <input
              type="email"
              value={formData.email_contacto}
              onChange={(e) => setFormData({ ...formData, email_contacto: e.target.value })}
              placeholder="contacto@ejemplo.cl"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono de contacto
            </label>
            <input
              type="tel"
              value={formData.telefono_contacto}
              onChange={(e) => setFormData({ ...formData, telefono_contacto: e.target.value })}
              placeholder="+56 9 1234 5678"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Organización */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organización (opcional)
            </label>
            <input
              type="text"
              value={formData.organizacion}
              onChange={(e) => setFormData({ ...formData, organizacion: e.target.value })}
              placeholder="Ej: Universidad de Chile"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Info adicional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Información adicional (opcional)
            </label>
            <textarea
              value={formData.info_adicional}
              onChange={(e) => setFormData({ ...formData, info_adicional: e.target.value })}
              placeholder="Horarios de atención, restricciones de acceso, etc."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {guardando ? 'Guardando...' : 'Guardar y Aprobar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
