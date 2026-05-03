'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

interface ReportePublicado {
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
  nivel_acceso: string | null
  origen_acceso: string | null
  nivel_accesibilidad: string | null
  codigo_accesibilidad: string | null
  amenazas: string | null
  recinto_privado: boolean
  estado_validacion: string
  timestamp_creado: string
  timestamp_publicacion: string | null
  autor_reporte: string | null
  id_usuario: string | null
  telefono_usuario_contacto: string | null
  contacto_propietario_posible: boolean | null
  contacto_propietario_info: string | null
  es_anonimo: boolean | null
  autoriza_contacto: boolean | null
  correo_usuario_contacto: string | null
  temporalidad_riesgo: string | null
  id_usuario_publico: string | null
}

interface Medio {
  id_medio: string
  url_publica: string
  descripcion_imagen: string | null
  tipo_medio: string | null
}

const TEMPO_LABEL: Record<string, string> = {
  pasado: '🪨 Ya ocurrió',
  activo: '🚨 Está ocurriendo',
  inminente: '⚠️ Va a ocurrir',
}

export default function PublicadoDetallePage() {
  const params = useParams()
  const id = params?.id as string
  const { usuario, loading: authLoading } = useAuth()
  const router = useRouter()

  const [reporte, setReporte] = useState<ReportePublicado | null>(null)
  const [medios, setMedios] = useState<Medio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mostrarMedios, setMostrarMedios] = useState(false)

  useEffect(() => {
    if (!authLoading && (!usuario || !['partner', 'founder'].includes(usuario.rol))) {
      router.push('/perfil')
    }
  }, [usuario, authLoading, router])

  useEffect(() => {
    if (id && usuario && ['partner', 'founder'].includes(usuario.rol)) {
      cargarReporte()
    }
  }, [id, usuario])

  async function cargarReporte() {
    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('reportes_nuevos')
        .select('*')
        .eq('id_reporte', id)
        .single()

      if (err) throw err
      setReporte(data)

      const { data: mediosData } = await supabase
        .from('reportes_medios')
        .select('*')
        .eq('id_reporte', id)
        .order('prioridad_visualizacion', { ascending: false })

      setMedios(mediosData || [])
    } catch (err) {
      console.error('Error cargando reporte publicado:', err)
      setError('Error al cargar el reporte')
    } finally {
      setLoading(false)
    }
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
        <p className="text-red-600">Reporte no encontrado</p>
      </div>
    )
  }

  const esRiesgo = reporte.categoria_general === 'arqueologia_en_riesgo'
  const fotos = medios.filter(m => m.tipo_medio === 'foto' || !m.tipo_medio)
  const videos = medios.filter(m => m.tipo_medio === 'video')

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <button
                onClick={() => router.push('/dashboard/publicados')}
                className="text-gray-500 hover:text-gray-900 text-sm mb-3 flex items-center gap-1"
              >
                ← Volver a publicados
              </button>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {reporte.nombre_reporte}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">VERDE</span>
                {esRiesgo && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">🚨 RIESGO</span>
                )}
                {reporte.codigo_accesibilidad && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-mono">
                    Código: {reporte.codigo_accesibilidad}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                ID: {reporte.id_reporte}
                {reporte.timestamp_publicacion && (
                  <> &nbsp;•&nbsp; Publicado: {new Date(reporte.timestamp_publicacion).toLocaleString('es-CL')}</>
                )}
              </p>
            </div>

            {/* Botón generar — riesgo navega a /denuncia/[id], hallazgo placeholder */}
            <button
              onClick={() =>
                esRiesgo
                  ? router.push(`/denuncia/${reporte.id_reporte}`)
                  : alert('🛠️ Próximamente: Generar ficha de registro')
              }
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold text-sm text-white transition ${
                esRiesgo
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {esRiesgo ? '📎 Generar denuncia CMN' : '📎 Generar ficha registro'}
            </button>
          </div>
        </div>

        {/* ── Banner riesgo ── */}
        {esRiesgo && (
          <div className="rounded-xl px-5 py-4 flex items-start gap-3"
            style={{ background: '#7f1d1d', border: '2px solid #dc2626' }}>
            <span className="text-2xl flex-shrink-0">🚨</span>
            <div>
              <p className="text-white font-extrabold text-base">ARQUEOLOGÍA EN RIESGO</p>
              {reporte.temporalidad_riesgo && (
                <p className="text-red-200 text-sm font-semibold mt-0.5">
                  {TEMPO_LABEL[reporte.temporalidad_riesgo] ?? reporte.temporalidad_riesgo}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Contacto ── */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b flex items-center gap-2">
            <span>👤</span> Quién reportó
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Nombre / Alias</p>
              <p className="text-sm text-gray-900">
                {reporte.autor_reporte || <span className="text-gray-400 italic">Anónimo</span>}
              </p>
            </div>
            {esRiesgo && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Identidad</p>
                <p className="text-sm">
                  {reporte.es_anonimo
                    ? <span className="text-gray-500">Anónimo</span>
                    : <span className="text-green-700 font-medium">Identificado</span>
                  }
                </p>
              </div>
            )}
            {esRiesgo && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Correo</p>
                <p className="text-sm">
                  {reporte.correo_usuario_contacto
                    ? <a href={`mailto:${reporte.correo_usuario_contacto}`} className="text-blue-600 underline">{reporte.correo_usuario_contacto}</a>
                    : <span className="text-gray-400 italic">No informado</span>
                  }
                </p>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Teléfono</p>
              <p className="text-sm">
                {reporte.telefono_usuario_contacto
                  ? <a href={`tel:${reporte.telefono_usuario_contacto}`} className="text-blue-600 underline">{reporte.telefono_usuario_contacto}</a>
                  : <span className="text-gray-400 italic">No informado</span>
                }
              </p>
            </div>
            {esRiesgo && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Autoriza contacto</p>
                <p className="text-sm font-medium">
                  {reporte.autoriza_contacto
                    ? <span className="text-green-700">✓ Sí</span>
                    : <span className="text-gray-400">No</span>
                  }
                </p>
              </div>
            )}
            {!esRiesgo && reporte.contacto_propietario_posible && (
              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Contacto propietario</p>
                <p className="text-sm text-gray-900">{reporte.contacto_propietario_info || <span className="text-gray-400 italic">Sin detalle</span>}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Ubicación ── */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b">Ubicación</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Field label="Región" value={reporte.region} />
            <Field label="Comuna" value={reporte.comuna} />
            <Field label="Coordenadas" value={`${reporte.latitud}, ${reporte.longitud}`} />
            <Field label="Recinto privado" value={reporte.recinto_privado ? 'Sí' : 'No'} />
            {reporte.descripcion_ubicacion && (
              <div className="md:col-span-2">
                <Field label="Descripción" value={reporte.descripcion_ubicacion} />
              </div>
            )}
          </div>
        </div>

        {/* ── Caracterización ── */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b">Caracterización</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Field label="Categoría" value={reporte.categoria_general} />
            <Field label="Tipología" value={reporte.tipologia_especifica?.join(', ')} />
            <Field label="Cultura" value={reporte.cultura_asociada} />
            <Field label="Periodo" value={reporte.periodo_cronologico} />
            <Field label="Estado conservación" value={reporte.estado_conservacion} />
            <Field label="Nivel protección" value={reporte.nivel_proteccion} />
            <Field label="Origen acceso" value={reporte.origen_acceso} />
            <Field label="Nivel accesibilidad" value={reporte.nivel_accesibilidad} />
          </div>
          {reporte.amenazas && (
            <div className="mt-4">
              <Field label={esRiesgo ? 'Descripción del daño' : 'Amenazas'} value={reporte.amenazas} />
            </div>
          )}
        </div>

        {/* ── Medios ── */}
        {medios.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <button
              onClick={() => setMostrarMedios(!mostrarMedios)}
              className="w-full flex items-center justify-between text-base font-bold text-gray-900"
            >
              <span>🖼️ Medios ({medios.length})</span>
              <span className="text-gray-400 text-sm">{mostrarMedios ? '▲ Ocultar' : '▼ Ver'}</span>
            </button>
            {mostrarMedios && (
              <div className="mt-4">
                {fotos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {fotos.map((foto) => (
                      <div key={foto.id_medio}>
                        <a href={foto.url_publica} target="_blank" rel="noopener noreferrer">
                          <img
                            src={foto.url_publica}
                            alt={foto.descripcion_imagen || 'Foto'}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition"
                          />
                        </a>
                        {foto.descripcion_imagen && (
                          <p className="text-xs text-gray-500 mt-1">{foto.descripcion_imagen}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {videos.length > 0 && (
                  <div className="space-y-2">
                    {videos.map((video) => (
                      <a
                        key={video.id_medio}
                        href={video.url_publica}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 underline"
                      >
                        🎥 {video.descripcion_imagen || video.url_publica}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-gray-900">
        {value || <span className="text-gray-400 italic">No informado</span>}
      </p>
    </div>
  )
}
