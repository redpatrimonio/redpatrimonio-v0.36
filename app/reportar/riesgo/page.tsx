'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'

const MapPicker = dynamic(() => import('@/components/map/MapPicker'), { ssr: false })

const TIPOS_OBRA = [
  'Construcción inmobiliaria',
  'Carretera / vialidad',
  'Agricultura / arado',
  'Minería',
  'Extracción áridos',
  'Forestal',
  'Sin obra visible',
  'No sé',
]

const REGIONES = [
  'Arica y Parinacota',
  'Tarapacá',
  'Antofagasta',
  'Atacama',
  'Coquimbo',
  'Valparaíso',
  'Metropolitana',
  "O'Higgins",
  'Maule',
  'Ñuble',
  'Biobío',
  'La Araucanía',
  'Los Ríos',
  'Los Lagos',
  'Aysén',
  'Magallanes',
]

type Paso = 1 | 2 | 3 | 4
type Temporalidad = 'pasado' | 'activo' | 'inminente' | ''
type Identidad = 'anonimo' | 'publico'

const TEMPO_OPTIONS = [
  { value: 'pasado' as const, icon: '🪨', label: 'Ya ocurrió', desc: 'El daño está hecho' },
  { value: 'activo' as const, icon: '🚨', label: 'Está ocurriendo', desc: 'Hay una obra activa ahora' },
  { value: 'inminente' as const, icon: '⚠️', label: 'Va a ocurrir', desc: 'Hay un proyecto aprobado' },
]

