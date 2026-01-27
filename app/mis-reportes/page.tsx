'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

interface Reporte {
  id_reporte: string
  nombre_reporte: string
  region: string | null
  comuna: string | null
  timestamp_creado: string
  estado_validacion: string
  categoria_general: string | null
}

export default function MisReportesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [fotos, setFotos] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && !authLoading) {
      cargarReportes()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading])

  async function cargarReportes() {
    if (!user) return
    
    try {
      setLoading(true)
      setError('')
      
      const { data, error: reportesError } = await supabase
        .from('reportes_nuevos')
        .select('id_reporte, nombre_reporte, region, comuna, timestamp_creado, estado_validacion, categoria_general')
        .eq('id_usuario', user.id)
        .order('timestamp_creado', { ascending: false })

      if (reportesError) throw reportesError
      setReportes(data || [])

      // Cargar primera foto de cada reporte
      const fotosMap: Record<string, string> = {}
      for (const reporte of data || []) {
        const { data: fotoData } = await supabase
          .from('reportes_medios')
          .select('url_publica')
          .eq('id_reporte', reporte.id_reporte)
          .order('prioridad_visualizacion', { ascending: false })
          .limit(1)

        if (fotoData && fotoData.length > 0) {
          fotosMap[reporte.id_reporte] = fotoData[0].url_publica
        }
      }
      setFotos(fotosMap)
    } catch (err: any) {
      console.error('Error cargando reportes:', err)
      setError(err.message || 'Error al cargar reportes')
    } finally {
      setLoading(false)
    }
  }

  function getEstadoBadge(estado: string) {
    const config = {
      rojo: { bg: 'bg-red-100', text: 'text-red-700', label: 'PENDIENTE' },
      amarillo: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'EN REVISIÓN' },
      verde: { bg: 'bg-green-100', text: 'text-green-700', label: 'PUBLICADO' },
    }[estado] || { bg: 'bg-gray-100', text: 'text-gray-700', label: estado.toUpperCase() }

    return (
      <span className={`px-2 py-0.5 ${config.bg} ${config.text} rounded-full font-medium text-xs`}>
        {config.label}
      </span>
    )
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando tus reportes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Reportes</h1>
        <p className="text-gray-600 mb-6">Reportes que has creado</p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {reportes.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <p className="text-blue-900 text-lg mb-4">📝 No has creado reportes todavía</p>
            <button
              onClick={() => router.push('/reportar')}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Crear mi primer reporte
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reportes.map((reporte) => (
              <div
                key={reporte.id_reporte}
                onClick={() => router.push(`/mis-reportes/${reporte.id_reporte}`)}
                className="bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Foto */}
                  <div className="w-full sm:w-32 h-32 bg-gray-200 flex-shrink-0">
                    {fotos[reporte.id_reporte] ? (
                      <img
                        src={fotos[reporte.id_reporte]}
                        alt={reporte.nombre_reporte}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                        📷
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {reporte.nombre_reporte}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {reporte.categoria_general || 'Sin categoría'}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span>📍 {reporte.region || 'Sin región'}</span>
                      {reporte.comuna && <span>• {reporte.comuna}</span>}
                      <span>
                        • {new Date(reporte.timestamp_creado).toLocaleDateString('es-CL')}
                      </span>
                      {getEstadoBadge(reporte.estado_validacion)}
                    </div>
                  </div>

                  {/* Flecha */}
                  <div className="flex items-center justify-center px-4 text-gray-400">
                    →
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
