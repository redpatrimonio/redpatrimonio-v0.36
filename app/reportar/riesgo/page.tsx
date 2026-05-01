'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'

const MapPicker = dynamic(() => import('@/components/map/MapPicker'), { ssr: false })

const TIPOS_RIESGO = [
  'Construcción / Obra',
  'Huaqueo / Saqueo',
  'Incendio',
  'Inundación / Erosión',
  'Agricultura / Ganadería',
  'Minería',
  'Vandalismo',
  'Abandono / Deterioro',
  'Otro',
]

const URGENCIA_LABELS: Record<number, string> = {
  1: 'Baja — Daño menor o pasado',
  2: 'Moderada — Deterioro visible',
  3: 'Importante — Riesgo activo',
  4: 'Alta — Amenaza inminente',
  5: 'Crítica — Destrucción en curso',
}

type Paso = 1 | 2 | 3

export default function RiesgoPage() {
  const supabase = createClient()
  const { user } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [paso, setPaso] = useState<Paso>(1)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Paso 1
  const [tipoRiesgo, setTipoRiesgo] = useState('')
  const [amenazas, setAmenazas] = useState('')
  const [temporalidad, setTemporalidad] = useState<'activo' | 'inminente' | 'pasado' | ''>('')
  const [urgencia, setUrgencia] = useState<number>(3)

  // Paso 2
  const [latitud, setLatitud] = useState<number | null>(null)
  const [longitud, setLongitud] = useState<number | null>(null)
  const [region, setRegion] = useState('')
  const [comuna, setComuna] = useState('')
  const [descripcionUbicacion, setDescripcionUbicacion] = useState('')

  // Paso 3
  const [autorReporte, setAutorReporte] = useState('')
  const [telefono, setTelefono] = useState('')
  const [archivos, setArchivos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

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

  async function handleSubmit() {
    if (!latitud || !longitud) { setError('Debes marcar la ubicación en el mapa.'); return }
    if (!tipoRiesgo) { setError('Selecciona el tipo de riesgo.'); return }
    if (!temporalidad) { setError('Indica la temporalidad del riesgo.'); return }
    setEnviando(true)
    setError(null)

    try {
      const payload: Record<string, unknown> = {
        nombre_reporte: `Riesgo: ${tipoRiesgo}`,
        tipo_riesgo_principal: tipoRiesgo,
        amenazas,
        temporalidad_riesgo: temporalidad,
        urgencia_autoevaluada: urgencia,
        latitud,
        longitud,
        region: region || null,
        comuna: comuna || null,
        descripcion_ubicacion: descripcionUbicacion || null,
        autor_reporte: autorReporte || null,
        telefono_usuario_contacto: telefono || null,
        id_usuario: user?.id || null,
        estado_validacion: 'rojo',
        codigo_accesibilidad: 'C',
        categoria_general: 'arqueologia_en_riesgo',
      }

      const { data: reporte, error: errReporte } = await supabase
        .from('reportes_nuevos')
        .insert(payload)
        .select('id_reporte')
        .single()

      if (errReporte || !reporte) throw new Error(errReporte?.message || 'Error al guardar el reporte.')

      const reporteId = reporte.id_reporte

      if (archivos.length > 0) {
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
      }

      router.push(`/reportar/riesgo/gracias?id=${reporteId}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error inesperado.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto">

        <div className="mb-6 text-center">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">Paso {paso} de 3</p>
          <h1 className="text-xl font-bold text-gray-800">⚠️ Arqueología en Riesgo</h1>
          <p className="text-sm text-gray-500 mt-1">Tu reporte es anónimo y no requiere cuenta.</p>
        </div>

        <div className="flex gap-1 mb-8">
          {[1, 2, 3].map(n => (
            <div key={n} className="flex-1 h-1.5 rounded-full"
              style={{ backgroundColor: n <= paso ? '#154A4E' : '#E5E7EB' }} />
          ))}
        </div>

        {/* PASO 1 */}
        {paso === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">¿Qué tipo de riesgo es? *</label>
              <div className="grid grid-cols-2 gap-2">
                {TIPOS_RIESGO.map(t => (
                  <button key={t} type="button"
                    onClick={() => setTipoRiesgo(t)}
                    className={`text-sm px-3 py-2 rounded-lg border-2 text-left transition ${
                      tipoRiesgo === t
                        ? 'border-[#154A4E] bg-[#EEF4F4] font-medium'
                        : 'border-gray-200 bg-white hover:border-gray-400'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción del daño o amenaza</label>
              <textarea rows={3} value={amenazas} onChange={e => setAmenazas(e.target.value)}
                placeholder="Describe lo que viste o lo que está ocurriendo..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#154A4E]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">¿Está ocurriendo ahora? *</label>
              <div className="flex gap-2">
                {(['activo', 'inminente', 'pasado'] as const).map(t => (
                  <button key={t} type="button"
                    onClick={() => setTemporalidad(t)}
                    className={`flex-1 text-sm py-2 rounded-lg border-2 capitalize transition ${
                      temporalidad === t
                        ? 'border-[#154A4E] bg-[#EEF4F4] font-medium'
                        : 'border-gray-200 bg-white hover:border-gray-400'
                    }`}>
                    {t === 'activo' ? 'Sí, activo' : t === 'inminente' ? 'Inminente' : 'Ya ocurrió'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgencia percibida: <span className="font-semibold text-[#154A4E]">{URGENCIA_LABELS[urgencia]}</span>
              </label>
              <input type="range" min={1} max={5} value={urgencia}
                onChange={e => setUrgencia(Number(e.target.value))}
                className="w-full accent-[#154A4E]"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Baja</span><span>Crítica</span>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button onClick={() => {
              if (!tipoRiesgo || !temporalidad) { setError('Completa los campos obligatorios.'); return }
              setError(null); setPaso(2)
            }}
              className="w-full py-3 rounded-lg font-semibold text-white transition"
              style={{ backgroundColor: '#154A4E' }}>
              Continuar ›
            </button>
          </div>
        )}

        {/* PASO 2 */}
        {paso === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Marca la ubicación en el mapa *</label>
              <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: 300 }}>
                <MapPicker
                  onLocationSelect={(lat: number, lng: number) => { setLatitud(lat); setLongitud(lng) }}
                />
              </div>
              {latitud && longitud && (
                <p className="text-xs text-gray-500 mt-1">{latitud.toFixed(6)}, {longitud.toFixed(6)}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Región</label>
                <input value={region} onChange={e => setRegion(e.target.value)}
                  placeholder="ej: Atacama"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#154A4E]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comuna</label>
                <input value={comuna} onChange={e => setComuna(e.target.value)}
                  placeholder="ej: Copiapó"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#154A4E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción de la ubicación</label>
              <input value={descripcionUbicacion} onChange={e => setDescripcionUbicacion(e.target.value)}
                placeholder="ej: 500m al norte del fundo, al lado del canal..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#154A4E]"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => { setError(null); setPaso(1) }}
                className="flex-1 py-3 rounded-lg border-2 border-gray-300 font-semibold text-gray-600 hover:border-gray-400 transition">
                ‹ Volver
              </button>
              <button onClick={() => {
                if (!latitud || !longitud) { setError('Marca el punto en el mapa.'); return }
                setError(null); setPaso(3)
              }}
                className="flex-1 py-3 rounded-lg font-semibold text-white transition"
                style={{ backgroundColor: '#154A4E' }}>
                Continuar ›
              </button>
            </div>
          </div>
        )}

        {/* PASO 3 */}
        {paso === 3 && (
          <div className="flex flex-col gap-5">
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Tu identidad es opcional. Solo la verá el equipo interno si necesitamos contactarte.
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre o alias (opcional)</label>
              <input value={autorReporte} onChange={e => setAutorReporte(e.target.value)}
                placeholder="Cómo quieres que te llamemos"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#154A4E]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono de contacto (opcional)</label>
              <input value={telefono} onChange={e => setTelefono(e.target.value)}
                placeholder="+56 9 ..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#154A4E]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fotos (hasta 5)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative">
                    <img src={src} className="w-20 h-20 object-cover rounded-lg border border-gray-200" alt="" />
                    <button onClick={() => quitarFoto(i)}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                      ×
                    </button>
                  </div>
                ))}
                {archivos.length < 5 && (
                  <button onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-[#154A4E] transition text-2xl">
                    +
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                onChange={handleArchivos}
              />
              <p className="text-xs text-gray-400">Las fotos ayudan al equipo a evaluar la urgencia del caso.</p>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => { setError(null); setPaso(2) }}
                className="flex-1 py-3 rounded-lg border-2 border-gray-300 font-semibold text-gray-600 hover:border-gray-400 transition">
                ‹ Volver
              </button>
              <button onClick={handleSubmit} disabled={enviando}
                className="flex-1 py-3 rounded-lg font-semibold text-white transition disabled:opacity-60"
                style={{ backgroundColor: '#B6875D' }}>
                {enviando ? 'Enviando...' : 'Enviar reporte'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
