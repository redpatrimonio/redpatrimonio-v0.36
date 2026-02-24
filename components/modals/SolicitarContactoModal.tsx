'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'

const supabase = createClient()

interface SolicitarContactoModalProps {
  idSitio: string
  nombreSitio: string
  onClose: () => void
  onSuccess?: () => void
}

export function SolicitarContactoModal({ 
  idSitio, 
  nombreSitio, 
  onClose,
  onSuccess 
}: SolicitarContactoModalProps) {
  // FIX C-2: era "user", AuthProvider exporta "usuario"
  const { usuario } = useAuth()
  const [motivo, setMotivo] = useState('')
  const [infoAdicional, setInfoAdicional] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault()
    
    // FIX C-2: era user.id
    if (!usuario || !motivo.trim()) return
    
    setEnviando(true)
    setError(null)

    try {
      const { error: insertError } = await supabase
        .from('solicitudes_contacto')
        .insert({
          id_sitio: idSitio,
          // FIX C-2: era user.id
          id_usuario_solicitante: usuario.id_usuario,
          motivo_solicitud: motivo.trim(),
          info_adicional_solicitante: infoAdicional.trim() || null
        })

      if (insertError) throw insertError

      onSuccess?.()
      onClose()
      alert('✅ Solicitud enviada correctamente')
    } catch (err: any) {
      console.error('Error enviando solicitud:', err)
      setError(err.message || 'Error al enviar solicitud')
    } finally {
      setEnviando(false)
    }
  }

  return (
    // FIX z-index: era z-50, ahora z-[2000] para quedar sobre FichaSitioModal
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Solicitar información de contacto
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          {nombreSitio}
        </p>

        <form onSubmit={handleEnviar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo de la solicitud *
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Explica brevemente por qué necesitas esta información..."
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Información adicional (opcional)
            </label>
            <textarea
              value={infoAdicional}
              onChange={(e) => setInfoAdicional(e.target.value)}
              placeholder="Detalles sobre tu investigación, institución, etc."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-gray-600"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={enviando}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando || !motivo.trim()}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enviando ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
