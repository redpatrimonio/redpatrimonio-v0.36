'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import * as S from '@/lib/ui/stepStyles'

const MapPicker = dynamic(() => import('@/components/map/MapPicker'), { ssr: false })

const TIPOS_OBRA = [
  { label: 'Construcción / inmobiliaria', value: 'inmobiliario' },
  { label: 'Carretera / camino', value: 'transporte' },
  { label: 'Agricultura / arado', value: 'agropecuario' },
  { label: 'Minería', value: 'mineria' },
  { label: 'Extracción de áridos', value: 'extraccion_aridos' },
  { label: 'Forestal', value: 'forestal' },
  { label: 'Portuario / acuicultura', value: 'portuario' },
  { label: 'Sin obra visible', value: 'sin_obra' },
  { label: 'No sé', value: 'indeterminado' },
]

const REGIONES = [
  'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo',
  'Valparaíso', 'Metropolitana', "O'Higgins", 'Maule', 'Ñuble',
  'Biobío', 'La Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes',
]

type Paso = 1 | 2 | 3 | 4
type Temporalidad = 'pasado' | 'activo' | 'inminente' | ''
type Identidad = 'anonimo' | 'publico'

const TEMPO_OPTIONS = [
  { value: 'pasado' as const, icon: '🪨', label: 'Ya ocurrió', desc: 'El daño está hecho' },
  { value: 'activo' as const, icon: '🚨', label: 'Está ocurriendo', desc: 'Hay una obra activa ahora' },
  { value: 'inminente' as const, icon: '⚠️', label: 'Va a ocurrir', desc: 'Hay un proyecto aprobado' },
]

function formatFechaChile(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

// ─── Estilos locales que extienden el sistema ───────────────────────────────

const header: React.CSSProperties = {
  backgroundColor: 'var(--btn)',
  position: 'sticky',
  top: 0,
  zIndex: 10,
}

const headerTitle: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontWeight: 400,
  fontSize: 18,
  color: 'var(--text)',
  lineHeight: 1.2,
}

const headerSub: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--muted)',
  marginTop: 2,
}

const stepNumLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: 'var(--accent)',
  marginBottom: 4,
}

const stepTitleLocal: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontWeight: 300,
  fontSize: 'clamp(22px, 5vw, 28px)',
  lineHeight: 1.15,
  color: 'var(--text)',
  marginBottom: 4,
}

const stepSubLocal: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--muted)',
  lineHeight: 1.6,
  marginBottom: 4,
}

// Card de selección (anónimo / público)
function selCard(active: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: '14px',
    borderRadius: 12,
    border: `2px solid ${active ? 'var(--accent)' : 'var(--border-m)'}`,
    background: active ? 'rgba(143,181,164,0.08)' : 'var(--surface-2)',
    cursor: 'pointer',
    transition: 'border-color 140ms, background 140ms',
  }
}

function radioCircle(active: boolean): React.CSSProperties {
  return {
    width: 18,
    height: 18,
    borderRadius: '50%',
    border: `2px solid ${active ? 'var(--accent)' : 'var(--faint)'}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  }
}

function tempoCard(active: boolean): React.CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 6,
    padding: '12px 8px',
    borderRadius: 12,
    border: `2px solid ${active ? 'var(--accent)' : 'var(--border-m)'}`,
    background: active ? 'rgba(143,181,164,0.08)' : 'var(--surface-2)',
    cursor: 'pointer',
    textAlign: 'center' as const,
    transition: 'border-color 140ms, background 140ms',
  }
}

function chipObra(active: boolean): React.CSSProperties {
  return {
    padding: '6px 12px',
    borderRadius: 20,
    border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border-m)'}`,
    background: active ? 'rgba(143,181,164,0.1)' : 'var(--surface-2)',
    color: active ? 'var(--accent)' : 'var(--muted)',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 140ms',
  }
}

const infoPrivacidad: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 10,
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid var(--border-m)',
  background: 'rgba(143,181,164,0.06)',
  fontSize: 12,
  color: 'var(--muted)',
  lineHeight: 1.5,
}

