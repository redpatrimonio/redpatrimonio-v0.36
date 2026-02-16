'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { InfoContactoSitio } from '@/types/solicitud'

const supabase = createClient()

interface InfoContactoDisplayProps {
  idSitio: string
  className?: string
}

export function InfoContactoDisplay({ idSitio, className = '' }: InfoContactoDisplayProps) {
  const [info, setInfo] = useState<InfoContactoSitio | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarInfo()
  }, [idSitio])

  async function cargarInfo() {
    try {
      const { data, error } = await supabase
        .from('info_contacto_sitios')
        .select('*')
        .eq('id_sitio', idSitio)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        console.error('Error cargando info contacto:', error)
      }
      
      setInfo(data)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-100 rounded-lg p-4 ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      </div>
    )
  }

  if (!info) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <p className="text-sm text-gray-500 italic">
          No hay información de contacto disponible para este sitio
        </p>
      </div>
    )
  }

  return (
    <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span>📞</span>
        Información de contacto
      </h4>
      
      <div className="space-y-2 text-sm">
        {info.nombre_contacto && (
          <p>
            <strong className="text-gray-700">Contacto:</strong>{' '}
            <span className="text-gray-900">{info.nombre_contacto}</span>
          </p>
        )}
        
        {info.email_contacto && (
          <p>
            <strong className="text-gray-700">Email:</strong>{' '}
            <a 
              href={`mailto:${info.email_contacto}`}
              className="text-blue-600 hover:underline"
            >
              {info.email_contacto}
            </a>
          </p>
        )}
        
        {info.telefono_contacto && (
          <p>
            <strong className="text-gray-700">Teléfono:</strong>{' '}
            <a 
              href={`tel:${info.telefono_contacto}`}
              className="text-blue-600 hover:underline"
            >
              {info.telefono_contacto}
            </a>
          </p>
        )}
        
        {info.organizacion && (
          <p>
            <strong className="text-gray-700">Organización:</strong>{' '}
            <span className="text-gray-900">{info.organizacion}</span>
          </p>
        )}
        
        {info.info_adicional && (
          <div className="mt-3 pt-3 border-t border-green-300">
            <p className="text-gray-900 whitespace-pre-wrap">
              {info.info_adicional}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
