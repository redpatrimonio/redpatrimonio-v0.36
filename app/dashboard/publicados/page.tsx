'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export const dynamic = 'force-dynamic'

type TabFiltro = 'todos' | 'hallazgo' | 'riesgo'

interface Reporte {
  id_reporte: string
  nombre_reporte: string
  region: string | null
  comuna: string | null
  timestamp_creado: string
  timestamp_publicacion: string | null
  categoria_general: string | null
}

export default function PublicadosPage() {
  const { usuario, loading: authLoading } = useAuth()
  const router = useRouter()

  const [reportes, setReportes] = useState<Reporte[]>([])
  const [fotos, setFotos] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<TabFiltro>('todos')

  useEffect(() => {
    if (!authLoading && (!usuario || !['partner', 'founder'].includes(usuario.rol))) {
      router.push('/perfil')
    }
  }, [usuario, authLoading, router])

  useEffect(() => {
    if (usuario && ['partner', 'founder'].includes(usuario.rol)) {
      cargarReportes()
    }
  }, [usuario])

  async function cargarReportes() {
    try {
      setLoading(true)
      const { data, error: reportesError } = await supabase
        .from('reportes_nuevos')
        .select('id_reporte, nombre_reporte, region, comuna, timestamp_creado, timestamp_publicacion, categoria_general')
        .eq('estado_validacion', 'verde')
        .order('timestamp_publicacion', { ascending: false })

      if (reportesError) throw reportesError
      setReportes(data || [])

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
    } catch (err) {
      console.error('Error cargando publicados:', err)
      setError('Error al cargar reportes publicados')
    } finally {
      setLoading(false)
    }
  }

  const reportesFiltrados = reportes.filter((r) => {
    if (tab === 'riesgo') return r.categoria_general === 'arqueologia_en_riesgo'
    if (tab === 'hallazgo') return r.categoria_general !== 'arqueologia_en_riesgo'
    return true
  })

  const esRiesgo = (cat: string | null) => cat === 'arqueologia_en_riesgo'

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    )
  }

  if (!usuario || !['partner', 'founder'].includes(usuario.rol)) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Reportes Publicados</h1>
            <p className="text-gray-600">{reportes.length} reporte{reportes.length !== 1 ? 's' : ''} en estado verde</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/aprobar')}
            className="text-gray-600 hover:text-gray-900 text-sm mt-2"
          >
            ← Volver
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-lg shadow p-1 mb-6">
          {(['todos', 'hallazgo', 'riesgo'] as TabFiltro[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition ${
                tab === t
                  ? t === 'riesgo'
                    ? 'bg-red-600 text-white'
                    : 'bg-green-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t === 'todos' && `Todos (${reportes.length})`}
              {t === 'hallazgo' && `Hallazgos (${reportes.filter(r => !esRiesgo(r.categoria_general)).length})`}
              {t === 'riesgo' && `🚨 Riesgo (${reportes.filter(r => esRiesgo(r.categoria_general)).length})`}
            </button>
          ))}
        </div>

        {/* Lista */}
        {reportesFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No hay reportes en esta categoría</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reportesFiltrados.map((reporte) => (
              <div
                key={reporte.id_reporte}
                onClick={() => router.push(`/dashboard/publicados/${reporte.id_reporte}`)}
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
                    <div className="flex items-start gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                        {reporte.nombre_reporte}
                      </h3>
                      {esRiesgo(reporte.categoria_general) && (
                        <span className="flex-shrink-0 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                          🚨 RIESGO
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {reporte.categoria_general || 'Sin categoría'}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span>📍 {reporte.region || 'Sin región'}</span>
                      {reporte.comuna && <span>• {reporte.comuna}</span>}
                      <span>
                        • Publicado: {reporte.timestamp_publicacion
                          ? new Date(reporte.timestamp_publicacion).toLocaleDateString('es-CL')
                          : new Date(reporte.timestamp_creado).toLocaleDateString('es-CL')
                        }
                      </span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                        VERDE
                      </span>
                    </div>
                  </div>

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
