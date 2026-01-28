'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIAS, TIPOLOGIAS, CULTURAS, PERIODOS, ESTADO_CONSERVACION } from '@/lib/constants/tipologias'

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
          nombre_reporte: formData.nombre_reporte,
          region: formData.region,
          comuna: formData.comuna,
          descripcion_ubicacion: formData.descripcion_ubicacion,
          categoria_general: formData.categoria_general,
          tipologia_especifica: formData.tipologia_especifica,
          cultura_asociada: formData.cultura_asociada,
          periodo_cronologico: formData.periodo_cronologico,
          estado_conservacion: formData.estado_conservacion,
          tipo_riesgo_principal: formData.tipo_riesgo_principal,
          nivel_proteccion: formData.nivel_proteccion,
          nivel_acceso: formData.nivel_acceso,
          amenazas: formData.amenazas,
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
      rojo: { bg: 'bg-red-100', text: 'text-red-700', label: 'PENDIENTE REVISIÓN', mensaje: 'Puedes editar tu reporte mientras está en revisión' },
      amarillo: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'EN REVISIÓN', mensaje: 'Tu reporte fue aprobado y ya no puede editarse' },
      verde: { bg: 'bg-green-100', text: 'text-green-700', label: 'PUBLICADO', mensaje: '¡Tu reporte está publicado en el mapa!' },
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
                    value={formData.nombre_reporte || ''}
                    onChange={(e) => setFormData({ ...formData, nombre_reporte: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{reporte.nombre_reporte}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Región</label>
                {esEditable ? (
                  <input
                    type="text"
                    value={formData.region || ''}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{reporte.comuna || '-'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Coordenadas (no editables)</label>
                <p className="text-gray-900 py-2">{reporte.latitud}, {reporte.longitud}</p>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción Ubicación</label>
              {esEditable ? (
                <textarea
                  value={formData.descripcion_ubicacion || ''}
                  onChange={(e) => setFormData({ ...formData, descripcion_ubicacion: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder:text-gray-400"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría General</label>
                {esEditable ? (
                  <select
                    value={formData.categoria_general || ''}
                    onChange={(e) => setFormData({ ...formData, categoria_general: e.target.value, tipologia_especifica: null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="" className="text-gray-400">Seleccionar...</option>
                    {CATEGORIAS.map((cat) => (
                      <option key={cat} value={cat} className="text-gray-900">{cat}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900 py-2">{reporte.categoria_general || '-'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipología</label>
                {esEditable ? (
                  <select
                    value={formData.tipologia_especifica?.[0] || ''}
                    onChange={(e) => setFormData({ ...formData, tipologia_especifica: e.target.value ? [e.target.value] : null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    disabled={!formData.categoria_general}
                  >
                    <option value="" className="text-gray-400">Seleccionar...</option>
                    {formData.categoria_general && TIPOLOGIAS[formData.categoria_general as keyof typeof TIPOLOGIAS]?.map((tip) => (
                      <option key={tip} value={tip} className="text-gray-900">{tip}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900 py-2">{reporte.tipologia_especifica?.[0] || '-'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cultura</label>
                {esEditable ? (
                  <select
                    value={formData.cultura_asociada || ''}
                    onChange={(e) => setFormData({ ...formData, cultura_asociada: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="" className="text-gray-400">Seleccionar...</option>
                    {CULTURAS.map((cult) => (
                      <option key={cult} value={cult} className="text-gray-900">{cult}</option>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="" className="text-gray-400">Seleccionar...</option>
                    {PERIODOS.map((per) => (
                      <option key={per} value={per} className="text-gray-900">{per}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900 py-2">{reporte.periodo_cronologico || '-'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Estado */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Estado y Conservación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado Conservación</label>
                {esEditable ? (
                  <select
                    value={formData.estado_conservacion || ''}
                    onChange={(e) => setFormData({ ...formData, estado_conservacion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="" className="text-gray-400">Seleccionar...</option>
                    {ESTADO_CONSERVACION.map((est) => (
                      <option key={est} value={est} className="text-gray-900">{est}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900 py-2">{reporte.estado_conservacion || '-'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Riesgo</label>
                {esEditable ? (
                  <input
                    type="text"
                    value={formData.tipo_riesgo_principal || ''}
                    onChange={(e) => setFormData({ ...formData, tipo_riesgo_principal: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder:text-gray-400"
                    placeholder="Ej: Erosión, vandalismo..."
                  />
                ) : (
                  <p className="text-gray-900 py-2">{reporte.tipo_riesgo_principal || '-'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nivel Protección</label>
                {esEditable ? (
                  <select
                    value={formData.nivel_proteccion || ''}
                    onChange={(e) => setFormData({ ...formData, nivel_proteccion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="" className="text-gray-400">Seleccionar...</option>
                    <option value="Monumento Nacional" className="text-gray-900">Monumento Nacional</option>
                    <option value="Zona Típica" className="text-gray-900">Zona Típica</option>
                    <option value="Sin Protección" className="text-gray-900">Sin Protección</option>
                  </select>
                ) : (
                  <p className="text-gray-900 py-2">{reporte.nivel_proteccion || '-'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nivel Acceso</label>
                {esEditable ? (
                  <select
                    value={formData.nivel_acceso || 'resguardado'}
                    onChange={(e) => setFormData({ ...formData, nivel_acceso: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="resguardado" className="text-gray-900">Resguardado</option>
                    <option value="restringido_autorizacion" className="text-gray-900">Restringido (autorización)</option>
                    <option value="prohibido" className="text-gray-900">Prohibido</option>
                  </select>
                ) : (
                  <p className="text-gray-900 py-2">{reporte.nivel_acceso}</p>
                )}
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Observaciones</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amenazas</label>
                {esEditable ? (
                  <textarea
                    value={formData.amenazas || ''}
                    onChange={(e) => setFormData({ ...formData, amenazas: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder:text-gray-400"
                    placeholder="Describe amenazas o riesgos específicos..."
                  />
                ) : (
                  <p className="text-gray-900">{reporte.amenazas || '-'}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {esEditable ? (
                  <>
                    <input
                      type="checkbox"
                      checked={formData.recinto_privado || false}
                      onChange={(e) => setFormData({ ...formData, recinto_privado: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="text-sm text-gray-700">Sitio en recinto privado</label>
                  </>
                ) : (
                  <p className="text-sm text-gray-700">
                    {reporte.recinto_privado ? '🔒 Sitio en recinto privado' : 'Sitio no está en recinto privado'}
                  </p>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Botón Guardar (solo si editable) */}
        {esEditable && (
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        )}

      </div>
    </div>
  )
}
