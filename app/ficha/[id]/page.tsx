'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

interface ReporteHallazgo {
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
  nivel_proteccion: string | null
  nivel_acceso: string | null
  amenazas: string | null
  recinto_privado: boolean
  autor_reporte: string | null
  timestamp_creado: string
  timestamp_publicacion: string | null
  codigo_accesibilidad: string | null
}

interface Foto {
  id_medio: string
  url_publica: string
  descripcion_imagen: string | null
}

export default function FichaRegistroPage() {
  const params = useParams()
  const id = params?.id as string
  const { usuario, loading: authLoading } = useAuth()
  const router = useRouter()

  const [reporte, setReporte] = useState<ReporteHallazgo | null>(null)
  const [fotos, setFotos] = useState<Foto[]>([])
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [guardadoOk, setGuardadoOk] = useState(false)

  // Campos editables por el arqueólogo
  const [nombreSitio, setNombreSitio] = useState('')
  const [registrador, setRegistrador] = useState('')
  const [institucion, setInstitucion] = useState('')
  const [categoriaMonumento, setCategoriaMonumento] = useState('')
  const [tipologiaFuncional, setTipologiaFuncional] = useState('')
  const [culturaAsociada, setCulturaAsociada] = useState('')
  const [cronologiaGeneral, setCronologiaGeneral] = useState('')
  const [estadoConservacion, setEstadoConservacion] = useState('')
  const [nivelProteccion, setNivelProteccion] = useState('')
  const [descripcionEntidad, setDescripcionEntidad] = useState('')
  const [alteraciones, setAlteraciones] = useState('')
  const [region, setRegion] = useState('')
  const [comuna, setComuna] = useState('')
  const [descripcionUbicacion, setDescripcionUbicacion] = useState('')
  const [observaciones, setObservaciones] = useState('')

  const fechaHoy = new Date().toLocaleDateString('es-CL')

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

      // Pre-llenar campos editables desde la BD
      setNombreSitio(data.nombre_reporte || '')
      setRegistrador(data.autor_reporte || '')
      setCategoriaMonumento(data.tipologia_especifica?.[0] || '')
      setTipologiaFuncional(data.categoria_general || '')
      setCulturaAsociada(data.cultura_asociada || '')
      setCronologiaGeneral(data.periodo_cronologico || '')
      setEstadoConservacion(data.estado_conservacion || '')
      setNivelProteccion(data.nivel_proteccion || '')
      setAlteraciones(data.amenazas || '')
      setRegion(data.region || '')
      setComuna(data.comuna || '')
      setDescripcionUbicacion(data.descripcion_ubicacion || '')

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
      setGuardadoOk(false)

      const { error: updateError } = await supabase
        .from('reportes_nuevos')
        .update({
          nombre_reporte: nombreSitio,
          cultura_asociada: culturaAsociada,
          periodo_cronologico: cronologiaGeneral,
          estado_conservacion: estadoConservacion,
          nivel_proteccion: nivelProteccion,
          amenazas: alteraciones,
          region: region,
          comuna: comuna,
          descripcion_ubicacion: descripcionUbicacion,
        })
        .eq('id_reporte', id)

      if (updateError) throw updateError
      setGuardadoOk(true)
    } catch (err) {
      console.error('Error guardando:', err)
      setError('Error al guardar borrador')
    } finally {
      setGuardando(false)
    }
  }

  function handleExportar() {
    window.print()
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
    <>
      {/* ── Estilos de impresión ── */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-page {
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
          }
          input, textarea, select {
            border: 1px solid #999 !important;
            box-shadow: none !important;
            background: white !important;
          }
          .page-break { page-break-before: always; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 py-8 px-4 pb-24">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* ── Barra acciones ── */}
          <div className="no-print flex items-center justify-between">
            <button
              onClick={() => router.push(`/dashboard/publicados/${id}`)}
              className="text-gray-500 hover:text-gray-900 text-sm flex items-center gap-1"
            >
              ← Volver
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleGuardar}
                disabled={guardando}
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : '💾 Guardar borrador'}
              </button>
              <button
                onClick={handleExportar}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: '#10454B' }}
              >
                📄 Exportar PDF
              </button>
            </div>
          </div>

          {/* Feedback guardar */}
          {guardadoOk && (
            <div className="no-print bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-700 text-sm">✓ Borrador guardado correctamente</p>
            </div>
          )}
          {error && (
            <div className="no-print bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              DOCUMENTO FICHA DE REGISTRO
          ══════════════════════════════════════════════════ */}
          <div className="print-page bg-white rounded-lg shadow p-8 space-y-8">

            {/* Encabezado oficial */}
            <div className="text-center border-b pb-4">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Consejo de Monumentos Nacionales — República de Chile</p>
              <h1 className="text-xl font-bold text-gray-900">FICHA DE REGISTRO ARQUEOLÓGICO</h1>
              <p className="text-xs text-gray-500 mt-1">Formulario basado en planilla REGMON — CMN</p>
            </div>

            {/* I. Identificación y registro */}
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700 mb-4 pb-1 border-b">I. Identificación y Registro</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="md:col-span-2">
                  <Label>Nombre del sitio / monumento arqueológico *</Label>
                  <input
                    type="text"
                    value={nombreSitio}
                    onChange={e => setNombreSitio(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <Label>Registrador (nombre completo)</Label>
                  <input
                    type="text"
                    value={registrador}
                    onChange={e => setRegistrador(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <Label>Institución</Label>
                  <input
                    type="text"
                    value={institucion}
                    onChange={e => setInstitucion(e.target.value)}
                    placeholder="Universidad, empresa, independiente..."
                    className="input-field"
                  />
                </div>

                <div>
                  <Label>Fecha de registro</Label>
                  <input
                    type="text"
                    value={fechaHoy}
                    readOnly
                    className="input-field bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <Label>Categoría monumento (SA / HA)</Label>
                  <select
                    value={categoriaMonumento}
                    onChange={e => setCategoriaMonumento(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Sitio Arqueológico">Sitio Arqueológico (SA)</option>
                    <option value="Hallazgo Aislado">Hallazgo Aislado (HA)</option>
                  </select>
                </div>

                <div>
                  <Label>ID reporte RedPatrimonio</Label>
                  <input
                    type="text"
                    value={reporte.id_reporte}
                    readOnly
                    className="input-field bg-gray-50 text-gray-500 font-mono text-xs"
                  />
                </div>

              </div>
            </section>

            {/* II. Descripción */}
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700 mb-4 pb-1 border-b">II. Descripción</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <Label>Tipología funcional preponderante</Label>
                  <input
                    type="text"
                    value={tipologiaFuncional}
                    onChange={e => setTipologiaFuncional(e.target.value)}
                    placeholder="Ej: Funerario, Doméstico-habitacional..."
                    className="input-field"
                  />
                </div>

                <div>
                  <Label>Cultura asociada</Label>
                  <input
                    type="text"
                    value={culturaAsociada}
                    onChange={e => setCulturaAsociada(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <Label>Cronología general</Label>
                  <select
                    value={cronologiaGeneral}
                    onChange={e => setCronologiaGeneral(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Prehispánico">Prehispánico</option>
                    <option value="Histórico">Histórico</option>
                    <option value="Prehispánico e Histórico">Prehispánico e Histórico</option>
                    <option value="Sin información / No determinado">Sin información / No determinado</option>
                  </select>
                </div>

                <div>
                  <Label>Estado de conservación</Label>
                  <select
                    value={estadoConservacion}
                    onChange={e => setEstadoConservacion(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Bueno">Bueno</option>
                    <option value="Regular">Regular</option>
                    <option value="Grave">Grave</option>
                    <option value="Muy Grave">Muy Grave</option>
                    <option value="Destruido">Destruido</option>
                    <option value="Sin información">Sin información</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <Label>Breve descripción de la entidad</Label>
                  <textarea
                    value={descripcionEntidad}
                    onChange={e => setDescripcionEntidad(e.target.value)}
                    rows={4}
                    placeholder="Describa la entidad arqueológica según sus características funcionales y materiales..."
                    className="input-field"
                  />
                </div>

              </div>
            </section>

            {/* III. Conservación y protección */}
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700 mb-4 pb-1 border-b">III. Conservación y Protección</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <Label>Categoría de monumento / nivel de protección</Label>
                  <select
                    value={nivelProteccion}
                    onChange={e => setNivelProteccion(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Monumento Nacional">Monumento Nacional</option>
                    <option value="Zona Típica">Zona Típica</option>
                    <option value="Sin Protección">Sin Protección</option>
                    <option value="Sin información">Sin información</option>
                  </select>
                </div>

                <div>
                  <Label>Recinto privado</Label>
                  <input
                    type="text"
                    value={reporte.recinto_privado ? 'Sí' : 'No'}
                    readOnly
                    className="input-field bg-gray-50 text-gray-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Tipos de alteraciones / amenazas observadas</Label>
                  <textarea
                    value={alteraciones}
                    onChange={e => setAlteraciones(e.target.value)}
                    rows={3}
                    placeholder="Antrópicas, climáticas, biológicas, geológicas..."
                    className="input-field"
                  />
                </div>

              </div>
            </section>

            {/* IV. Ubicación */}
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700 mb-4 pb-1 border-b">IV. Ubicación</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <Label>Región</Label>
                  <input
                    type="text"
                    value={region}
                    onChange={e => setRegion(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <Label>Comuna</Label>
                  <input
                    type="text"
                    value={comuna}
                    onChange={e => setComuna(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <Label>Latitud (WGS84)</Label>
                  <input
                    type="text"
                    value={String(reporte.latitud)}
                    readOnly
                    className="input-field bg-gray-50 text-gray-500 font-mono"
                  />
                </div>

                <div>
                  <Label>Longitud (WGS84)</Label>
                  <input
                    type="text"
                    value={String(reporte.longitud)}
                    readOnly
                    className="input-field bg-gray-50 text-gray-500 font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Descripción del lugar / emplazamiento</Label>
                  <textarea
                    value={descripcionUbicacion}
                    onChange={e => setDescripcionUbicacion(e.target.value)}
                    rows={3}
                    placeholder="Acceso, geoforma, relación con hitos del entorno..."
                    className="input-field"
                  />
                </div>

              </div>
            </section>

            {/* V. Registro fotográfico */}
            {fotos.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700 mb-4 pb-1 border-b">V. Registro Fotográfico</h2>
                <div className="grid grid-cols-2 gap-4">
                  {fotos.map((foto) => (
                    <div key={foto.id_medio}>
                      <img
                        src={foto.url_publica}
                        alt={foto.descripcion_imagen || 'Foto'}
                        className="w-full h-40 object-cover rounded border border-gray-200"
                      />
                      {foto.descripcion_imagen && (
                        <p className="text-xs text-gray-500 mt-1 italic">{foto.descripcion_imagen}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* VI. Observaciones */}
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700 mb-4 pb-1 border-b">VI. Observaciones del Registrador</h2>
              <textarea
                value={observaciones}
                onChange={e => setObservaciones(e.target.value)}
                rows={4}
                placeholder="Observaciones adicionales, fuentes consultadas, condiciones del registro..."
                className="input-field"
              />
            </section>

            {/* Firma */}
            <section className="pt-4">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="border-b border-gray-400 mb-1 pb-6" />
                  <p className="text-xs text-gray-500 text-center">Firma del registrador</p>
                </div>
                <div>
                  <div className="border-b border-gray-400 mb-1 pb-6" />
                  <p className="text-xs text-gray-500 text-center">Timbre / Institución</p>
                </div>
              </div>
            </section>

          </div>
          {/* fin documento */}

        </div>
      </div>

      {/* Estilos inline para inputs del documento */}
      <style>{`
        .input-field {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: #111827;
          background: white;
          outline: none;
        }
        .input-field:focus {
          border-color: #10454B;
          box-shadow: 0 0 0 2px rgba(16,69,75,0.15);
        }
        textarea.input-field {
          resize: vertical;
        }
      `}</style>
    </>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
      {children}
    </label>
  )
}