export default function RiesgoPage() {
  const supabase = createClient()
  const { user } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [paso, setPaso] = useState<Paso>(1)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Paso 1 — Identidad
  const [identidad, setIdentidad] = useState<Identidad>('anonimo')
  const [dejarDatosPrivados, setDejarDatosPrivados] = useState(false)
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [telefono, setTelefono] = useState('')

  // Paso 2 — Situación
  const [temporalidad, setTemporalidad] = useState<Temporalidad>('')
  const [tiposObra, setTiposObra] = useState<string[]>([])
  const [descripcion, setDescripcion] = useState('')

  // Paso 3 — Ubicación
  const [latitud, setLatitud] = useState<number | null>(null)
  const [longitud, setLongitud] = useState<number | null>(null)
  const [region, setRegion] = useState('')
  const [comuna, setComuna] = useState('')
  const [comoSeLlega, setComoSeLlega] = useState('')

  // Paso 4 — Evidencia
  const [archivos, setArchivos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [fechaObservacion, setFechaObservacion] = useState('')
  const [notasExtra, setNotasExtra] = useState('')

  function toggleObra(tipo: string) {
    setTiposObra(prev =>
      prev.includes(tipo) ? prev.filter(t => t !== tipo) : [...prev, tipo]
    )
  }

  function handleArchivos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const nuevos = files.slice(0, 5 - archivos.length)
    setArchivos(prev => [...prev, ...nuevos])
    nuevos.forEach(f => {
      const reader = new FileReader()
      reader.onload = (ev) => setPreviews(prev => [...prev, ev.target?.result as string])
      reader.readAsDataURL(f)
    })
  }

  function quitarFoto(i: number) {
    setArchivos(prev => prev.filter((_, idx) => idx !== i))
    setPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  function avanzar(siguiente: Paso) {
    setError(null)
    setPaso(siguiente)
    window.scrollTo(0, 0)
  }

  // Resumen para paso 4
  function resumenIdentidad() {
    if (identidad === 'publico') {
      return nombre ? `${nombre} (público)` : 'Personal/Comunidad'
    }
    if (dejarDatosPrivados && nombre) return `Anónimo · privado (${nombre})`
    if (dejarDatosPrivados) return 'Anónimo · con datos privados'
    return 'Anónimo'
  }

  function resumenUbicacion() {
    if (region && comuna) return `${comuna}, ${region}`
    if (region) return region
    if (comuna) return comuna
    return '—'
  }

  async function handleSubmit() {
    if (!latitud || !longitud) { setError('Debes marcar la ubicación en el mapa.'); return }
    if (!temporalidad) { setError('Indica cuándo ocurre el daño.'); return }
    setEnviando(true)
    setError(null)

    try {
      const autorReporte = identidad === 'publico'
        ? (nombre || 'Personal/Comunidad')
        : (dejarDatosPrivados && nombre ? `[privado] ${nombre}` : null)

      const descripcionFinal = [
        descripcion,
        tiposObra.length > 0 ? `Tipo obra: ${tiposObra.join(', ')}` : null,
        fechaObservacion ? `Fecha observación: ${fechaObservacion}` : null,
        notasExtra || null,
        comoSeLlega ? `Cómo se llega: ${comoSeLlega}` : null,
      ].filter(Boolean).join(' | ')

      const payload: Record<string, unknown> = {
        nombre_reporte: `Riesgo: ${tiposObra[0] || temporalidad}`,
        tipo_riesgo_principal: tiposObra[0] || temporalidad,
        amenazas: descripcionFinal || null,
        temporalidad_riesgo: temporalidad,
        latitud,
        longitud,
        region: region || null,
        comuna: comuna || null,
        descripcion_ubicacion: comoSeLlega || null,
        autor_reporte: autorReporte,
        telefono_usuario_contacto: (dejarDatosPrivados || identidad === 'publico') ? (telefono || null) : null,
        id_usuario: user?.id || null,
        estado_validacion: 'rojo',
        nivel_acceso: 'publico',
        categoria_general: 'arqueologia_en_riesgo',
      }

      const { data: reporte, error: errReporte } = await supabase
        .from('reportes_nuevos')
        .insert(payload)
        .select('id_reporte')
        .single()

      if (errReporte || !reporte) throw new Error(errReporte?.message || 'Error al guardar el reporte.')

      const reporteId = reporte.id_reporte

      for (let i = 0; i < archivos.length; i++) {
        const file = archivos[i]
        const ext = file.name.split('.').pop()
        const path = `reportes/${reporteId}/${Date.now()}_${i}.${ext}`
        const { error: errStorage } = await supabase.storage
          .from('reportes-medios')
          .upload(path, file, { upsert: false })
        if (errStorage) continue
        const { data: urlData } = supabase.storage.from('reportes-medios').getPublicUrl(path)
        await supabase.from('reportes_medios').insert({
          id_reporte: reporteId,
          url_publica: urlData.publicUrl,
          tipo_medio: 'foto',
          prioridad_visualizacion: i,
        })
      }

      router.push(`/reportar/riesgo/gracias?id=${reporteId}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error inesperado.')
    } finally {
      setEnviando(false)
    }
  }

  // ─── UI helpers ───
  const pasoLabel = ['Identidad', 'Situación', 'Ubicación', 'Evidencia']

  return (
    <div className="min-h-screen" style={{ background: '#f2f5f6' }}>
      <div className="max-w-md mx-auto min-h-screen bg-white flex flex-col" style={{ boxShadow: '0 0 40px rgba(0,0,0,.08)' }}>

        {/* Header */}
        <div className="sticky top-0 z-10" style={{ backgroundColor: '#10454B' }}>
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <span className="text-white text-sm font-bold">RP</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-tight">Arqueología en Riesgo</h1>
              <p className="text-white/70 text-xs mt-0.5">Aviso ciudadano · RedPatrimonio</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-0.5" style={{ background: 'rgba(255,255,255,0.25)' }}>
            <div className="h-full bg-white rounded-r transition-all duration-400"
              style={{ width: `${(paso / 4) * 100}%` }} />
          </div>

          {/* Stepper */}
          <div className="flex items-start px-5 pb-3 pt-2 gap-0">
            {pasoLabel.map((label, i) => {
              const n = i + 1
              const isActive = n === paso
              const isDone = n < paso
              return (
                <>
                  <div key={n} className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                      style={{
                        border: isActive || isDone ? '2px solid white' : '2px solid rgba(255,255,255,0.3)',
                        background: isActive ? 'white' : isDone ? 'rgba(255,255,255,0.25)' : 'transparent',
                        color: isActive ? '#10454B' : 'rgba(255,255,255,0.6)',
                      }}>
                      {isDone ? '✓' : n}
                    </div>
                    <span className="text-center leading-tight" style={{
                      fontSize: '0.6rem',
                      color: isActive || isDone ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)',
                    }}>{label}</span>
                  </div>
                  {i < 3 && (
                    <div className="flex-1 h-0.5 mt-2.5 mx-1 transition-all"
                      style={{ background: isDone ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)' }} />
                  )}
                </>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-5 py-6">

          {/* ── PASO 1: IDENTIDAD ── */}
          {paso === 1 && (
            <div className="flex flex-col gap-5">
              <div className="mb-1">
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#10454B' }}>Paso 1 de 4</p>
                <h2 className="text-2xl font-extrabold leading-tight" style={{ color: '#111827' }}>¿Cómo quieres enviar este aviso?</h2>
                <p className="text-sm mt-1.5" style={{ color: '#6b7280' }}>En ambos casos tu aviso tiene el mismo valor y será revisado con la misma prioridad.</p>
              </div>

              {/* Opción Anónimo */}
              <div
                onClick={() => setIdentidad('anonimo')}
                className="flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all"
                style={{
                  borderColor: identidad === 'anonimo' ? '#10454B' : '#dde4e6',
                  background: identidad === 'anonimo' ? '#e8f4f5' : '#f8fafb',
                }}>
                <div className="w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center"
                  style={{ borderColor: identidad === 'anonimo' ? '#10454B' : '#9ca3af' }}>
                  {identidad === 'anonimo' && <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#10454B' }} />}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#111827' }}>Anónimo</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>Tu identidad no quedará vinculada al aviso</p>
                </div>
              </div>

              {/* Sub-opción datos privados (solo si anónimo) */}
              {identidad === 'anonimo' && (
                <div className="-mt-3 px-3.5 pb-3.5 pt-3 rounded-b-xl border-2 border-t-0"
                  style={{ borderColor: '#b2dde1', background: '#e8f4f5' }}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dejarDatosPrivados}
                      onChange={e => setDejarDatosPrivados(e.target.checked)}
                      className="mt-0.5 flex-shrink-0"
                      style={{ accentColor: '#10454B' }}
                    />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#111827' }}>Dejar datos de contacto de forma privada</p>
                      <p className="text-xs" style={{ color: '#6b7280' }}>Solo los ve el equipo de RedPatrimonio. No se publican nunca.</p>
                    </div>
                  </label>
                </div>
              )}

              {/* Opción Personal/Comunidad */}
              <div
                onClick={() => setIdentidad('publico')}
                className="flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all"
                style={{
                  borderColor: identidad === 'publico' ? '#10454B' : '#dde4e6',
                  background: identidad === 'publico' ? '#e8f4f5' : '#f8fafb',
                }}>
                <div className="w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center"
                  style={{ borderColor: identidad === 'publico' ? '#10454B' : '#9ca3af' }}>
                  {identidad === 'publico' && <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#10454B' }} />}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#111827' }}>Personal / Comunidad</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>Tu nombre o alias aparecerá en el reporte</p>
                </div>
              </div>

              {/* Campos de contacto */}
              {(identidad === 'publico' || (identidad === 'anonimo' && dejarDatosPrivados)) && (
                <div className="flex flex-col gap-3.5 p-3.5 rounded-xl border"
                  style={{ background: '#f2f5f6', borderColor: '#dde4e6' }}>
                  <div>
                    <label className="block text-sm font-semibold mb-1" style={{ color: '#111827' }}>Nombre o alias <span className="font-normal" style={{ color: '#6b7280' }}>(opcional)</span></label>
                    <input value={nombre} onChange={e => setNombre(e.target.value)}
                      placeholder="Cómo quieres que te llamemos"
                      className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition"
                      style={{ border: '1.5px solid #dde4e6', color: '#111827', background: 'white' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1" style={{ color: '#111827' }}>Correo electrónico <span className="font-normal" style={{ color: '#6b7280' }}>(opcional)</span></label>
                    <input type="email" value={correo} onChange={e => setCorreo(e.target.value)}
                      placeholder="tu@correo.cl"
                      className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition"
                      style={{ border: '1.5px solid #dde4e6', color: '#111827', background: 'white' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1" style={{ color: '#111827' }}>Teléfono <span className="font-normal" style={{ color: '#6b7280' }}>(opcional)</span></label>
                    <input value={telefono} onChange={e => setTelefono(e.target.value)}
                      placeholder="+56 9 ..."
                      className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition"
                      style={{ border: '1.5px solid #dde4e6', color: '#111827', background: 'white' }}
                    />
                  </div>
                </div>
              )}

              {/* Banner privacidad */}
              <div className="flex items-start gap-2.5 rounded-lg p-3" style={{ background: '#e8f4f5', border: '1px solid #b2dde1' }}>
                <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L3 5v5c0 4.418 3.134 8.559 7 9.5C16.866 18.559 20 14.418 20 10V5l-7-3z" fill="#10454B" opacity=".6"/>
                </svg>
                <p className="text-xs" style={{ color: '#10454B' }}>
                  {identidad === 'publico'
                    ? <><strong>Tu nombre aparecerá en el reporte.</strong> Tus datos de contacto son siempre privados.</>
                    : <><strong>Tus datos son privados.</strong> Solo los verá el equipo de RedPatrimonio. Nunca se publican.</>
                  }
                </p>
              </div>

              <button onClick={() => avanzar(2)}
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition"
                style={{ backgroundColor: '#10454B' }}>
                Continuar ›
              </button>
            </div>
          )}

          {/* ── PASO 2: SITUACIÓN ── */}
          {paso === 2 && (
            <div className="flex flex-col gap-5">
              <div className="mb-1">
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#10454B' }}>Paso 2 de 4</p>
                <h2 className="text-2xl font-extrabold leading-tight" style={{ color: '#111827' }}>¿Qué está pasando?</h2>
                <p className="text-sm mt-1.5" style={{ color: '#6b7280' }}>Cuéntanos con tus palabras. No hace falta saber arqueología para describir lo que ves.</p>
              </div>

              {/* Temporalidad */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#111827' }}>¿Cuándo ocurre el daño? *</label>
                <div className="grid grid-cols-3 gap-2">
                  {TEMPO_OPTIONS.map(opt => (
                    <button key={opt.value} type="button"
                      onClick={() => setTemporalidad(opt.value)}
                      className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-center transition"
                      style={{
                        borderColor: temporalidad === opt.value ? '#10454B' : '#dde4e6',
                        background: temporalidad === opt.value ? '#e8f4f5' : '#f8fafb',
                      }}>
                      <span className="text-2xl">{opt.icon}</span>
                      <span className="text-xs font-bold" style={{ color: '#111827' }}>{opt.label}</span>
                      <span className="text-xs leading-tight" style={{ color: '#6b7280' }}>{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipo de obra */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#111827' }}>¿Qué tipo de obra está involucrada? <span className="font-normal" style={{ color: '#6b7280' }}>(opcional)</span></label>
                <div className="flex flex-wrap gap-1.5">
                  {TIPOS_OBRA.map(tipo => (
                    <button key={tipo} type="button"
                      onClick={() => toggleObra(tipo)}
                      className="px-3 py-1.5 rounded-full border-2 text-xs font-semibold transition"
                      style={{
                        borderColor: tiposObra.includes(tipo) ? '#10454B' : '#dde4e6',
                        background: tiposObra.includes(tipo) ? '#e8f4f5' : '#f8fafb',
                        color: tiposObra.includes(tipo) ? '#10454B' : '#374151',
                      }}>
                      {tipo}
                    </button>
                  ))}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#111827' }}>¿Qué viste exactamente?</label>
                <textarea rows={4} value={descripcion} onChange={e => setDescripcion(e.target.value)}
                  placeholder="Describe lo que viste o lo que está ocurriendo. Cualquier detalle ayuda..."
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition"
                  style={{ border: '1.5px solid #dde4e6', color: '#111827', background: 'white', resize: 'vertical', minHeight: '90px' }}
                />
              </div>

              {error && <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>}

              <div className="flex gap-3">
                <button onClick={() => avanzar(1)}
                  className="flex-1 py-3.5 rounded-xl border-2 font-bold text-sm transition"
                  style={{ borderColor: '#dde4e6', color: '#374151' }}>
                  ‹ Atrás
                </button>
                <button onClick={() => {
                  if (!temporalidad) { setError('Indica cuándo ocurre el daño.'); return }
                  avanzar(3)
                }}
                  className="flex-1 py-3.5 rounded-xl font-bold text-white text-sm transition"
                  style={{ backgroundColor: '#10454B' }}>
                  Continuar ›
                </button>
              </div>
            </div>
          )}

          {/* ── PASO 3: UBICACIÓN ── */}
          {paso === 3 && (
            <div className="flex flex-col gap-5">
              <div className="mb-1">
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#10454B' }}>Paso 3 de 4</p>
                <h2 className="text-2xl font-extrabold leading-tight" style={{ color: '#111827' }}>¿Dónde ocurre?</h2>
                <p className="text-sm mt-1.5" style={{ color: '#6b7280' }}>La ubicación es clave. Usa tu GPS o describe el lugar lo mejor que puedas.</p>
              </div>

              {/* Mapa */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#111827' }}>Toca para marcar el lugar *</label>
                <div className="rounded-xl overflow-hidden border" style={{ height: 280, borderColor: '#dde4e6' }}>
                  <MapPicker
                    onLocationSelect={(lat: number, lng: number) => { setLatitud(lat); setLongitud(lng) }}
                  />
                </div>
                {latitud && longitud && (
                  <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
                    {latitud.toFixed(6)}, {longitud.toFixed(6)}
                  </p>
                )}
              </div>

              {/* Región select */}
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#111827' }}>Región</label>
                <select value={region} onChange={e => setRegion(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition"
                  style={{ border: '1.5px solid #dde4e6', color: region ? '#111827' : '#9ca3af', background: 'white' }}>
                  <option value="">Seleccionar...</option>
                  {REGIONES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* Comuna */}
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#111827' }}>Comuna</label>
                <input value={comuna} onChange={e => setComuna(e.target.value)}
                  placeholder="ej: Copiapó"
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition"
                  style={{ border: '1.5px solid #dde4e6', color: '#111827', background: 'white' }}
                />
              </div>

              {/* Cómo se llega */}
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#111827' }}>¿Cómo se llega? <span className="font-normal" style={{ color: '#6b7280' }}>(opcional)</span></label>
                <input value={comoSeLlega} onChange={e => setComoSeLlega(e.target.value)}
                  placeholder="ej: 500m al norte del fundo, al lado del canal..."
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition"
                  style={{ border: '1.5px solid #dde4e6', color: '#111827', background: 'white' }}
                />
              </div>

              {error && <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>}

              <div className="flex gap-3">
                <button onClick={() => avanzar(2)}
                  className="flex-1 py-3.5 rounded-xl border-2 font-bold text-sm transition"
                  style={{ borderColor: '#dde4e6', color: '#374151' }}>
                  ‹ Atrás
                </button>
                <button onClick={() => {
                  if (!latitud || !longitud) { setError('Marca el punto en el mapa.'); return }
                  avanzar(4)
                }}
                  className="flex-1 py-3.5 rounded-xl font-bold text-white text-sm transition"
                  style={{ backgroundColor: '#10454B' }}>
                  Continuar ›
                </button>
              </div>
            </div>
          )}

          {/* ── PASO 4: EVIDENCIA ── */}
          {paso === 4 && (
            <div className="flex flex-col gap-5">
              <div className="mb-1">
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#10454B' }}>Paso 4 de 4</p>
                <h2 className="text-2xl font-extrabold leading-tight" style={{ color: '#111827' }}>Evidencia y confirmación</h2>
                <p className="text-sm mt-1.5" style={{ color: '#6b7280' }}>Agrega fotos si tienes. Revisa el resumen antes de enviar.</p>
              </div>

              {/* Fotos */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#111827' }}>Fotografías <span className="font-normal" style={{ color: '#6b7280' }}>(recomendado)</span></label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {previews.map((src, i) => (
                    <div key={i} className="relative">
                      <img src={src} className="w-20 h-20 object-cover rounded-xl border" style={{ borderColor: '#dde4e6' }} alt="" />
                      <button onClick={() => quitarFoto(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: '#dc2626' }}>×</button>
                    </div>
                  ))}
                  {archivos.length < 5 && (
                    <button onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition"
                      style={{ borderColor: '#dde4e6', color: '#9ca3af' }}>
                      <span className="text-xl">+</span>
                      <span className="text-xs">Foto</span>
                    </button>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleArchivos} />
                <p className="text-xs" style={{ color: '#6b7280' }}>JPG, PNG, HEIC — máx. 5 fotos</p>
              </div>

              {/* Fecha observación */}
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#111827' }}>¿Cuándo lo observaste? <span className="font-normal" style={{ color: '#6b7280' }}>(opcional)</span></label>
                <input type="date" value={fechaObservacion} onChange={e => setFechaObservacion(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition"
                  style={{ border: '1.5px solid #dde4e6', color: '#111827', background: 'white' }}
                />
              </div>

              {/* Notas extra */}
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#111827' }}>¿Quieres agregar algo más? <span className="font-normal" style={{ color: '#6b7280' }}>(opcional)</span></label>
                <textarea rows={3} value={notasExtra} onChange={e => setNotasExtra(e.target.value)}
                  placeholder="Cualquier detalle adicional..."
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                  style={{ border: '1.5px solid #dde4e6', color: '#111827', background: 'white', resize: 'vertical' }}
                />
              </div>

              {/* Resumen */}
              <div className="rounded-xl p-4 flex flex-col gap-2.5" style={{ background: '#f2f5f6', border: '1.5px solid #dde4e6' }}>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#10454B' }}>Confirma esta información</p>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold" style={{ color: '#6b7280' }}>Identidad</p>
                    <p className="text-sm font-medium" style={{ color: '#111827' }}>{resumenIdentidad()}</p>
                  </div>
                  <button onClick={() => avanzar(1)} className="text-xs font-semibold flex-shrink-0" style={{ color: '#10454B' }}>Cambiar</button>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold" style={{ color: '#6b7280' }}>Temporalidad</p>
                    <p className="text-sm font-medium" style={{ color: '#111827' }}>
                      {temporalidad === 'pasado' ? 'Ya ocurrió' : temporalidad === 'activo' ? 'Está ocurriendo' : temporalidad === 'inminente' ? 'Va a ocurrir' : '—'}
                    </p>
                  </div>
                  <button onClick={() => avanzar(2)} className="text-xs font-semibold flex-shrink-0" style={{ color: '#10454B' }}>Cambiar</button>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold" style={{ color: '#6b7280' }}>Ubicación</p>
                    <p className="text-sm font-medium" style={{ color: '#111827' }}>{resumenUbicacion()}</p>
                  </div>
                  <button onClick={() => avanzar(3)} className="text-xs font-semibold flex-shrink-0" style={{ color: '#10454B' }}>Cambiar</button>
                </div>
              </div>

              {error && <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>}

              <div className="flex gap-3">
                <button onClick={() => avanzar(3)}
                  className="flex-1 py-3.5 rounded-xl border-2 font-bold text-sm transition"
                  style={{ borderColor: '#dde4e6', color: '#374151' }}>
                  ‹ Atrás
                </button>
                <button onClick={handleSubmit} disabled={enviando}
                  className="flex-1 py-3.5 rounded-xl font-bold text-white text-sm transition disabled:opacity-60"
                  style={{ backgroundColor: '#B6875D' }}>
                  {enviando ? 'Enviando...' : 'Enviar aviso'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
