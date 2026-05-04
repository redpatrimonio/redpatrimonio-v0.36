'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'

const supabase = createClient()

const TIPOS_PROYECTO_CMN = [
  'Energía', 'Hidráulico', 'Inmobiliario', 'Agropecuario', 'Portuario',
  'Fabril', 'Equipamiento', 'Saneamiento Ambiental', 'Minería',
  'Forestal', 'Pesca y Acuicultura', 'Transporte', 'Mejoramiento de camino', 'Otro',
]

const TIPO_RIESGO_A_CMN: Record<string, string> = {
  inmobiliario: 'Inmobiliario',
  transporte: 'Transporte',
  agropecuario: 'Agropecuario',
  mineria: 'Minería',
  extraccion_aridos: 'Otro',
  forestal: 'Forestal',
  portuario: 'Portuario',
  sin_obra: 'Otro',
  indeterminado: 'Otro',
}

interface Reporte {
  id_reporte: string
  nombre_reporte: string | null
  tipo_riesgo_principal: string | null
  amenazas: string | null
  temporalidad_riesgo: string | null
  latitud: number | null
  longitud: number | null
  region: string | null
  comuna: string | null
  descripcion_ubicacion: string | null
  autor_reporte: string | null
  correo_usuario_contacto: string | null
  telefono_usuario_contacto: string | null
  fecha_observacion: string | null
  nombre_proyecto: string | null
  infractor_conocido: boolean | null
  infractor_nombre: string | null
  infractor_contacto: string | null
  timestamp_creado: string | null
  // campos nuevos
  rut_denunciante: string | null
  profesion_denunciante: string | null
  domicilio_denunciante: string | null
  infractor_rut: string | null
  infractor_domicilio: string | null
  obra_actividad: string | null
  nombre_propietario_predio: string | null
  observaciones_denuncia: string | null
}

interface Medio {
  url_publica: string
  tipo_medio: string
}

function hoy(): string {
  return new Date().toLocaleDateString('es-CL')
}

function formatFecha(iso: string | null): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('T')[0].split('-')
  return `${d}/${m}/${y}`
}

