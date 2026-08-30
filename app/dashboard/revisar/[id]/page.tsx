'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import {
  CATEGORIAS,
  TIPOLOGIAS,
  CULTURAS,
  PERIODOS,
  REGIONES,
  COMUNAS,
  CLASIFICACION_CMN,
} from '@/lib/constants/tipologias'
import * as S from '@/lib/ui/stepStyles'

const supabase = createClient()

export const dynamic = 'force-dynamic'

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
  // Contacto comunes
  autor_reporte: string | null
  id_usuario: string | null
  telefono_usuario_contacto: string | null
  contacto_propietario_posible: boolean | null
  contacto_propietario_info: string | null
  // Contacto riesgo
  es_anonimo: boolean | null
  autoriza_contacto: boolean | null
  correo_usuario_contacto: string | null
  // Situación riesgo
  temporalidad_riesgo: string | null
  nombre_proyecto: string | null
  infractor_conocido: boolean | null
  infractor_nombre: string | null
  infractor_contacto: string | null
}

interface Foto {
  id_medio: string
  url_publica: string
  descripcion_imagen: string | null
}

const TEMPO_LABEL: Record<string, string> = {
  pasado: 'Ya ocurrió',
  activo: 'Está ocurriendo actualmente',
  inminente: 'Riesgo inminente',
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

export default function RevisarReportePage() {
  const params = useParams()
  const id = params?.id as string
  const { usuario, loading: authLoading } = useAuth()
  const router = useRouter()

  const [reporte, setReporte] = useState<ReporteCompleto | null>(null)
  const [fotos, setFotos] = useState<Foto[]>([])
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [pasandoAmarillo, setPasandoAmarillo] = useState(false)
  const [error, setError] = useState('')
  const [mensajeExito, setMensajeExito] = useState('')
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null)
  const [focusField, setFocusField] = useState<string | null>(null)

  // Form Data Editable (incluyendo datos de contacto editables)
  const [formData, setFormData] = useState<Partial<ReporteCompleto>>({})
  const [comunasDisponibles, setComunasDisponibles] = useState<string[]>([])
  const [tipologiasDisponibles, setTipologiasDisponibles] = useState<string[]>([])

  useEffect(() => {
    if (!authLoading && (!usuario || !['experto', 'partner', 'founder'].includes(usuario.rol))) {
      router.push('/perfil')
    }
  }, [usuario, authLoading, router])

  useEffect(() => {
    if (id && usuario && ['experto', 'partner', 'founder'].includes(usuario.rol)) {
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

      // Cargar comunas de la región
      if (reporteData.region && COMUNAS[reporteData.region]) {
        setComunasDisponibles(COMUNAS[reporteData.region])
      }

      // Cargar tipologías de la categoría
      if (reporteData.categoria_general && TIPOLOGIAS[reporteData.categoria_general]) {
        setTipologiasDisponibles(TIPOLOGIAS[reporteData.categoria_general])
      }

      // Cargar fotos
      const { data: fotosData } = await supabase
        .from('reportes_medios')
        .select('*')
        .eq('id_reporte', id)
        .order('prioridad_visualizacion', { ascending: false })

      setFotos(fotosData || [])
    } catch (err) {
      console.error('Error cargando reporte:', err)
      setError('Error al cargar el reporte técnico')
    } finally {
      setLoading(false)
    }
  }

  function handleRegionChange(nuevaRegion: string) {
    setFormData({ ...formData, region: nuevaRegion, comuna: '' })
    if (nuevaRegion && COMUNAS[nuevaRegion]) {
      setComunasDisponibles(COMUNAS[nuevaRegion])
    } else {
      setComunasDisponibles([])
    }
  }

  function handleCategoriaChange(nuevaCat: string) {
    setFormData({ ...formData, categoria_general: nuevaCat, tipologia_especifica: [] })
    if (nuevaCat && TIPOLOGIAS[nuevaCat]) {
      setTipologiasDisponibles(TIPOLOGIAS[nuevaCat])
    } else {
      setTipologiasDisponibles([])
    }
  }

  function toggleTipologia(tipo: string) {
    const actuales = formData.tipologia_especifica || []
    const yaExiste = actuales.includes(tipo)
    const nuevas = yaExiste
      ? actuales.filter((t) => t !== tipo)
      : [...actuales, tipo]
    setFormData({ ...formData, tipologia_especifica: nuevas })
  }

  async function handleGuardar() {
    try {
      setGuardando(true)
      setError('')
      setMensajeExito('')

      const { error: updateError } = await supabase
        .from('reportes_nuevos')
        .update({
          nombre_reporte: formData.nombre_reporte,
          latitud: formData.latitud,
          longitud: formData.longitud,
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
          // Datos de contacto editables
          autor_reporte: formData.autor_reporte,
          correo_usuario_contacto: formData.correo_usuario_contacto,
          telefono_usuario_contacto: formData.telefono_usuario_contacto,
          autoriza_contacto: formData.autoriza_contacto,
          contacto_propietario_posible: formData.contacto_propietario_posible,
          contacto_propietario_info: formData.contacto_propietario_info,
          // Datos riesgo
          nombre_proyecto: formData.nombre_proyecto,
          infractor_conocido: formData.infractor_conocido,
          infractor_nombre: formData.infractor_nombre,
          infractor_contacto: formData.infractor_contacto,
        })
        .eq('id_reporte', id)

      if (updateError) throw updateError
      setMensajeExito('Cambios guardados exitosamente')
      setTimeout(() => setMensajeExito(''), 3500)
    } catch (err) {
      console.error('Error guardando:', err)
      setError('Error al guardar los cambios en el reporte')
    } finally {
      setGuardando(false)
    }
  }

  async function handlePasarAAmarillo() {
    if (!confirm('¿Confirmas que la revisión técnica está completa para pasar este reporte a estado Amarillo (Listo para Publicación)?')) {
      return
    }

    try {
      setPasandoAmarillo(true)
      setError('')

      const { error: updateError } = await supabase
        .from('reportes_nuevos')
        .update({
          ...formData,
          estado_validacion: 'amarillo',
          timestamp_revision: new Date().toISOString(),
          id_usuario_reviso: usuario?.id_usuario || null,
        })
        .eq('id_reporte', id)

      if (updateError) throw updateError
      router.push('/dashboard/revisar')
    } catch (err) {
      console.error('Error al pasar a amarillo:', err)
      setError('Error al actualizar el estado a Amarillo')
      setPasandoAmarillo(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--muted)' }}>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Cargando ficha de revisión técnica...</span>
        </div>
      </div>
    )
  }

  if (!reporte || !usuario) return null

  const esRiesgo = reporte.categoria_general === 'arqueologia_en_riesgo'

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 pb-28" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Banner ARQUEOLOGÍA EN RIESGO ── */}
        {esRiesgo && (
          <div
            className="rounded-xl p-5 border flex items-start gap-4"
            style={{
              backgroundColor: 'rgba(168,80,64,0.12)',
              borderColor: 'rgba(168,80,64,0.35)',
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(168,80,64,0.2)', color: 'var(--ladrillo)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: 'var(--ladrillo)' }}>
                  Aviso Prioritario · Arqueología en Riesgo
                </span>
                {reporte.temporalidad_riesgo && (
                  <span className="text-[10px] px-2 py-0.2 rounded font-medium" style={{ backgroundColor: 'rgba(168,80,64,0.2)', color: 'var(--ladrillo)' }}>
                    {TEMPO_LABEL[reporte.temporalidad_riesgo] || reporte.temporalidad_riesgo}
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text)' }}>
                Este reporte contiene una denuncia de alteración o daño activo. Requiere evaluación técnica rigurosa y contacto con el informante antes de su resolución.
              </p>
            </div>
          </div>
        )}

        {/* ── Encabezado Principal ── */}
        <div
          className="rounded-xl p-6 border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Link
                href="/dashboard/revisar"
                className="inline-flex items-center gap-1 text-xs transition"
                style={{ color: 'var(--accent)' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Volver a la bandeja
              </Link>
              <span style={{ color: 'var(--faint)' }}>•</span>
              <span className="text-xs font-mono" style={{ color: 'var(--faint)' }}>
                ID: {reporte.id_reporte.slice(0, 8)}
              </span>
            </div>
            <h1 className="font-display font-light text-2xl sm:text-3xl" style={{ color: 'var(--text)' }}>
              {formData.nombre_reporte || 'Sin título'}
            </h1>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
              Enviado el {new Date(reporte.timestamp_creado).toLocaleString('es-CL', { dateStyle: 'long', timeStyle: 'short' })}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider"
              style={{
                backgroundColor: 'rgba(168,80,64,0.14)',
                color: 'var(--ladrillo)',
                border: '1px solid rgba(168,80,64,0.3)',
              }}
            >
              Estado Rojo · En Revisión
            </span>
          </div>
        </div>

        {/* Notificaciones de guardado */}
        {error && (
          <div className="p-4 rounded-xl text-xs" style={S.errorBox}>
            {error}
          </div>
        )}
        {mensajeExito && (
          <div className="p-4 rounded-xl text-xs" style={S.successBox}>
            {mensajeExito}
          </div>
        )}

        {/* ── BLOQUE 1: Contacto y Reportante (Lectura rápida y Edición de datos) ── */}
        <div
          className="rounded-xl p-6 border space-y-5"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
              <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                Identificación y Vía de Contacto con el Informante
              </h2>
            </div>
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded"
              style={{
                backgroundColor: formData.autoriza_contacto ? 'rgba(78,138,96,0.12)' : 'rgba(255,255,255,0.04)',
                color: formData.autoriza_contacto ? 'var(--musgo)' : 'var(--faint)',
              }}
            >
              {formData.autoriza_contacto ? 'Autoriza ser contactado' : 'Sin autorización explícita'}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Nombre / Alias del autor */}
            <div>
              <label style={S.fieldLabel}>Nombre o Alias reportado</label>
              <input
                type="text"
                value={formData.autor_reporte || ''}
                onChange={(e) => setFormData({ ...formData, autor_reporte: e.target.value })}
                placeholder="Anónimo o Nombre reportante"
                style={{ ...S.input, ...(focusField === 'autor' ? S.inputFocus : S.inputBlur) }}
                onFocus={() => setFocusField('autor')}
                onBlur={() => setFocusField(null)}
              />
            </div>

            {/* Teléfono de contacto directo */}
            <div>
              <label style={S.fieldLabel}>Teléfono de contacto</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.telefono_usuario_contacto || ''}
                  onChange={(e) => setFormData({ ...formData, telefono_usuario_contacto: e.target.value })}
                  placeholder="+56 9 ..."
                  style={{ ...S.input, ...(focusField === 'fono' ? S.inputFocus : S.inputBlur) }}
                  onFocus={() => setFocusField('fono')}
                  onBlur={() => setFocusField(null)}
                />
                {formData.telefono_usuario_contacto && (
                  <a
                    href={`tel:${formData.telefono_usuario_contacto.replace(/\s+/g, '')}`}
                    className="inline-flex items-center justify-center px-3.5 rounded-lg text-xs font-medium transition flex-shrink-0"
                    style={{
                      backgroundColor: 'var(--surface-2)',
                      color: 'var(--accent)',
                      border: '1px solid var(--border-m)',
                    }}
                    title="Llamar directamente"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Correo electrónico */}
            <div>
              <label style={S.fieldLabel}>Correo electrónico</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={formData.correo_usuario_contacto || ''}
                  onChange={(e) => setFormData({ ...formData, correo_usuario_contacto: e.target.value })}
                  placeholder="correo@ejemplo.cl"
                  style={{ ...S.input, ...(focusField === 'mail' ? S.inputFocus : S.inputBlur) }}
                  onFocus={() => setFocusField('mail')}
                  onBlur={() => setFocusField(null)}
                />
                {formData.correo_usuario_contacto && (
                  <a
                    href={`mailto:${formData.correo_usuario_contacto}`}
                    className="inline-flex items-center justify-center px-3.5 rounded-lg text-xs font-medium transition flex-shrink-0"
                    style={{
                      backgroundColor: 'var(--surface-2)',
                      color: 'var(--accent)',
                      border: '1px solid var(--border-m)',
                    }}
                    title="Redactar correo"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Switch de autorización de contacto */}
            <div className="flex items-center">
              <label className="flex items-center gap-3 cursor-pointer pt-4">
                <input
                  type="checkbox"
                  checked={formData.autoriza_contacto || false}
                  onChange={(e) => setFormData({ ...formData, autoriza_contacto: e.target.checked })}
                  style={{ accentColor: 'var(--accent)', width: 16, height: 16 }}
                />
                <span className="text-xs" style={{ color: 'var(--text)' }}>
                  Reportante disponible para consultas de verificación técnica
                </span>
              </label>
            </div>
          </div>

          {/* Información complementaria de propietario (si aplica en hallazgo) */}
          {formData.contacto_propietario_posible && (
            <div className="p-3.5 rounded-xl border space-y-1.5" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
              <label style={S.fieldLabel}>Detalle de contacto con propietario / custodio del predio</label>
              <input
                type="text"
                value={formData.contacto_propietario_info || ''}
                onChange={(e) => setFormData({ ...formData, contacto_propietario_info: e.target.value })}
                placeholder="Datos de contacto con el dueño del terreno..."
                style={{ ...S.input, ...(focusField === 'prop' ? S.inputFocus : S.inputBlur) }}
                onFocus={() => setFocusField('prop')}
                onBlur={() => setFocusField(null)}
              />
            </div>
          )}
        </div>

        {/* ── BLOQUE 2: Fotografías y Evidencias Visuales ── */}
        <div
          className="rounded-xl p-6 border space-y-4"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
              <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                Evidencias Fotográficas ({fotos.length})
              </h2>
            </div>
            <span className="text-[11px]" style={{ color: 'var(--faint)' }}>
              Haz clic en cualquier imagen para ampliar
            </span>
          </div>

          {fotos.length === 0 ? (
            <div className="p-8 text-center rounded-xl" style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <p className="text-xs" style={{ color: 'var(--faint)' }}>Este reporte fue enviado sin fotografías adjuntas</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {fotos.map((foto) => (
                <div
                  key={foto.id_medio}
                  onClick={() => setFotoAmpliada(foto.url_publica)}
                  className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer border"
                  style={{ borderColor: 'var(--border-m)', backgroundColor: 'var(--surface-2)' }}
                >
                  <img
                    src={foto.url_publica}
                    alt={foto.descripcion_imagen || 'Evidencia'}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                  >
                    <span className="text-[11px] font-medium text-white px-2.5 py-1 rounded-md bg-black/60">
                      Ampliar
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Modal de Foto Ampliada ── */}
        {fotoAmpliada && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setFotoAmpliada(null)}
          >
            <div className="relative max-w-3xl max-h-[90vh] w-full rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
              <img src={fotoAmpliada} alt="Evidencia ampliada" className="w-full h-full object-contain max-h-[85vh] bg-black" />
              <button
                onClick={() => setFotoAmpliada(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center text-sm hover:bg-black transition"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* ── BLOQUE 3: Formulario Técnico Editable ── */}
        <div
          className="rounded-xl p-6 border space-y-6"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          {/* Subsección A: Ubicación Geográfica */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest pb-2 border-b" style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}>
              1. Localización y Coordenadas
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label style={S.fieldLabel}>Nombre o Título del Sitio <span style={S.required}>*</span></label>
                <input
                  type="text"
                  value={formData.nombre_reporte || ''}
                  onChange={(e) => setFormData({ ...formData, nombre_reporte: e.target.value })}
                  style={{ ...S.input, ...(focusField === 'nom' ? S.inputFocus : S.inputBlur) }}
                  onFocus={() => setFocusField('nom')}
                  onBlur={() => setFocusField(null)}
                />
              </div>

              <div>
                <label style={S.fieldLabel}>Región Administrativa</label>
                <select
                  value={formData.region || ''}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  style={{ ...S.select, ...(focusField === 'reg' ? S.inputFocus : S.inputBlur) }}
                  onFocus={() => setFocusField('reg')}
                  onBlur={() => setFocusField(null)}
                >
                  <option value="">Seleccionar región...</option>
                  {REGIONES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={S.fieldLabel}>Comuna</label>
                <select
                  value={formData.comuna || ''}
                  onChange={(e) => setFormData({ ...formData, comuna: e.target.value })}
                  disabled={!formData.region || comunasDisponibles.length === 0}
                  style={{ ...S.select, ...(focusField === 'com' ? S.inputFocus : S.inputBlur) }}
                  onFocus={() => setFocusField('com')}
                  onBlur={() => setFocusField(null)}
                >
                  <option value="">Seleccionar comuna...</option>
                  {comunasDisponibles.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label style={S.fieldLabel}>Latitud (WGS84)</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitud || ''}
                    onChange={(e) => setFormData({ ...formData, latitud: parseFloat(e.target.value) })}
                    style={{ ...S.input, ...(focusField === 'lat' ? S.inputFocus : S.inputBlur) }}
                    onFocus={() => setFocusField('lat')}
                    onBlur={() => setFocusField(null)}
                  />
                </div>
                <div>
                  <label style={S.fieldLabel}>Longitud (WGS84)</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitud || ''}
                    onChange={(e) => setFormData({ ...formData, longitud: parseFloat(e.target.value) })}
                    style={{ ...S.input, ...(focusField === 'lng' ? S.inputFocus : S.inputBlur) }}
                    onFocus={() => setFocusField('lng')}
                    onBlur={() => setFocusField(null)}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label style={S.fieldLabel}>Descripción del Emplazamiento y Cómo Llegar</label>
                <textarea
                  rows={2}
                  value={formData.descripcion_ubicacion || ''}
                  onChange={(e) => setFormData({ ...formData, descripcion_ubicacion: e.target.value })}
                  placeholder="Referencias de acceso, hitos geográficos cercanos..."
                  style={{ ...S.textarea, ...(focusField === 'descUbic' ? S.inputFocus : S.inputBlur) }}
                  onFocus={() => setFocusField('descUbic')}
                  onBlur={() => setFocusField(null)}
                />
              </div>
            </div>
          </div>

          {/* Subsección B: Caracterización Arqueológica */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest pb-2 border-b" style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}>
              2. Caracterización Arqueológica y Cronología
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label style={S.fieldLabel}>Categoría Temática</label>
                <select
                  value={formData.categoria_general || ''}
                  onChange={(e) => handleCategoriaChange(e.target.value)}
                  style={{ ...S.select, ...(focusField === 'cat' ? S.inputFocus : S.inputBlur) }}
                  onFocus={() => setFocusField('cat')}
                  onBlur={() => setFocusField(null)}
                >
                  <option value="">Seleccionar categoría...</option>
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={S.fieldLabel}>Cultura Asociada</label>
                <select
                  value={formData.cultura_asociada || ''}
                  onChange={(e) => setFormData({ ...formData, cultura_asociada: e.target.value })}
                  style={{ ...S.select, ...(focusField === 'cult' ? S.inputFocus : S.inputBlur) }}
                  onFocus={() => setFocusField('cult')}
                  onBlur={() => setFocusField(null)}
                >
                  <option value="">Sin información / Seleccionar...</option>
                  {CULTURAS.map((cult) => (
                    <option key={cult} value={cult}>{cult}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={S.fieldLabel}>Período Cronológico</label>
                <select
                  value={formData.periodo_cronologico || ''}
                  onChange={(e) => setFormData({ ...formData, periodo_cronologico: e.target.value })}
                  style={{ ...S.select, ...(focusField === 'per' ? S.inputFocus : S.inputBlur) }}
                  onFocus={() => setFocusField('per')}
                  onBlur={() => setFocusField(null)}
                >
                  <option value="">Sin información / Seleccionar...</option>
                  {PERIODOS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={S.fieldLabel}>Estado de Conservación</label>
                <select
                  value={formData.estado_conservacion || ''}
                  onChange={(e) => setFormData({ ...formData, estado_conservacion: e.target.value })}
                  style={{ ...S.select, ...(focusField === 'cons' ? S.inputFocus : S.inputBlur) }}
                  onFocus={() => setFocusField('cons')}
                  onBlur={() => setFocusField(null)}
                >
                  <option value="">Seleccionar estado...</option>
                  <option value="bueno">Bueno / Estable</option>
                  <option value="regular">Regular / Deterioro leve</option>
                  <option value="malo">Malo / Dañado</option>
                  <option value="destruido">Destruido / Crítico</option>
                  <option value="sin_informacion">Sin información</option>
                </select>
              </div>

              {/* Tipologías específicas como selector de chips */}
              {tipologiasDisponibles.length > 0 && (
                <div className="sm:col-span-2">
                  <label style={S.fieldLabel}>Tipologías Específicas</label>
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                    {tipologiasDisponibles.map((tipo) => {
                      const isSel = formData.tipologia_especifica?.includes(tipo)
                      return (
                        <button
                          key={tipo}
                          type="button"
                          onClick={() => toggleTipologia(tipo)}
                          className="px-3 py-1 rounded-full text-xs font-medium transition"
                          style={{
                            backgroundColor: isSel ? 'rgba(143,181,164,0.18)' : 'transparent',
                            color: isSel ? 'var(--accent)' : 'var(--muted)',
                            border: `1px solid ${isSel ? 'var(--accent)' : 'var(--border-m)'}`,
                          }}
                        >
                          {tipo}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Subsección C: Amenazas y Factores de Riesgo */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest pb-2 border-b" style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}>
              3. Amenazas, Afectación y Observaciones
            </h3>

            <div className="space-y-4">
              <div>
                <label style={S.fieldLabel}>
                  {esRiesgo ? 'Descripción del Daño / Amenazas Reportadas' : 'Amenazas y Factores de Deterioro'}
                </label>
                <textarea
                  rows={3}
                  value={formData.amenazas || ''}
                  onChange={(e) => setFormData({ ...formData, amenazas: e.target.value })}
                  placeholder="Detalles sobre agentes de deterioro antrópicos o naturales..."
                  style={{ ...S.textarea, ...(focusField === 'amen' ? S.inputFocus : S.inputBlur) }}
                  onFocus={() => setFocusField('amen')}
                  onBlur={() => setFocusField(null)}
                />
              </div>

              {esRiesgo && (
                <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-xl border" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                  <div>
                    <label style={S.fieldLabel}>Nombre de la Obra o Proyecto</label>
                    <input
                      type="text"
                      value={formData.nombre_proyecto || ''}
                      onChange={(e) => setFormData({ ...formData, nombre_proyecto: e.target.value })}
                      placeholder="ej. Loteo Los Espinos, Troncal Norte..."
                      style={{ ...S.input, ...(focusField === 'proy' ? S.inputFocus : S.inputBlur) }}
                      onFocus={() => setFocusField('proy')}
                      onBlur={() => setFocusField(null)}
                    />
                  </div>

                  <div>
                    <label style={S.fieldLabel}>Presunto Infractor / Empresa</label>
                    <input
                      type="text"
                      value={formData.infractor_nombre || ''}
                      onChange={(e) => setFormData({ ...formData, infractor_nombre: e.target.value })}
                      placeholder="Empresa ejecutora o responsable..."
                      style={{ ...S.input, ...(focusField === 'inf' ? S.inputFocus : S.inputBlur) }}
                      onFocus={() => setFocusField('inf')}
                      onBlur={() => setFocusField(null)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── BARRA INFERIOR DE ACCIÓN (Sticky Bottom) ── */}
        <div
          className="fixed bottom-0 left-0 right-0 p-4 border-t z-30 shadow-2xl backdrop-blur-md"
          style={{
            backgroundColor: 'rgba(29,27,25,0.92)',
            borderColor: 'var(--border-m)',
          }}
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <Link
              href="/dashboard/revisar"
              className="text-xs font-medium px-4 py-2.5 rounded-lg transition"
              style={{ color: 'var(--muted)', border: '1px solid var(--border-m)' }}
            >
              Cancelar
            </Link>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleGuardar}
                disabled={guardando || pasandoAmarillo}
                className="text-xs font-medium px-4 py-2.5 rounded-lg transition"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  color: 'var(--text)',
                  border: '1px solid var(--border-m)',
                  opacity: guardando ? 0.6 : 1,
                }}
              >
                {guardando ? 'Guardando...' : 'Guardar borrador'}
              </button>

              <button
                type="button"
                onClick={handlePasarAAmarillo}
                disabled={guardando || pasandoAmarillo}
                className="text-xs font-medium px-5 py-2.5 rounded-lg transition flex items-center gap-2 shadow"
                style={{
                  backgroundColor: 'var(--cobre)',
                  color: '#FFFFFF',
                  opacity: pasandoAmarillo ? 0.6 : 1,
                  cursor: pasandoAmarillo ? 'not-allowed' : 'pointer',
                }}
              >
                <span>{pasandoAmarillo ? 'Procesando...' : 'Completar Revisión → Amarillo'}</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