const subOptionBox: React.CSSProperties = {
  marginTop: -8,
  padding: '12px 14px',
  borderRadius: '0 0 12px 12px',
  border: '2px solid var(--accent)',
  borderTop: 'none',
  background: 'rgba(143,181,164,0.06)',
}

const infractorBox = (active: boolean): React.CSSProperties => ({
  borderRadius: 12,
  border: `2px solid ${active ? 'var(--accent)' : 'var(--border-m)'}`,
  background: active ? 'rgba(143,181,164,0.06)' : 'var(--surface-2)',
})

const resumenBox: React.CSSProperties = {
  padding: '14px',
  borderRadius: 12,
  border: '1px solid var(--border-m)',
  background: 'var(--surface-2)',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
}

const resumenLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  color: 'var(--accent)',
  marginBottom: 6,
}

const resumenRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 8,
}

const resumenValLabel: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--muted)',
  marginBottom: 2,
}

const resumenVal: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--text)',
}

const btnCambiar: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  color: 'var(--accent)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  flexShrink: 0,
  padding: 0,
}

// ────────────────────────────────────────────────────────────────────────────

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
  const [autorizaContacto, setAutorizaContacto] = useState(false)
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [telefono, setTelefono] = useState('')

  // Paso 2 — Situación
  const [temporalidad, setTemporalidad] = useState<Temporalidad>('')
  const [tiposObra, setTiposObra] = useState<string[]>([])
  const [descripcion, setDescripcion] = useState('')
  const [nombreProyecto, setNombreProyecto] = useState('')
  const [infractorConocido, setInfractorConocido] = useState(false)
  const [infractorNombre, setInfractorNombre] = useState('')
  const [infractorContacto, setInfractorContacto] = useState('')

  // Paso 3 — Ubicación
  const [latitud, setLatitud] = useState<number | null>(null)
  const [longitud, setLongitud] = useState<number | null>(null)
  const [region, setRegion] = useState('')
  const [comuna, setComuna] = useState('')
  const [comoSeLlega, setComoSeLlega] = useState('')
  const [focusField, setFocusField] = useState<string | null>(null)

  // Paso 4 — Evidencia
  const [archivos, setArchivos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [fechaObservacion, setFechaObservacion] = useState('')
  const [notasExtra, setNotasExtra] = useState('')

  function toggleObra(value: string) {
    setTiposObra(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value])
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

  function cambiarIdentidad(val: Identidad) {
    setIdentidad(val)
    setAutorizaContacto(false)
    if (val === 'anonimo') setDejarDatosPrivados(false)
  }

  const tieneDatos = identidad === 'publico' || (identidad === 'anonimo' && dejarDatosPrivados)

  function resumenIdentidad() {
    if (identidad === 'publico') return nombre ? `${nombre} (público)` : 'Personal / Comunidad'
    if (dejarDatosPrivados && nombre) return `Anónimo · datos privados (${nombre})`
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
      const esAnonimo = identidad === 'anonimo'
      const autorReporte = identidad === 'publico'
        ? (nombre || 'Personal/Comunidad')
        : (dejarDatosPrivados && nombre ? `[privado] ${nombre}` : null)

      const amenazasFinal = [
        descripcion || null,
        notasExtra || null,
      ].filter(Boolean).join(' | ') || null

      const tipoPrincipal = tiposObra[0] || null
      const primerLabel = TIPOS_OBRA.find(t => t.value === tipoPrincipal)?.label
      const nombreReporte = `Riesgo: ${primerLabel || temporalidad}`

      const payload: Record<string, unknown> = {
        nombre_reporte: nombreReporte,
        tipo_riesgo_principal: tipoPrincipal,
        amenazas: amenazasFinal,
        temporalidad_riesgo: temporalidad,
        latitud,
        longitud,
        region: region || null,
        comuna: comuna || null,
        descripcion_ubicacion: comoSeLlega || null,
        autor_reporte: autorReporte,
        es_anonimo: esAnonimo,
        autoriza_contacto: autorizaContacto,
        correo_usuario_contacto: tieneDatos ? (correo || null) : null,
        telefono_usuario_contacto: tieneDatos ? (telefono || null) : null,
        id_usuario: user?.id || null,
        estado_validacion: 'rojo',
        nivel_acceso: 'Espacio Publico',
        categoria_general: 'arqueologia_en_riesgo',
        fecha_observacion: fechaObservacion || null,
        nombre_proyecto: nombreProyecto || null,
        infractor_conocido: infractorConocido,
        infractor_nombre: infractorConocido ? (infractorNombre || null) : null,
        infractor_contacto: infractorConocido ? (infractorContacto || null) : null,
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

  const pasoLabel = ['Identidad', 'Situación', 'Ubicación', 'Evidencia']

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 448, margin: '0 auto', minHeight: '100vh', background: 'var(--surface)', boxShadow: '0 0 40px rgba(0,0,0,0.3)' }}>

        {/* ── Header sticky ── */}
        <div style={header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(143,181,164,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 600 }}>RP</span>
            </div>
            <div>
              <p style={headerTitle}>Arqueología en Riesgo</p>
              <p style={headerSub}>Aviso ciudadano · RedPatrimonio</p>
            </div>
          </div>

          {/* Barra de progreso */}
          <div style={{ height: 2, background: 'var(--border-m)' }}>
            <div style={{ height: '100%', background: 'var(--accent)', borderRadius: '0 2px 2px 0', transition: 'width 400ms ease', width: `${(paso / 4) * 100}%` }} />
          </div>

          {/* Chips de pasos */}
          <div style={{ display: 'flex', alignItems: 'flex-start', padding: '8px 20px 12px', gap: 0 }}>
            {pasoLabel.map((label, i) => {
              const n = i + 1
              const isActive = n === paso
              const isDone = n < paso
              return (
                <>
                  <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 600, transition: 'all 200ms',
                      border: isActive || isDone ? '2px solid var(--accent)' : '2px solid var(--faint)',
                      background: isActive ? 'var(--accent)' : isDone ? 'rgba(143,181,164,0.2)' : 'transparent',
                      color: isActive ? 'var(--btn)' : isDone ? 'var(--accent)' : 'var(--faint)',
                    }}>
                      {isDone ? '✓' : n}
                    </div>
                    <span style={{ fontSize: '0.6rem', color: isActive || isDone ? 'var(--muted)' : 'var(--faint)', textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
                  </div>
                  {i < 3 && <div style={{ flex: 1, height: 1, marginTop: 10, marginLeft: 4, marginRight: 4, background: isDone ? 'var(--accent)' : 'var(--border-m)', transition: 'background 300ms' }} />}
                </>
              )
            })}
          </div>
        </div>

        {/* ── Contenido ── */}
        <div style={{ padding: '24px 20px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── PASO 1 — Identidad ── */}
          {paso === 1 && (
            <>
              <div>
                <p style={stepNumLabel}>Paso 1 de 4</p>
                <h2 style={stepTitleLocal}>¿Cómo quieres enviar este aviso?</h2>
                <p style={stepSubLocal}>En ambos casos tu aviso tiene el mismo valor y será revisado con la misma prioridad.</p>
              </div>

              {/* Anónimo */}
              <div onClick={() => cambiarIdentidad('anonimo')} style={selCard(identidad === 'anonimo')}>
                <div style={radioCircle(identidad === 'anonimo')}>
                  {identidad === 'anonimo' && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>Anónimo</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>Tu identidad no quedará vinculada al aviso</p>
                </div>
              </div>

              {/* Sub-opción datos privados */}
              {identidad === 'anonimo' && (
                <div style={subOptionBox}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                    <input type="checkbox" checked={dejarDatosPrivados} onChange={e => setDejarDatosPrivados(e.target.checked)}
                      style={{ marginTop: 2, flexShrink: 0, accentColor: 'var(--accent)' }} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>Dejar datos de contacto de forma privada</p>
                      <p style={{ fontSize: 12, color: 'var(--muted)' }}>Solo los ve el equipo de RedPatrimonio. No se publican nunca.</p>
                    </div>
                  </label>
                </div>
              )}

              {/* Personal / Comunidad */}
              <div onClick={() => cambiarIdentidad('publico')} style={selCard(identidad === 'publico')}>
                <div style={radioCircle(identidad === 'publico')}>
                  {identidad === 'publico' && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>Personal / Comunidad</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>Tu nombre o alias aparecerá en el reporte</p>
                </div>
              </div>

              {/* Campos de contacto */}
              {tieneDatos && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '14px', borderRadius: 12, border: '1px solid var(--border-m)', background: 'var(--surface-2)' }}>
                  <div>
                    <label style={S.fieldLabel}>Nombre o alias <span style={{ color: 'var(--faint)', textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>(opcional)</span></label>
                    <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Cómo quieres que te llamemos"
                      style={{ ...S.input, ...(focusField === 'nombre' ? S.inputFocus : S.inputBlur) }}
                      onFocus={() => setFocusField('nombre')} onBlur={() => setFocusField(null)} />
                  </div>
                  <div>
                    <label style={S.fieldLabel}>Correo electrónico <span style={{ color: 'var(--faint)', textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>(opcional)</span></label>
                    <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} placeholder="tu@correo.cl"
                      style={{ ...S.input, ...(focusField === 'correo' ? S.inputFocus : S.inputBlur) }}
                      onFocus={() => setFocusField('correo')} onBlur={() => setFocusField(null)} />
                  </div>
                  <div>
                    <label style={S.fieldLabel}>Teléfono <span style={{ color: 'var(--faint)', textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>(opcional)</span></label>
                    <input value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="+56 9 ..."
                      style={{ ...S.input, ...(focusField === 'telefono' ? S.inputFocus : S.inputBlur) }}
                      onFocus={() => setFocusField('telefono')} onBlur={() => setFocusField(null)} />
                  </div>
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                      <input type="checkbox" checked={autorizaContacto} onChange={e => setAutorizaContacto(e.target.checked)}
                        style={{ marginTop: 2, flexShrink: 0, accentColor: 'var(--accent)' }} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>Autorizo ser contactado/a</p>
                        <p style={{ fontSize: 12, color: 'var(--muted)' }}>El equipo de RedPatrimonio puede escribirme si necesita más información sobre este aviso.</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Banner privacidad */}
              <div style={infoPrivacidad}>
                <svg style={{ flexShrink: 0, marginTop: 1 }} width="13" height="13" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L3 5v5c0 4.418 3.134 8.559 7 9.5C16.866 18.559 20 14.418 20 10V5l-7-3z" fill="var(--accent)" opacity=".5" />
                </svg>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                  {identidad === 'publico'
                    ? <><strong style={{ color: 'var(--text)' }}>Tu nombre aparecerá en el reporte.</strong> Tus datos de contacto son siempre privados.</>
                    : <><strong style={{ color: 'var(--text)' }}>Tus datos son privados.</strong> Solo los verá el equipo de RedPatrimonio. Nunca se publican.</>
                  }
                </p>
              </div>

              <button onClick={() => avanzar(2)} style={S.btnPrimary}>Continuar ›</button>
            </>
          )}

          {/* ── PASO 2 — Situación ── */}
          {paso === 2 && (
            <>
              <div>
                <p style={stepNumLabel}>Paso 2 de 4</p>
                <h2 style={stepTitleLocal}>¿Qué está pasando?</h2>
                <p style={stepSubLocal}>Cuéntanos con tus palabras. No hace falta saber arqueología para describir lo que ves.</p>
              </div>

              {/* Temporalidad */}
              <div>
                <label style={S.fieldLabel}>¿Cuándo ocurre el daño? <span style={S.required}>*</span></label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {TEMPO_OPTIONS.map(opt => (
                    <button key={opt.value} type="button" onClick={() => setTemporalidad(opt.value)} style={tempoCard(temporalidad === opt.value)}>
                      <span style={{ fontSize: 24 }}>{opt.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{opt.label}</span>
                      <span style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.3 }}>{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipo de obra */}
              <div>
                <label style={S.fieldLabel}>¿Qué tipo de obra? <span style={{ color: 'var(--faint)', textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>(opcional)</span></label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {TIPOS_OBRA.map(tipo => (
                    <button key={tipo.value} type="button" onClick={() => toggleObra(tipo.value)} style={chipObra(tiposObra.includes(tipo.value))}>
                      {tipo.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombre del proyecto */}
              <div>
                <label style={S.fieldLabel}>¿Sabes el nombre del proyecto u obra? <span style={{ color: 'var(--faint)', textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>(opcional)</span></label>
                <input value={nombreProyecto} onChange={e => setNombreProyecto(e.target.value)}
                  placeholder="ej: Loteo Cerro Norte, Proyecto minero La Estrella..."
                  style={{ ...S.input, ...(focusField === 'proyecto' ? S.inputFocus : S.inputBlur) }}
                  onFocus={() => setFocusField('proyecto')} onBlur={() => setFocusField(null)} />
              </div>

              {/* Descripción libre */}
              <div>
                <label style={S.fieldLabel}>¿Qué viste exactamente?</label>
                <textarea rows={4} value={descripcion} onChange={e => setDescripcion(e.target.value)}
                  placeholder="Describe lo que viste o lo que está ocurriendo. Cualquier detalle ayuda..."
                  style={{ ...S.textarea, ...(focusField === 'desc' ? S.inputFocus : S.inputBlur), minHeight: 90 }}
                  onFocus={() => setFocusField('desc')} onBlur={() => setFocusField(null)} />
              </div>

              {/* Infractor */}
              <div style={infractorBox(infractorConocido)}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={infractorConocido}
                    onChange={e => {
                      setInfractorConocido(e.target.checked)
                      if (!e.target.checked) { setInfractorNombre(''); setInfractorContacto('') }
                    }}
                    style={{ marginTop: 2, flexShrink: 0, accentColor: 'var(--accent)' }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>¿Sabes quién está causando el daño?</p>
                    <p style={{ fontSize: 12, color: 'var(--muted)' }}>Empresa, persona, proyecto — cualquier dato ayuda</p>
                  </div>
                </label>
                {infractorConocido && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 14px 14px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ paddingTop: 12 }}>
                      <label style={S.fieldLabel}>Nombre o empresa</label>
                      <input value={infractorNombre} onChange={e => setInfractorNombre(e.target.value)}
                        placeholder="ej: Constructora XYZ, Juan Pérez..."
                        style={{ ...S.input, ...(focusField === 'infNombre' ? S.inputFocus : S.inputBlur) }}
                        onFocus={() => setFocusField('infNombre')} onBlur={() => setFocusField(null)} />
                    </div>
                    <div>
                      <label style={S.fieldLabel}>¿Cómo contactarlo? <span style={{ color: 'var(--faint)', textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>(teléfono, correo, dirección)</span></label>
                      <input value={infractorContacto} onChange={e => setInfractorContacto(e.target.value)}
                        placeholder="cualquier dato que tengas..."
                        style={{ ...S.input, ...(focusField === 'infContacto' ? S.inputFocus : S.inputBlur) }}
                        onFocus={() => setFocusField('infContacto')} onBlur={() => setFocusField(null)} />
                    </div>
                  </div>
                )}
              </div>

              {error && <div style={S.errorBox}>{error}</div>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => avanzar(1)} style={S.btnSecondary}>‹ Atrás</button>
                <button onClick={() => { if (!temporalidad) { setError('Indica cuándo ocurre el daño.'); return } avanzar(3) }} style={S.btnPrimary}>Continuar ›</button>
              </div>
            </>
          )}

          {/* ── PASO 3 — Ubicación ── */}
          {paso === 3 && (
            <>
              <div>
                <p style={stepNumLabel}>Paso 3 de 4</p>
                <h2 style={stepTitleLocal}>¿Dónde ocurre?</h2>
                <p style={stepSubLocal}>La ubicación es clave. Usa tu GPS o describe el lugar lo mejor que puedas.</p>
              </div>

              <div>
                <label style={S.fieldLabel}>Toca para marcar el lugar <span style={S.required}>*</span></label>
                <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-m)', height: 280 }}>
                  <MapPicker onLocationSelect={(lat: number, lng: number) => { setLatitud(lat); setLongitud(lng) }} />
                </div>
                {latitud && longitud && (
                  <p style={{ ...S.fieldHint, color: 'var(--accent)', marginTop: 6 }}>{latitud.toFixed(6)}, {longitud.toFixed(6)}</p>
                )}
              </div>

              <div>
                <label style={S.fieldLabel}>Región</label>
                <select value={region} onChange={e => setRegion(e.target.value)}
                  style={{ ...S.select, ...(focusField === 'region' ? S.inputFocus : S.inputBlur) }}
                  onFocus={() => setFocusField('region')} onBlur={() => setFocusField(null)}>
                  <option value="">Seleccionar...</option>
                  {REGIONES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label style={S.fieldLabel}>Comuna</label>
                <input value={comuna} onChange={e => setComuna(e.target.value)} placeholder="ej: Copiapó"
                  style={{ ...S.input, ...(focusField === 'comuna' ? S.inputFocus : S.inputBlur) }}
                  onFocus={() => setFocusField('comuna')} onBlur={() => setFocusField(null)} />
              </div>

              <div>
                <label style={S.fieldLabel}>¿Cómo se llega? <span style={{ color: 'var(--faint)', textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>(opcional)</span></label>
                <input value={comoSeLlega} onChange={e => setComoSeLlega(e.target.value)}
                  placeholder="ej: 500m al norte del fundo, al lado del canal..."
                  style={{ ...S.input, ...(focusField === 'llega' ? S.inputFocus : S.inputBlur) }}
                  onFocus={() => setFocusField('llega')} onBlur={() => setFocusField(null)} />
              </div>

              {error && <div style={S.errorBox}>{error}</div>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => avanzar(2)} style={S.btnSecondary}>‹ Atrás</button>
                <button onClick={() => { if (!latitud || !longitud) { setError('Marca el punto en el mapa.'); return } avanzar(4) }} style={S.btnPrimary}>Continuar ›</button>
              </div>
            </>
          )}

          {/* ── PASO 4 — Evidencia ── */}
          {paso === 4 && (
            <>
              <div>
                <p style={stepNumLabel}>Paso 4 de 4</p>
                <h2 style={stepTitleLocal}>Evidencia y confirmación</h2>
                <p style={stepSubLocal}>Agrega fotos si tienes. Revisa el resumen antes de enviar.</p>
              </div>

              {/* Fotos */}
              <div>
                <label style={S.fieldLabel}>Fotografías <span style={{ color: 'var(--faint)', textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>(recomendado)</span></label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  {previews.map((src, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={src} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border-m)' }} alt="" />
                      <button onClick={() => quitarFoto(i)} style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'var(--ladrillo)', border: 'none', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                    </div>
                  ))}
                  {archivos.length < 5 && (
                    <button onClick={() => fileInputRef.current?.click()} style={{ width: 80, height: 80, borderRadius: 10, border: '1.5px dashed var(--border-m)', background: 'var(--surface-2)', color: 'var(--faint)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 22 }}>
                      +
                      <span style={{ fontSize: 11, color: 'var(--faint)' }}>Foto</span>
                    </button>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleArchivos} />
                <p style={S.fieldHint}>JPG, PNG, HEIC — máx. 5 fotos</p>
              </div>

              {/* Fecha observación */}
              <div>
                <label style={S.fieldLabel}>¿Cuándo lo observaste? <span style={{ color: 'var(--faint)', textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>(opcional)</span></label>
                <input type="date" value={fechaObservacion} onChange={e => setFechaObservacion(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  style={{ ...S.input, ...(focusField === 'fecha' ? S.inputFocus : S.inputBlur) }}
                  onFocus={() => setFocusField('fecha')} onBlur={() => setFocusField(null)} />
                {fechaObservacion && (
                  <p style={{ ...S.fieldHint, color: 'var(--accent)', marginTop: 6 }}>{formatFechaChile(fechaObservacion)}</p>
                )}
              </div>

              {/* Notas extra */}
              <div>
                <label style={S.fieldLabel}>¿Quieres agregar algo más? <span style={{ color: 'var(--faint)', textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>(opcional)</span></label>
                <textarea rows={3} value={notasExtra} onChange={e => setNotasExtra(e.target.value)}
                  placeholder="Cualquier detalle adicional..."
                  style={{ ...S.textarea, ...(focusField === 'notas' ? S.inputFocus : S.inputBlur) }}
                  onFocus={() => setFocusField('notas')} onBlur={() => setFocusField(null)} />
              </div>

              {/* Resumen */}
              <div style={resumenBox}>
                <p style={resumenLabel}>Confirma esta información</p>

                <div style={resumenRow}>
                  <div>
                    <p style={resumenValLabel}>Identidad</p>
                    <p style={resumenVal}>{resumenIdentidad()}</p>
                  </div>
                  <button onClick={() => avanzar(1)} style={btnCambiar}>Cambiar</button>
                </div>

                <div style={{ ...resumenRow, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                  <div>
                    <p style={resumenValLabel}>Temporalidad</p>
                    <p style={resumenVal}>
                      {temporalidad === 'pasado' ? 'Ya ocurrió' : temporalidad === 'activo' ? 'Está ocurriendo' : temporalidad === 'inminente' ? 'Va a ocurrir' : '—'}
                    </p>
                  </div>
                  <button onClick={() => avanzar(2)} style={btnCambiar}>Cambiar</button>
                </div>

                {tiposObra.length > 0 && (
                  <div style={{ ...resumenRow, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                    <div>
                      <p style={resumenValLabel}>Tipo de obra</p>
                      <p style={resumenVal}>{tiposObra.map(v => TIPOS_OBRA.find(t => t.value === v)?.label).filter(Boolean).join(', ')}</p>
                    </div>
                    <button onClick={() => avanzar(2)} style={btnCambiar}>Cambiar</button>
                  </div>
                )}

                <div style={{ ...resumenRow, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                  <div>
                    <p style={resumenValLabel}>Ubicación</p>
                    <p style={resumenVal}>{resumenUbicacion()}</p>
                  </div>
                  <button onClick={() => avanzar(3)} style={btnCambiar}>Cambiar</button>
                </div>

                {fechaObservacion && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                    <p style={resumenValLabel}>Fecha observación</p>
                    <p style={resumenVal}>{formatFechaChile(fechaObservacion)}</p>
                  </div>
                )}

                {infractorConocido && infractorNombre && (
                  <div style={{ ...resumenRow, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                    <div>
                      <p style={resumenValLabel}>Presunto infractor</p>
                      <p style={resumenVal}>{infractorNombre}</p>
                    </div>
                    <button onClick={() => avanzar(2)} style={btnCambiar}>Cambiar</button>
                  </div>
                )}
              </div>

              {error && <div style={S.errorBox}>{error}</div>}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => avanzar(3)} style={S.btnSecondary}>‹ Atrás</button>
                <button onClick={handleSubmit} disabled={enviando}
                  style={{ ...S.btnPrimary, opacity: enviando ? 0.6 : 1, cursor: enviando ? 'not-allowed' : 'pointer' }}>
                  {enviando ? 'Enviando...' : 'Enviar aviso'}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
