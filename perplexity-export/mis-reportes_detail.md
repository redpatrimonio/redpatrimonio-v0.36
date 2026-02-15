## app/mis-reportes/[id]/page.tsx
```tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  CLASIFICACION_CMN,
  CATEGORIAS,
  TIPOLOGIAS,
  CULTURAS,
  PERIODOS,
  ESTADO_CONSERVACION,
  CONDICION_EMPLAZAMIENTO,
  TIPO_PROPIEDAD,
  NIVEL_ACCESO,
  USOS_SUELO,
} from '@/lib/constants/tipologias'

const supabase = createClient()

interface ReporteCompleto {
  id_reporte: string
  nombre_sitio: string | null
  nombre_reporte: string
  latitud: number
  longitud: number
  region: string | null
  comuna: string | null
  descripcion_ubicacion: string | null
  categoria_sitio: string | null
  categoria_general: string | null
  tipologia_especifica: string[] | null
  cultura_asociada: string | null
  periodo_cronologico: string | null
  cronologia_general: string | null
  estado_conservacion: string | null
  condicion_emplazamiento: string | null
  tipo_propiedad: string | null
  nivel_acceso: string
  uso_suelo_actual: string | null
  uso_suelo_otro: string | null
  amenazas: string | null
  contacto_propietario_posible: boolean | null
  contacto_propietario_info: string | null
  telefono_usuario_contacto: string | null
  recinto_privado: boolean
  tipo_riesgo_principal: string | null
  nivel_proteccion: string | null
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
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<Partial<ReporteCompleto>>({})

  const esEditable = reporte?.estado_validacion === 'rojo'

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (id && user && !authLoading) {
      cargarReporte()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, authLoading])

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
      setFormData(reporteData)

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

  async function handleGuardar() {
    try {
      setGuardando(true)
      setError('')

      const { error: updateError } = await supabase
        .from('reportes_nuevos')
        .update({
          nombre_sitio: formData.nombre_sitio,
          nombre_reporte: formData.nombre_reporte,
          region: formData.region,
          comuna: formData.comuna,
          descripcion_ubicacion: formData.descripcion_ubicacion,
          categoria_sitio: formData.categoria_sitio,
          categoria_general: formData.categoria_general,
          tipologia_especifica: formData.tipologia_especifica,
          cultura_asociada: formData.cultura_asociada,
          periodo_cronologico: formData.periodo_cronologico,
          cronologia_general: formData.cronologia_general,
          estado_conservacion: formData.estado_conservacion,
          condicion_emplazamiento: formData.condicion_emplazamiento,
          tipo_propiedad: formData.tipo_propiedad,
          nivel_acceso: formData.nivel_acceso,
          uso_suelo_actual: formData.uso_suelo_actual,
          uso_suelo_otro: formData.uso_suelo_otro,
          amenazas: formData.amenazas,
          contacto_propietario_posible: formData.contacto_propietario_posible,
          contacto_propietario_info: formData.contacto_propietario_info,
          telefono_usuario_contacto: formData.telefono_usuario_contacto,
          tipo_riesgo_principal: formData.tipo_riesgo_principal,
          nivel_proteccion: formData.nivel_proteccion,
          recinto_privado: formData.recinto_privado,
        })
        .eq('id_reporte', id)

      if (updateError) throw updateError
      alert('✓ Cambios guardados')
      await cargarReporte()
    } catch (err) {
      console.error('Error guardando:', err)
      setError('Error al guardar cambios')
    } finally {
      setGuardando(false)
    }
  }

  function getEstadoInfo(estado: string) {
    const config = {
      rojo: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        label: 'PENDIENTE REVISIÓN',
        mensaje: 'Puedes editar tu reporte mientras está en revisión',
      },
      amarillo: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        label: 'EN REVISIÓN',
        mensaje: 'Tu reporte fue aprobado y ya no puede editarse',
      },
      verde: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        label: 'PUBLICADO',
        mensaje: '¡Tu reporte está publicado en el mapa!',
      },
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
              {esEditable ? '✏️' : 'ℹ️'} {estadoInfo.mensaje}
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

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Ubicación */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Ubicación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Sitio</label>
                {esEditable ? (
                  <input
                    type="text"
                    value={formData.nombre_sitio || ''}
                    onChange={(e) => setFormData({ ...formData, nombre_sitio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B] text-gray-900 bg-white"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{reporte.nombre_sitio || reporte.nombre_reporte}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Región</label>
                {esEditable ? (
                  <input
                    type="text"
                    value={formData.region || ''}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B] text-gray-900 bg-white"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{reporte.region || '-'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comuna</label>
                {esEditable ? (
                  <input
                    type="text"
                    value={formData.comuna || ''}
                    onChange={(e) => setFormData({ ...formData, comuna: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B] text-gray-900 bg-white"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{reporte.comuna || '-'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Coordenadas (no editables)
                </label>
                <p className="text-gray-900 py-2">
                  {reporte.latitud}, {reporte.longitud}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción Ubicación</label>
              {esEditable ? (
                <textarea
                  value={formData.descripcion_ubicacion || ''}
                  onChange={(e) => setFormData({ ...formData, descripcion_ubicacion: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B] text-gray-900 bg-white"
                />
              ) : (
                <p className="text-gray-900">{reporte.descripcion_ubicacion || '-'}</p>
              )}
            </div>
          </div>

          {/* Caracterización */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Caracterización</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clasificación CMN</label>
                {esEditable ? (
                  <select
                    value={formData.categoria_sitio || ''}
                    onChange={(e) => setFormData({ ...formData, categoria_sitio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B] text-gray-900 bg-white"
                  >
                    <option value="" className="text-gray-400">Seleccionar...</option>
                    {CLASIFICACION_CMN.map((c) => (
                      <option key={c} value={c} className="text-gray-900">
                        {c}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900 py-2">{reporte.categoria_sitio || '-'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría Temática</label>
                {esEditable ? (
                  <select
                    value={formData.categoria_general || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        categoria_general: e.target.value,
                        tipologia_especifica: null,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B] text-gray-900 bg-white"
                  >
                    <option value="" className="text-gray-400">Seleccionar...</option>
                    {CATEGORIAS.map((cat) => (
                      <option key={cat} value={cat} className="text-gray-900">
                        {cat}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900 py-2">{reporte.categoria_general || '-'}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipologías</label>
                <p className="text-gray-900 py-2">
                  {reporte.tipologia_especifica?.join(', ') || 'No determinado'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cultura</label>
                {esEditable ? (
                  <select
                    value={formData.cultura_asociada || ''}
                    onChange={(e) => setFormData({ ...formData, cultura_asociada: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B] text-gray-900 bg-white"
                  >
                    <option value="" className="text-gray-400">Seleccionar...</option>
                    {CULTURAS.map((cult) => (
                      <option key={cult} value={cult} className="text-gray-900">
                        {cult}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900 py-2">{reporte.cultura_asociada || '-'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Periodo</label>
                {esEditable ? (
                  <select
                    value={formData.periodo_cronologico || ''}
                    onChange={(e) => setFormData({ ...formData, periodo_cronologico: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B] text-gray-900 bg-white"
                  >
                    <option value="" className="text-gray-400">Seleccionar...</option>
                    {PERIODOS.map((per) => (
                      <option key={per} value={per} className="text-gray-900">
                        {per}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900 py-2">{reporte.periodo_cronologico || '-'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Condición */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
              Condición y Conservación
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado Conservación</label>
                {esEditable ? (
                  <select
                    value={formData.estado_conservacion || ''}
                    onChange={(e) => setFormData({ ...formData, estado_conservacion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B] text-gray-900 bg-white"
                  >
                    <option value="" className="text-gray-400">Seleccionar...</option>
                    {ESTADO_CONSERVACION.map((est) => (
                      <option key={est} value={est} className="text-gray-900">
                        {est}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900 py-2">{reporte.estado_conservacion || '-'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condición Emplazamiento</label>
                {esEditable ? (
                  <select
                    value={formData.condicion_emplazamiento || ''}
                    onChange={(e) => setFormData({ ...formData, condicion_emplazamiento: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B] text-gray-900 bg-white"
                  >
                    <option value="" className="text-gray-400">Seleccionar...</option>
                    {CONDICION_EMPLAZAMIENTO.map((cond) => (
                      <option key={cond} value={cond} className="text-gray-900">
                        {cond}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900 py-2">{reporte.condicion_emplazamiento || '-'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Propiedad</label>
                <p className="text-gray-900 py-2">{reporte.tipo_propiedad || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nivel Acceso</label>
                <p className="text-gray-900 py-2">{reporte.nivel_acceso}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Uso de Suelo</label>
                <p className="text-gray-900 py-2">
                  {reporte.uso_suelo_actual || '-'}
                  {reporte.uso_suelo_otro && ` (${reporte.uso_suelo_otro})`}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amenazas</label>
                <p className="text-gray-900 py-2">{reporte.amenazas || '-'}</p>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Información de Contacto</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-700">
                  <strong>¿Contacto propietario posible?</strong>{' '}
                  {reporte.contacto_propietario_posible === true
                    ? 'Sí'
                    : reporte.contacto_propietario_posible === false
                    ? 'No'
                    : '-'}
                </p>
              </div>
              {reporte.contacto_propietario_info && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Info contacto propietario
                  </label>
                  <p className="text-gray-900">{reporte.contacto_propietario_info}</p>
                </div>
              )}
              {reporte.telefono_usuario_contacto && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono usuario (para contacto)
                  </label>
                  <p className="text-gray-900">{reporte.telefono_usuario_contacto}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botón Guardar (solo si editable) */}
        {esEditable && (
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="w-full px-6 py-3 rounded-lg font-medium disabled:opacity-50 text-white"
            style={{ backgroundColor: '#10454B' }}
          >
            {guardando ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        )}
      </div>
    </div>
  )
}
```
