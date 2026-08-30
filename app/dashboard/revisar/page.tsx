'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  estado_validacion: string
  categoria_general: string | null
  tipo_riesgo_principal: string | null
  autor_reporte: string | null
  tipologia_especifica?: string[] | null
}

const LABELS_OBRA: Record<string, string> = {
  inmobiliario: 'Construcción / Inmobiliaria',
  transporte: 'Carretera / Camino',
  energia: 'Energía / Línea eléctrica',
  mineria: 'Minería / Cantera',
  agricola: 'Agrícola / Forestal',
  saqueo: 'Excavación no autorizada',
  turismo: 'Turismo / Tránsito',
  otro: 'Otra actividad',
}

export default function RevisarReportesPage() {
  const { usuario, loading: authLoading } = useAuth()
  const router = useRouter()
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [fotos, setFotos] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<TabFiltro>('todos')

  useEffect(() => {
    if (!authLoading && (!usuario || !['experto', 'partner', 'founder'].includes(usuario.rol))) {
      router.push('/perfil')
    }
  }, [usuario, authLoading, router])

  useEffect(() => {
    if (usuario && ['experto', 'partner', 'founder'].includes(usuario.rol)) {
      cargarReportes()
    }
  }, [usuario])

  async function cargarReportes() {
    try {
      setLoading(true)
      const { data, error: reportesError } = await supabase
        .from('reportes_nuevos')
        .select('id_reporte, nombre_reporte, region, comuna, timestamp_creado, estado_validacion, categoria_general, tipo_riesgo_principal, autor_reporte, tipologia_especifica')
        .eq('estado_validacion', 'rojo')
        .order('timestamp_creado', { ascending: false })

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
      console.error('Error cargando reportes:', err)
      setError('Error al cargar reportes pendientes de revisión')
    } finally {
      setLoading(false)
    }
  }

  const esRiesgo = (cat: string | null) => cat === 'arqueologia_en_riesgo'

  const reportesFiltrados = reportes.filter((r) => {
    if (tab === 'riesgo') return esRiesgo(r.categoria_general)
    if (tab === 'hallazgo') return !esRiesgo(r.categoria_general)
    return true
  })

  if (authLoading || loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg)' }}
      >
        <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--muted)' }}>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Cargando reportes para revisión...</span>
        </div>
      </div>
    )
  }

  if (!usuario || !['experto', 'partner', 'founder'].includes(usuario.rol)) {
    return null
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto">

        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--ladrillo)' }} />
              <span className="text-[11px] font-medium tracking-widest uppercase" style={{ color: 'var(--muted)' }}>
                Bandeja de Entrada · Estado Inicial
              </span>
            </div>
            <h1 className="font-display font-light text-3xl sm:text-4xl" style={{ color: 'var(--text)' }}>
              Revisar Reportes
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
              {reportes.length} reporte{reportes.length !== 1 ? 's' : ''} pendiente{reportes.length !== 1 ? 's' : ''} de validación técnica
            </p>
          </div>

          <Link
            href="/perfil"
            className="inline-flex items-center gap-2 text-xs font-medium px-3.5 py-2 rounded-lg transition self-start sm:self-auto"
            style={{
              backgroundColor: 'var(--surface-2)',
              color: 'var(--muted)',
              border: '1px solid var(--border-m)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Volver a Mi Panel
          </Link>
        </div>

        {error && (
          <div
            className="p-4 rounded-xl text-xs mb-6"
            style={{
              backgroundColor: 'rgba(168,80,64,0.08)',
              border: '1px solid rgba(168,80,64,0.3)',
              color: 'var(--ladrillo)',
            }}
          >
            {error}
          </div>
        )}

        {/* Filtro de pestañas */}
        <div
          className="flex gap-1 p-1 rounded-xl mb-6"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {(['todos', 'hallazgo', 'riesgo'] as TabFiltro[]).map((t) => {
            const count = t === 'todos'
              ? reportes.length
              : t === 'hallazgo'
                ? reportes.filter(r => !esRiesgo(r.categoria_general)).length
                : reportes.filter(r => esRiesgo(r.categoria_general)).length

            const isActive = tab === t
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2 px-3 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5"
                style={{
                  backgroundColor: isActive ? 'var(--surface-2)' : 'transparent',
                  color: isActive ? 'var(--text)' : 'var(--muted)',
                  border: isActive ? '1px solid var(--border-m)' : '1px solid transparent',
                }}
              >
                <span>
                  {t === 'todos' && 'Todos'}
                  {t === 'hallazgo' && 'Hallazgos'}
                  {t === 'riesgo' && 'Riesgo / Alerta'}
                </span>
                <span
                  className="text-[10px] px-1.5 py-0.2 rounded"
                  style={{
                    backgroundColor: isActive ? 'rgba(143,181,164,0.15)' : 'rgba(255,255,255,0.04)',
                    color: isActive ? 'var(--accent)' : 'var(--faint)',
                  }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Lista de reportes */}
        {reportesFiltrados.length === 0 ? (
          <div
            className="p-12 text-center rounded-2xl"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              No hay reportes pendientes en esta categoría
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {reportesFiltrados.map((reporte) => {
              const riesgo = esRiesgo(reporte.categoria_general)
              
              // Tipología o subtipo descriptivo
              const tipologia = riesgo
                ? (reporte.tipo_riesgo_principal && LABELS_OBRA[reporte.tipo_riesgo_principal]) 
                    ? `Afectación: ${LABELS_OBRA[reporte.tipo_riesgo_principal]}` 
                    : 'Aviso prioritario'
                : (Array.isArray(reporte.tipologia_especifica) && reporte.tipologia_especifica.length > 0)
                    ? reporte.tipologia_especifica[0]
                    : 'Sitio Arqueológico'

              return (
                <div
                  key={reporte.id_reporte}
                  onClick={() => router.push(`/dashboard/revisar/${reporte.id_reporte}`)}
                  className="group rounded-xl transition cursor-pointer overflow-hidden p-4 sm:p-5"
                  style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-m)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <div className="flex flex-row gap-4 sm:gap-5 items-start">
                    
                    {/* Foto cuadrada a la izquierda fija en móviles y desktop */}
                    <div
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}
                    >
                      {fotos[reporte.id_reporte] ? (
                        <img
                          src={fotos[reporte.id_reporte]}
                          alt={reporte.nombre_reporte}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--faint)' }}>
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="M21 15l-5-5L5 21" />
                        </svg>
                      )}
                    </div>

                    {/* Información a la derecha */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                      <div>
                        {/* Header de la card */}
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span
                            className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded"
                            style={{
                              backgroundColor: riesgo ? 'rgba(168,80,64,0.14)' : 'rgba(143,181,164,0.12)',
                              color: riesgo ? 'var(--ladrillo)' : 'var(--accent)',
                            }}
                          >
                            {riesgo ? 'Arqueología en Riesgo' : 'Reporte de Hallazgo'}
                          </span>
                          <span className="text-[11px]" style={{ color: 'var(--faint)' }}>
                            {new Date(reporte.timestamp_creado).toLocaleDateString('es-CL', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        {/* Título */}
                        <h2
                          className="font-display font-light text-lg sm:text-xl leading-snug truncate mb-1.5 group-hover:text-accent transition"
                          style={{ color: 'var(--text)' }}
                        >
                          {reporte.nombre_reporte}
                        </h2>

                        {/* Metas: Ubicación y Tipología */}
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs mb-2" style={{ color: 'var(--muted)' }}>
                          <span className="flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-6-5.33-6-10a6 6 0 1112 0c0 4.67-6 10-6 10z" />
                              <circle cx="12" cy="11" r="2" />
                            </svg>
                            {reporte.region || 'Sin región'}{reporte.comuna ? `, ${reporte.comuna}` : ''}
                          </span>
                          <span style={{ color: 'var(--faint)' }}>•</span>
                          <span className="truncate">{tipologia}</span>
                        </div>
                      </div>

                      {/* Footer: Reportante y botón */}
                      <div className="flex items-center justify-between pt-2 border-t text-xs mt-1" style={{ borderColor: 'var(--border)' }}>
                        <span className="truncate max-w-[65%]" style={{ color: 'var(--faint)' }}>
                          Por:{' '}
                          <span style={{ color: 'var(--muted)' }}>
                            {reporte.autor_reporte?.replace('[privado] ', '') || 'Anónimo'}
                          </span>
                        </span>

                        <div className="flex items-center gap-1 text-xs font-medium flex-shrink-0" style={{ color: 'var(--accent)' }}>
                          <span>Revisar</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
