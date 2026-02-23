'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { InfoContactoDisplay } from '@/components/sitio/InfoContactoDisplay'
import { SolicitarContactoModal } from './SolicitarContactoModal'
import { puedeVerCoordenadasExactas } from '@/lib/utils/accesibilidad'
import { esExpertoOMas } from '@/lib/utils/role'

const supabase = createClient()

interface Foto {
  id_medio: string
  url_publica: string
  descripcion_imagen: string | null
}

interface SitioCompleto {
  id_reporte: string
  nombre_reporte: string
  descripcion_ubicacion: string | null
  latitud: number
  longitud: number
  region: string
  comuna: string
  categoria_general: string | null
  tipologia_especifica: string[] | null
  cultura_asociada: string | null
  periodo_cronologico: string | null
  estado_conservacion: string | null
  codigo_accesibilidad: string
  // Créditos
  usuario_autor?: { nombre_completo: string } | null
  usuario_revisor?: { nombre_completo: string } | null
  usuario_publicador?: { nombre_completo: string } | null
}

interface FichaSitioModalProps {
  idSitio: string
  onClose: () => void
}

export function FichaSitioModal({ idSitio, onClose }: FichaSitioModalProps) {
  const { usuario } = useAuth()
  const [sitio, setSitio] = useState<SitioCompleto | null>(null)
  const [fotos, setFotos] = useState<Foto[]>([])
  const [fotoActual, setFotoActual] = useState(0)
  const [loading, setLoading] = useState(true)
  const [mostrarSolicitud, setMostrarSolicitud] = useState(false)
  const [fotoFullscreen, setFotoFullscreen] = useState(false)

  useEffect(() => { cargarDatos() }, [idSitio])

  async function cargarDatos() {
    try {
      const { data: sitioData, error: sitioError } = await supabase
        .from('reportes_nuevos')
        .select('*, usuario_autor:usuarios_autorizados!id_usuario(nombre_completo), usuario_revisor:usuarios_autorizados!id_usuario_revisor(nombre_completo), usuario_publicador:usuarios_autorizados!id_usuario_publico(nombre_completo)')
        .eq('id_reporte', idSitio)
        .single()
      if (sitioError) throw sitioError
      setSitio(sitioData as any)

      // 1. Intentar cargar desde reportes_medios (esquema nuevo)
      const { data: fotosData } = await supabase
        .from('reportes_medios')
        .select('id_medio, url_publica, descripcion_imagen')
        .eq('id_reporte', idSitio)
        .order('prioridad_visualizacion', { ascending: false })

      if (fotosData && fotosData.length > 0) {
        setFotos(fotosData)
      } else {
        // 2. Fallback: Intentar cargar desde tabla 'medios' (esquema antiguo)
        // Nota: En el esquema antiguo el campo se llama id_sitio pero a veces se usaba id_reporte indistintamente
        const { data: mediosData } = await supabase
          .from('medios')
          .select('id_medio, url_publica, descripcion_imagen')
          .eq('id_sitio', idSitio)
          .order('prioridad_visualizacion', { ascending: false })

        setFotos(mediosData || [])
      }
    } catch (err) {
      console.error('Error cargando sitio:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleCompartir() {
    const url = `${window.location.origin}/mapa?sitio=${idSitio}`
    if (navigator.share) {
      navigator.share({ title: sitio?.nombre_reporte, text: `${sitio?.nombre_reporte} - Red Patrimonio Chile`, url })
    } else {
      navigator.clipboard.writeText(url)
      alert('Link copiado al portapapeles')
    }
  }

  function prevFoto() { setFotoActual(i => (i - 1 + fotos.length) % fotos.length) }
  function nextFoto() { setFotoActual(i => (i + 1) % fotos.length) }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-white border-t-transparent rounded-full animate-spin" style={{ borderWidth: '3px', borderColor: '#B6875D', borderTopColor: 'transparent' }} />
          <p className="text-white text-sm tracking-wide">Cargando ficha…</p>
        </div>
      </div>
    )
  }

  if (!sitio) return null

  const codigo = sitio.codigo_accesibilidad as 'A' | 'B' | 'C'
  const rolUsuario = (usuario?.rol as 'publico' | 'experto' | 'partner' | 'founder') || null
  const puedeVerCoordenadas = puedeVerCoordenadasExactas(codigo, rolUsuario)
  const puedeVerInfoContacto = codigo === 'A' || (codigo === 'B' && puedeVerCoordenadas) || esExpertoOMas(rolUsuario)

  const datosTecnicos = [
    { label: 'Categoría', value: sitio.categoria_general },
    { label: 'Tipología', value: sitio.tipologia_especifica?.join(' · ') },
    { label: 'Cultura', value: sitio.cultura_asociada },
    { label: 'Período', value: sitio.periodo_cronologico },
    { label: 'Conservación', value: sitio.estado_conservacion },
    ...(puedeVerCoordenadas ? [{ label: 'Coordenadas', value: `${sitio.latitud.toFixed(6)}, ${sitio.longitud.toFixed(6)}` }] : []),
  ].filter(d => d.value)

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 z-[1000]"
        style={{ backgroundColor: 'rgba(0,0,0,0.72)' }}
        onClick={onClose}
      >
        {/* ── Modal container ── */}
        <div
          className="absolute inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center md:p-6"
          onClick={e => e.stopPropagation()}
        >
          <div
            className="relative bg-white w-full md:max-w-2xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: '95vh' }}
          >

            {/* ══════════ ZONA FOTOS ══════════ */}
            <div className="relative w-full flex-shrink-0 bg-black" style={{ maxHeight: '50vh' }}>

              {fotos.length > 0 ? (
                <>
                  {/* Imagen contenida sin recorte */}
                  <img
                    src={fotos[fotoActual].url_publica}
                    alt={fotos[fotoActual].descripcion_imagen || sitio.nombre_reporte}
                    style={{ width: '100%', maxHeight: '50vh', objectFit: 'contain', display: 'block' }}
                  />

                  {/* Flechas de navegación (solo si hay más de 1 foto) */}
                  {fotos.length > 1 && (
                    <>
                      <button
                        onClick={prevFoto}
                        style={{
                          position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                          background: 'rgba(0,0,0,0.45)', color: 'white', border: 'none',
                          borderRadius: '50%', width: 34, height: 34, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                        }}
                      >‹</button>
                      <button
                        onClick={nextFoto}
                        style={{
                          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                          background: 'rgba(0,0,0,0.45)', color: 'white', border: 'none',
                          borderRadius: '50%', width: 34, height: 34, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                        }}
                      >›</button>
                    </>
                  )}

                  {/* Botón pantalla completa — esquina superior derecha */}
                  <button
                    onClick={() => setFotoFullscreen(true)}
                    title="Ver a pantalla completa"
                    style={{
                      position: 'absolute', top: 10, right: 10,
                      background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: 8,
                      padding: '6px 7px', cursor: 'pointer', lineHeight: 0,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                  </button>

                  {/* Puntos de navegación iOS — sobre la imagen, parte inferior */}
                  {fotos.length > 1 && (
                    <div style={{
                      position: 'absolute', bottom: 10, left: 0, right: 0,
                      display: 'flex', justifyContent: 'center', gap: 6,
                    }}>
                      {fotos.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setFotoActual(idx)}
                          style={{
                            width: idx === fotoActual ? 20 : 7,
                            height: 7,
                            borderRadius: 999,
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            transition: 'all 0.2s',
                            backgroundColor: idx === fotoActual ? '#B6875D' : 'rgba(255,255,255,0.55)',
                          }}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* Placeholder sin foto */
                <div style={{
                  height: '200px', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  <span style={{ fontSize: 48, opacity: 0.35 }}>🏺</span>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Sin fotografías</p>
                </div>
              )}

              {/* Botón cerrar — esquina superior izquierda sobre la foto */}
              <button
                onClick={onClose}
                style={{
                  position: 'absolute', top: 10, left: 10,
                  background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: 8,
                  padding: '4px 10px', cursor: 'pointer', color: 'white',
                  fontSize: 20, lineHeight: 1.3, fontWeight: 300,
                }}
              >×</button>
            </div>

            {/* ══════════ ZONA DATOS (scrollable) ══════════ */}
            <div className="overflow-y-auto flex-1" style={{ paddingBottom: '40px' }}>

              {/* Encabezado: Título + Subtítulo */}
              <div style={{ padding: '20px 24px 16px' }}>
                <h2 style={{
                  fontSize: '22px', fontWeight: 700, color: '#10454B',
                  lineHeight: 1.25, marginBottom: 4,
                }}>
                  {sitio.nombre_reporte}
                </h2>
                <p style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 500, letterSpacing: '0.02em' }}>
                  {sitio.comuna}
                  {sitio.region ? ` · ${sitio.region}` : ''}
                </p>
              </div>

              {/* Datos técnicos — grid sobre fondo gris claro */}
              {datosTecnicos.length > 0 && (
                <div style={{ backgroundColor: '#f8f7f5', padding: '16px 24px', borderTop: '1px solid #ede9e3', borderBottom: '1px solid #ede9e3' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: '#10454B', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
                    Datos técnicos
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 16px' }}>
                    {datosTecnicos.map(d => (
                      <div key={d.label}>
                        <p style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                          {d.label}
                        </p>
                        <p style={{ fontSize: '13px', color: '#1f2937', fontWeight: 500, lineHeight: 1.4 }}>
                          {d.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Descripción del sitio */}
              {sitio.descripcion_ubicacion && (
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: '#10454B', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                    Descripción
                  </p>
                  <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.65 }}>
                    {sitio.descripcion_ubicacion}
                  </p>
                </div>
              )}

              {/* Info contacto o solicitud */}
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
                {puedeVerInfoContacto ? (
                  <InfoContactoDisplay idSitio={idSitio} />
                ) : (
                  <button
                    onClick={() => setMostrarSolicitud(true)}
                    style={{
                      width: '100%', padding: '11px 0',
                      backgroundColor: '#10454B', color: '#B6875D',
                      border: 'none', borderRadius: 10,
                      fontSize: '14px', fontWeight: 700,
                      cursor: 'pointer', letterSpacing: '0.02em',
                    }}
                  >
                    📨 Solicitar información de contacto
                  </button>
                )}
              </div>

              {/* Reconocimientos / Créditos */}
              {(sitio.usuario_autor || sitio.usuario_revisor || sitio.usuario_publicador) && (
                <div style={{ padding: '16px 24px', backgroundColor: '#fcfaf7', borderBottom: '1px solid #f3f4f6' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: '#10454B', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
                    Institucionalidad y Créditos
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {sitio.usuario_autor && (
                      <p style={{ fontSize: '12px', color: '#4b5563' }}>
                        <span style={{ fontWeight: 600, color: '#10454B' }}>Reportado por:</span> {sitio.usuario_autor.nombre_completo}
                      </p>
                    )}
                    {sitio.usuario_revisor && (
                      <p style={{ fontSize: '12px', color: '#4b5563' }}>
                        <span style={{ fontWeight: 600, color: '#10454B' }}>Revisado por:</span> {sitio.usuario_revisor.nombre_completo}
                      </p>
                    )}
                    {sitio.usuario_publicador && (
                      <p style={{ fontSize: '12px', color: '#4b5563' }}>
                        <span style={{ fontWeight: 600, color: '#10454B' }}>Publicado por:</span> {sitio.usuario_publicador.nombre_completo}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Compartir — siempre visible */}
              <div style={{ padding: '12px 24px 20px' }}>
                <button
                  onClick={handleCompartir}
                  style={{
                    width: '100%', padding: '10px 0',
                    backgroundColor: 'white', color: '#10454B',
                    border: '1.5px solid #10454B', borderRadius: 10,
                    fontSize: '13px', fontWeight: 600,
                    cursor: 'pointer', letterSpacing: '0.02em',
                  }}
                >
                  Compartir sitio
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── Overlay foto pantalla completa ── */}
      {fotoFullscreen && fotos.length > 0 && (
        <div
          onClick={() => setFotoFullscreen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            backgroundColor: 'rgba(0,0,0,0.95)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
          }}
        >
          <img
            src={fotos[fotoActual].url_publica}
            alt={fotos[fotoActual].descripcion_imagen || sitio.nombre_reporte}
            style={{ maxWidth: '95vw', maxHeight: '95vh', objectFit: 'contain' }}
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setFotoFullscreen(false)}
            style={{
              position: 'absolute', top: 16, right: 20,
              background: 'none', border: 'none', color: 'white',
              fontSize: 32, cursor: 'pointer', opacity: 0.8,
            }}
          >×</button>
        </div>
      )}

      {/* Modal solicitud contacto */}
      {mostrarSolicitud && (
        <SolicitarContactoModal
          idSitio={idSitio}
          nombreSitio={sitio.nombre_reporte}
          onClose={() => setMostrarSolicitud(false)}
        />
      )}
    </>
  )
}
