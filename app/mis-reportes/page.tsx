'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

interface ReporteCompleto {
  id_reporte: string
  nombre_reporte: string
  latitud: number
  longitud: number
  region: string | null
  comuna: string | null
  descripcion_ubicacion: string | null
  categoria_general: string | null
  tipologia_especifica: string[] | null
  cultura_asociada: string | null
  periodo_cronologico: string | null
  estado_conservacion: string | null
  tipo_riesgo_principal: string | null
  nivel_proteccion: string | null
  nivel_acceso: string
  amenazas: string | null
  recinto_privado: boolean
  estado_validacion: string
  timestamp_creado: string
  id_usuario: string
}

interface Foto {
  id_medio: string
  url_publica: string
  descripcion_imagen: string | null
}

export default function MiReportePage() {
  const params = useParams()
  const id = params?.id as string
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [reporte, setReporte] = useState<ReporteCompleto | null>(null)
  const [fotos, setFotos] = useState<Foto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (id && user) {
      cargarReporte()
    }
  }, [id, user])

  async function cargarReporte() {
    if (!user) return

    try {
      setLoading(true)
      const { data: reporteData, error: reporteError } = await supabase
        .from('reportes_nuevos')
        .select('*')
        .eq('id_reporte', id)
        .eq('id_usuario', user.id)
        .single()

      if (reporteError) throw reporteError
      setReporte(reporteData)

      const { data: fotosData } = await supabase
        .from('reportes_medios')
        .select('*')
        .eq('id_reporte', id)
        .order('prioridad_visualizacion', { ascending: false })

      setFotos(fotosData || [])
    } catch (err) {
      console.error('Error cargando reporte:', err)
      setError('Error al cargar el reporte o no tienes permisos')
    } finally {
      setLoading(false)
    }
  }

  function getEstadoInfo(estado: string) {
    const config = {
      rojo: { bg: 'bg-red-100', text: 'text-red-700', label: 'PENDIENTE REVISIÓN', mensaje: 'Tu reporte está pendiente de revisión por un experto' },
      amarillo: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'EN REVISIÓN', mensaje: 'Tu reporte fue aprobado y está siendo revisado por un partner' },
      verde: { bg: 'bg-green-100', text: 'text-green-700', label: 'PUBLICADO', mensaje: '¡Tu reporte está publicado y visible en el mapa!' },
    }[estado] || { bg: 'bg-gray-100', text: 'text-gray-700', label: estado.toUpperCase(), mensaje: '' }

    return config
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    )
  }

  if (!reporte) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Reporte no encontrado o no tienes permisos</p>
          <button
            onClick={() => router.push('/mis-reportes')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Volver a mis reportes
          </button>
        </div>
      </div>
    )
  }

  const estadoInfo = getEstadoInfo(reporte.estado_validacion)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/mis-reportes')}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              ← Volver
            </button>
            <span className={`px-3 py-1 ${estadoInfo.bg} ${estadoInfo.text} rounded-full text-sm font-semibold`}>
              {estadoInfo.label}
            </span>
          </div>
          <p className="text-xs text-gray-500">ID: {reporte.id_reporte}</p>
          <p className="text-xs text-gray-500">
            Creado: {new Date(reporte.timestamp_creado).toLocaleString('es-CL')}
          </p>
          {estadoInfo.mensaje && (
            <p className={`mt-3 text-sm ${estadoInfo.text} font-medium`}>
              ℹ️ {estadoInfo.mensaje}
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Galería Fotos */}
        {fotos.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fotos ({fotos.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {fotos.map((foto) => (
                <div key={foto.id_medio} className="relative">
                  <img
                    src={foto.url_publica}
                    alt={foto.descripcion_imagen || 'Foto'}
                    className="w-full h-32 object-cover rounded-lg border border-gray-300"
                  />
                  {foto.descripcion_imagen && (
                    <p className="text-xs text-gray-600 mt-1">{foto.descripcion_imagen}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Información del Reporte */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          
          {/* Ubicación */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Ubicación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Nombre Sitio</p>
                <p className="text-gray-900">{reporte.nombre_reporte}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Región</p>
                <p className="text-gray-900">{reporte.region || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Comuna</p>
                <p className="text-gray-900">{reporte.comuna || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Coordenadas</p>
                <p className="text-gray-900">{reporte.latitud}, {reporte.longitud}</p>
              </div>
            </div>
            {reporte.descripcion_ubicacion && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500 mb-1">Descripción Ubicación</p>
                <p className="text-gray-900">{reporte.descripcion_ubicacion}</p>
              </div>
            )}
          </div>

          {/* Caracterización */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Caracterización</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Categoría General</p>
                <p className="text-gray-900">{reporte.categoria_general || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Tipología</p>
                <p className="text-gray-900">{reporte.tipologia_especifica?.[0] || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Cultura</p>
                <p className="text-gray-900">{reporte.cultura_asociada || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Periodo</p>
                <p className="text-gray-900">{reporte.periodo_cronologico || '-'}</p>
              </div>
            </div>
          </div>

          {/* Estado */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Estado y Conservación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Estado Conservación</p>
                <p className="text-gray-900">{reporte.estado_conservacion || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Tipo Riesgo</p>
                <p className="text-gray-900">{reporte.tipo_riesgo_principal || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Nivel Protección</p>
                <p className="text-gray-900">{reporte.nivel_proteccion || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Nivel Acceso</p>
                <p className="text-gray-900">{reporte.nivel_acceso}</p>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          {(reporte.amenazas || reporte.recinto_privado) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Observaciones</h3>
              {reporte.amenazas && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-500 mb-1">Amenazas</p>
                  <p className="text-gray-900">{reporte.amenazas}</p>
                </div>
              )}
              {reporte.recinto_privado && (
                <p className="text-sm text-gray-700">
                  🔒 Este sitio se encuentra en recinto privado
                </p>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  )
}