export default function DenunciaPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [guardado, setGuardado] = useState(false)
  const [fotos, setFotos] = useState<string[]>([])

  // ─ Datos del denunciante (arqueólogo)
  const [denNombre, setDenNombre] = useState('')
  const [denRut, setDenRut] = useState('')
  const [denProfesion, setDenProfesion] = useState('Arqueólogo/a')
  const [denCorreo, setDenCorreo] = useState('')
  const [denTelefono, setDenTelefono] = useState('')
  const [denDireccion, setDenDireccion] = useState('')

  // ─ Datos del hecho
  const [tipoProyecto, setTipoProyecto] = useState('')
  const [obraActividad, setObraActividad] = useState('')
  const [fechaHecho, setFechaHecho] = useState('')
  const [descripcionHechos, setDescripcionHechos] = useState('')
  const [region, setRegion] = useState('')
  const [comuna, setComuna] = useState('')
  const [ubicacionDetalle, setUbicacionDetalle] = useState('')
  const [coordenadas, setCoordenadas] = useState('')
  const [nombreProyecto, setNombreProyecto] = useState('')
  const [nombrePropietarioPredio, setNombrePropietarioPredio] = useState('')
  const [observacionesDenuncia, setObservacionesDenuncia] = useState('')

  // ─ Datos del infractor
  const [infNombre, setInfNombre] = useState('')
  const [infRut, setInfRut] = useState('')
  const [infDireccion, setInfDireccion] = useState('')
  const [infTelefono, setInfTelefono] = useState('')
  const [infCorreo, setInfCorreo] = useState('')

  // ─ Fecha denuncia
  const [fechaDenuncia] = useState(hoy())

  useEffect(() => {
    if (id) cargarReporte()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function cargarReporte() {
    try {
      setLoading(true)

      const { data: r, error: err } = await supabase
        .from('reportes_nuevos')
        .select('*')
        .eq('id_reporte', id)
        .single()

      if (err || !r) throw new Error('No se encontró el reporte.')
      const reporte = r as Reporte

      // Datos del hecho
      const tipoCMN = TIPO_RIESGO_A_CMN[reporte.tipo_riesgo_principal || ''] || ''
      setTipoProyecto(tipoCMN)
      setObraActividad(reporte.obra_actividad || '')
      setFechaHecho(formatFecha(reporte.fecha_observacion || reporte.timestamp_creado))
      setDescripcionHechos(reporte.amenazas || '')
      setRegion(reporte.region || '')
      setComuna(reporte.comuna || '')
      setUbicacionDetalle(reporte.descripcion_ubicacion || '')
      if (reporte.latitud && reporte.longitud) {
        setCoordenadas(`${reporte.latitud.toFixed(6)}, ${reporte.longitud.toFixed(6)}`)
      }
      setNombreProyecto(reporte.nombre_proyecto || '')
      setNombrePropietarioPredio(reporte.nombre_propietario_predio || '')
      setObservacionesDenuncia(reporte.observaciones_denuncia || '')

      // Infractor
      if (reporte.infractor_conocido) {
        setInfNombre(reporte.infractor_nombre || '')
        setInfTelefono(reporte.infractor_contacto || '')
      }
      setInfRut(reporte.infractor_rut || '')
      setInfDireccion(reporte.infractor_domicilio || '')

      // Denunciante desde BD (si ya se guardó antes) o desde perfil de usuario
      setDenRut(reporte.rut_denunciante || '')
      setDenProfesion(reporte.profesion_denunciante || 'Arqueólogo/a')
      setDenDireccion(reporte.domicilio_denunciante || '')
      if (user?.email) setDenCorreo(reporte.correo_usuario_contacto || user.email)

      // Fotos
      const { data: medios } = await supabase
        .from('reportes_medios')
        .select('url_publica, tipo_medio')
        .eq('id_reporte', id)
        .eq('tipo_medio', 'foto')
        .order('prioridad_visualizacion', { ascending: true })

      setFotos((medios as Medio[] || []).map(m => m.url_publica))

    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar el reporte.')
    } finally {
      setLoading(false)
    }
  }

  async function guardarBorrador() {
    setGuardando(true)
    try {
      await supabase.from('reportes_nuevos').update({
        nombre_proyecto:          nombreProyecto || null,
        obra_actividad:           obraActividad || null,
        amenazas:                 descripcionHechos || null,
        nombre_propietario_predio: nombrePropietarioPredio || null,
        observaciones_denuncia:   observacionesDenuncia || null,
        // denunciante
        rut_denunciante:          denRut || null,
        profesion_denunciante:    denProfesion || null,
        domicilio_denunciante:    denDireccion || null,
        // infractor
        infractor_nombre:         infNombre || null,
        infractor_rut:            infRut || null,
        infractor_domicilio:      infDireccion || null,
        infractor_contacto:       infTelefono || null,
      }).eq('id_reporte', id)
      setGuardado(true)
      setTimeout(() => setGuardado(false), 3000)
    } catch {
      setError('No se pudo guardar el borrador.')
    } finally {
      setGuardando(false)
    }
  }

  function descargarWord() {
    // TODO: conectar con /api/generar-denuncia en siguiente paso
    alert('Próximamente: descarga en formato Word CMN')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f2f5f6' }}>
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: '#10454B', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: '#6b7280' }}>Cargando reporte...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f2f5f6' }}>
        <div className="text-center max-w-sm mx-auto p-6">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => router.back()} className="px-4 py-2 rounded-lg text-white text-sm" style={{ background: '#10454B' }}>Volver</button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen py-6 px-4" style={{ background: '#f2f5f6' }}>

        {/* Barra de acciones */}
        <div className="max-w-3xl mx-auto mb-4 flex items-center justify-between gap-3 no-print">
          <button onClick={() => router.back()} className="text-sm font-medium" style={{ color: '#10454B' }}>← Volver</button>
          <div className="flex gap-2">
            <button
              onClick={guardarBorrador}
              disabled={guardando}
              className="px-4 py-2 rounded-lg border-2 text-sm font-semibold transition disabled:opacity-50"
              style={{ borderColor: '#10454B', color: '#10454B', background: 'white' }}
            >
              {guardando ? 'Guardando...' : guardado ? '✓ Guardado' : 'Guardar borrador'}
            </button>
            <button
              onClick={descargarWord}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition"
              style={{ background: '#B6875D' }}
            >
              Descargar Word
            </button>
          </div>
        </div>

        {/* Documento */}
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8" style={{ fontFamily: 'Georgia, serif' }}>

          {/* Encabezado */}
          <div className="text-center mb-8 pb-6 border-b-2" style={{ borderColor: '#10454B' }}>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#6b7280', fontFamily: 'sans-serif' }}>Consejo de Monumentos Nacionales</p>
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#111827' }}>DENUNCIA POR DAÑO A PATRIMONIO ARQUEOLÓGICO</h1>
            <p className="text-sm" style={{ color: '#6b7280', fontFamily: 'sans-serif' }}>Ley N° 17.288 de Monumentos Nacionales</p>
          </div>

          {/* Fecha denuncia */}
          <div className="flex justify-end mb-6">
            <p className="text-sm" style={{ color: '#374151', fontFamily: 'sans-serif' }}>
              Fecha: <strong>{fechaDenuncia}</strong>
            </p>
          </div>

          {/* SECCIÓN 1 — Denunciante */}
          <Section titulo="I. DATOS DEL DENUNCIANTE">
            <Row label="Nombre completo">
              <Input value={denNombre} onChange={setDenNombre} placeholder="Nombre y apellidos" />
            </Row>
            <Row label="RUT">
              <Input value={denRut} onChange={setDenRut} placeholder="12.345.678-9" />
            </Row>
            <Row label="Profesión / cargo">
              <Input value={denProfesion} onChange={setDenProfesion} placeholder="Arqueólogo/a" />
            </Row>
            <Row label="Correo electrónico">
              <Input value={denCorreo} onChange={setDenCorreo} placeholder="correo@dominio.cl" />
            </Row>
            <Row label="Teléfono">
              <Input value={denTelefono} onChange={setDenTelefono} placeholder="+56 9..." />
            </Row>
            <Row label="Domicilio">
              <Input value={denDireccion} onChange={setDenDireccion} placeholder="Calle, número, ciudad" />
            </Row>
          </Section>

          {/* SECCIÓN 2 — El hecho */}
          <Section titulo="II. DESCRIPCIÓN DEL HECHO">
            <Row label="Tipo de proyecto">
              <select
                value={tipoProyecto}
                onChange={e => setTipoProyecto(e.target.value)}
                className="w-full rounded px-2 py-1.5 text-sm"
                style={{ border: '1px solid #d1d5db', fontFamily: 'sans-serif' }}
              >
                <option value="">Seleccionar...</option>
                {TIPOS_PROYECTO_CMN.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Row>
            <Row label="Obra o actividad">
              <Input value={obraActividad} onChange={setObraActividad} placeholder="Nombre o descripción de la obra" />
            </Row>
            <Row label="Nombre del proyecto">
              <Input value={nombreProyecto} onChange={setNombreProyecto} placeholder="Nombre oficial si se conoce" />
            </Row>
            <Row label="Nombre propietario del predio">
              <Input value={nombrePropietarioPredio} onChange={setNombrePropietarioPredio} placeholder="Persona o empresa propietaria del predio" />
            </Row>
            <Row label="Fecha del hecho">
              <Input value={fechaHecho} onChange={setFechaHecho} placeholder="dd/mm/aaaa" />
            </Row>
            <Row label="Descripción de los hechos">
              <Textarea value={descripcionHechos} onChange={setDescripcionHechos}
                placeholder="Describa lo observado con el mayor detalle posible..." rows={5} />
            </Row>
            <Row label="Observaciones adicionales">
              <Textarea value={observacionesDenuncia} onChange={setObservacionesDenuncia}
                placeholder="Antecedentes relevantes, acciones previas, contexto..." rows={3} />
            </Row>
          </Section>

          {/* SECCIÓN 3 — Ubicación */}
          <Section titulo="III. UBICACIÓN">
            <Row label="Región"><Input value={region} onChange={setRegion} placeholder="" /></Row>
            <Row label="Comuna"><Input value={comuna} onChange={setComuna} placeholder="" /></Row>
            <Row label="Descripción del lugar">
              <Input value={ubicacionDetalle} onChange={setUbicacionDetalle} placeholder="Sector, predio, referencia" />
            </Row>
            <Row label="Coordenadas (WGS84)">
              <Input value={coordenadas} onChange={setCoordenadas} placeholder="lat, lon" />
            </Row>
          </Section>

          {/* SECCIÓN 4 — Infractor */}
          <Section titulo="IV. PRESUNTO INFRACTOR">
            <p className="text-xs mb-3" style={{ color: '#9ca3af', fontFamily: 'sans-serif' }}>Completar si se cuenta con la información. No es obligatorio.</p>
            <Row label="Nombre o razón social">
              <Input value={infNombre} onChange={setInfNombre} placeholder="" />
            </Row>
            <Row label="RUT / Cédula">
              <Input value={infRut} onChange={setInfRut} placeholder="" />
            </Row>
            <Row label="Domicilio">
              <Input value={infDireccion} onChange={setInfDireccion} placeholder="" />
            </Row>
            <Row label="Teléfono">
              <Input value={infTelefono} onChange={setInfTelefono} placeholder="" />
            </Row>
            <Row label="Correo electrónico">
              <Input value={infCorreo} onChange={setInfCorreo} placeholder="" />
            </Row>
          </Section>

          {/* SECCIÓN 5 — Evidencia fotográfica */}
          {fotos.length > 0 && (
            <Section titulo="V. REGISTRO FOTOGRÁFICO">
              <div className="grid grid-cols-2 gap-3 mt-2">
                {fotos.map((url, i) => (
                  <div key={i} className="rounded overflow-hidden border" style={{ borderColor: '#e5e7eb' }}>
                    <img src={url} alt={`Foto ${i + 1}`} className="w-full object-cover" style={{ maxHeight: 200 }} />
                    <p className="text-xs text-center py-1" style={{ color: '#9ca3af', fontFamily: 'sans-serif' }}>Foto {i + 1}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Firma */}
          <div className="mt-12 pt-6 border-t" style={{ borderColor: '#e5e7eb' }}>
            <div className="grid grid-cols-2 gap-12">
              <div className="text-center">
                <div className="border-b mb-2 pb-8" style={{ borderColor: '#374151' }} />
                <p className="text-xs" style={{ color: '#6b7280', fontFamily: 'sans-serif' }}>Firma del denunciante</p>
                <p className="text-xs mt-1" style={{ color: '#374151', fontFamily: 'sans-serif' }}>{denNombre || '_________________________'}</p>
              </div>
              <div className="text-center">
                <div className="border-b mb-2 pb-8" style={{ borderColor: '#374151' }} />
                <p className="text-xs" style={{ color: '#6b7280', fontFamily: 'sans-serif' }}>Timbre (si corresponde)</p>
              </div>
            </div>
          </div>

          {/* Pie de página */}
          <div className="mt-8 pt-4 border-t text-center" style={{ borderColor: '#e5e7eb' }}>
            <p className="text-xs" style={{ color: '#9ca3af', fontFamily: 'sans-serif' }}>Documento generado por RedPatrimonio · redpatrimonio.cl · Reporte ID: {id}</p>
          </div>

        </div>
      </div>
    </>
  )
}

// ─ Componentes internos

function Section({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-bold uppercase tracking-widest mb-4 pb-1 border-b"
        style={{ color: '#10454B', borderColor: '#10454B', fontFamily: 'sans-serif' }}>
        {titulo}
      </h2>
      <div className="flex flex-col gap-3">
        {children}
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-3 items-start">
      <label className="text-xs font-semibold pt-2 col-span-1" style={{ color: '#374151', fontFamily: 'sans-serif' }}>
        {label}
      </label>
      <div className="col-span-2">{children}</div>
    </div>
  )
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded px-2 py-1.5 text-sm"
      style={{ border: '1px solid #d1d5db', fontFamily: 'sans-serif', color: '#111827', background: 'white' }}
    />
  )
}

function Textarea({ value, onChange, placeholder, rows }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows || 3}
      className="w-full rounded px-2 py-1.5 text-sm"
      style={{ border: '1px solid #d1d5db', fontFamily: 'sans-serif', color: '#111827', background: 'white', resize: 'vertical' }}
    />
  )
}
