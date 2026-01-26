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
}

interface Foto {
  id_medio: string
  url_publica: string
  descripcion_imagen: string | null
}

export default function AprobarReportePage() {
  const params = useParams()
  const id = params?.id as string
  const { usuario, loading: authLoading } = useAuth()
  const router = useRouter()

  const [reporte, setReporte] = useState<ReporteCompleto | null>(null)
  const [fotos, setFotos] = useState<Foto[]>([])
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<Partial<ReporteCompleto>>({})

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
      const { data: reporteData, error: reporteError } = await supabase
        .from('reportes_nuevos')
        .select('*')
        .eq('id_reporte', id)
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
      setError('Error al cargar el reporte')
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
    } catch (err) {
      console.error('Error guardando:', err)
      setError('Error al guardar cambios')
    } finally {
      setGuardando(false)
    }
  }

  async function handlePublicar() {
  if (!confirm('¿Publicar este reporte? Pasará a estado VERDE y será visible en el mapa público')) return

  try {
    setGuardando(true)
    const { error: updateError } = await supabase
      .from('reportes_nuevos')
      .update({
        estado_validacion: 'verde',
      })
      .eq('id_reporte', id)

    if (updateError) throw updateError
    alert('✓ Reporte PUBLICADO → VERDE')
    router.push('/dashboard/aprobar')
  } catch (err) {
    console.error('Error publicando:', err)
    setError('Error al publicar reporte')
  } finally {
    setGuardando(false)
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/dashboard/aprobar')}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              ← Volver
            </button>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
              AMARILLO
            </span>
          </div>
          <p className="text-xs text-gray-500">ID: {reporte.id_reporte}</p>
          <p className="text-xs text-gray-500">
            Creado: {new Date(reporte.timestamp_creado).toLocaleString('es-CL')}
          </p>
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

        {/* Formulario Editable */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          
          {/* Ubicación */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Ubicación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título/Nombre Sitio *
                </label>
                <input
                  type="text"
                  value={formData.nombre_reporte || ''}
                  onChange={(e) => setFormData({ ...formData, nombre_reporte: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Región</label>
                <input
                  type="text"
                  value={formData.region || ''}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comuna</label>
                <input
                  type="text"
                  value={formData.comuna || ''}
                  onChange={(e) => setFormData({ ...formData, comuna: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Coordenadas (no editables)
                </label>
                <input
                  type="text"
                  value={`${reporte.latitud}, ${reporte.longitud}`}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción Ubicación
              </label>
              <textarea
                value={formData.descripcion_ubicacion || ''}
                onChange={(e) => setFormData({ ...formData, descripcion_ubicacion: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Caracterización */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Caracterización</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría General
                </label>
                <select
                  value={formData.categoria_general || ''}
                  onChange={(e) => setFormData({ ...formData, categoria_general: e.target.value, tipologia_especifica: null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Seleccionar...</option>
                  {CATEGORIAS.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipología</label>
                <select
                  value={formData.tipologia_especifica?.[0] || ''}
                  onChange={(e) => setFormData({ ...formData, tipologia_especifica: e.target.value ? [e.target.value] : null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  disabled={!formData.categoria_general}
                >
                  <option value="">Seleccionar...</option>
                  {formData.categoria_general && TIPOLOGIAS[formData.categoria_general as keyof typeof TIPOLOGIAS]?.map((tip) => (
                    <option key={tip} value={tip}>{tip}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cultura</label>
                <select
                  value={formData.cultura_asociada || ''}
                  onChange={(e) => setFormData({ ...formData, cultura_asociada: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Seleccionar...</option>
                  {CULTURAS.map((cult) => (
                    <option key={cult} value={cult}>{cult}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Periodo</label>
                <select
                  value={formData.periodo_cronologico || ''}
                  onChange={(e) => setFormData({ ...formData, periodo_cronologico: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Seleccionar...</option>
                  {PERIODOS.map((per) => (
                    <option key={per} value={per}>{per}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Estado */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Estado y Conservación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado Conservación
                </label>
                <select
                  value={formData.estado_conservacion || ''}
                  onChange={(e) => setFormData({ ...formData, estado_conservacion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Seleccionar...</option>
                  {ESTADO_CONSERVACION.map((est) => (
                    <option key={est} value={est}>{est}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Riesgo</label>
                <input
                  type="text"
                  value={formData.tipo_riesgo_principal || ''}
                  onChange={(e) => setFormData({ ...formData, tipo_riesgo_principal: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Ej: Erosión, vandalismo..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nivel Protección
                </label>
                <select
                  value={formData.nivel_proteccion || ''}
                  onChange={(e) => setFormData({ ...formData, nivel_proteccion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Monumento Nacional">Monumento Nacional</option>
                  <option value="Zona Típica">Zona Típica</option>
                  <option value="Sin Protección">Sin Protección</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nivel Acceso</label>
                <select
                  value={formData.nivel_acceso || 'resguardado'}
                  onChange={(e) => setFormData({ ...formData, nivel_acceso: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="resguardado">Resguardado</option>
                  <option value="restringido_autorizacion">Restringido (autorización)</option>
                  <option value="prohibido">Prohibido</option>
                </select>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Observaciones</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amenazas</label>
                <textarea
                  value={formData.amenazas || ''}
                  onChange={(e) => setFormData({ ...formData, amenazas: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Describe amenazas o riesgos específicos..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.recinto_privado || false}
                  onChange={(e) => setFormData({ ...formData, recinto_privado: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label className="text-sm text-gray-700">Sitio en recinto privado</label>
              </div>
            </div>
          </div>

        </div>

        {/* Botones Acción */}
        <div className="flex gap-3 pb-4">
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <button
            onClick={handlePublicar}
            disabled={guardando}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
          >
            {guardando ? 'Procesando...' : 'Publicar → Verde ✓'}
          </button>
        </div>

      </div>
    </div>
  )
}
