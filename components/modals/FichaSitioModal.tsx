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

interface LinkMedio {
  id_medio: string
  url_publica: string
  titulo: string | null
  tipo_medio: string
}

interface Publicacion {
  id_publicacion: string
  titulo: string
  autor: string | null
  año: number | null
  url_pdf: string
}

// ── Vista normalizada común para ambas tablas ──────────────────────────────
interface SitioNormalizado {
  id: string
  nombre: string
  descripcion: string | null
  latitud: number
  longitud: number
  region: string | null
  comuna: string | null
  categoria_general: string | null
  tipologias: string[] | null
  cultura_asociada: string | null
  periodo_cronologico: string | null
  estado_conservacion: string | null
  codigo_accesibilidad: string
  origen: 'master' | 'reporte'
}

interface FichaSitioModalProps {
  idSitio: string
  origen: 'master' | 'reporte'
  onClose: () => void
}

export function FichaSitioModal({ idSitio, origen, onClose }: FichaSitioModalProps) {
  const { usuario } = useAuth()
  const [sitio, setSitio] = useState<SitioNormalizado | null>(null)
  const [fotos, setFotos] = useState<Foto[]>([])
  const [link360, setLink360] = useState<string | null>(null)
  const [linksVideo, setLinksVideo] = useState<LinkMedio[]>([])
  const [links3d, setLinks3d] = useState<LinkMedio[]>([])
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([])
  const [fotoActual, setFotoActual] = useState(0)
  const [loading, setLoading] = useState(true)
  const [mostrarSolicitud, setMostrarSolicitud] = useState(false)
  const [fotoFullscreen, setFotoFullscreen] = useState(false)
  const [modal360Abierto, setModal360Abierto] = useState(false)

  useEffect(() => { cargarDatos() }, [idSitio, origen])

  async function cargarDatos() {
    setLoading(true)
    try {
      // ── 1. Datos del sitio según origen ──────────────────────────────────
      if (origen === 'master') {
        const { data, error } = await supabase
          .from('sitios_master')
          .select('id_sitio, nombre_sitio, descripcion_breve, latitud, longitud, region, comuna, categoria_general, tipologias, cultura_asociada, cronologia_general, estado_conservacion, codigo_accesibilidad')
          .eq('id_sitio', idSitio)
          .single()
        if (error) throw error
        setSitio({
          id: data.id_sitio,
          nombre: data.nombre_sitio,
          descripcion: data.descripcion_breve,
          latitud: data.latitud,
          longitud: data.longitud,
          region: data.region,
          comuna: data.comuna,
          categoria_general: data.categoria_general,
          tipologias: data.tipologias,
          cultura_asociada: data.cultura_asociada,
          periodo_cronologico: data.cronologia_general,
          estado_conservacion: data.estado_conservacion,
          codigo_accesibilidad: data.codigo_accesibilidad ?? 'B',
          origen: 'master',
        })
      } else {
        const { data, error } = await supabase
          .from('reportes_nuevos')
          .select('id_reporte, nombre_reporte, descripcion_ubicacion, latitud, longitud, region, comuna, categoria_general, tipologia_especifica, cultura_asociada, periodo_cronologico, estado_conservacion, codigo_accesibilidad')
          .eq('id_reporte', idSitio)
          .single()
        if (error) throw error
        setSitio({
          id: data.id_reporte,
          nombre: data.nombre_reporte,
          descripcion: data.descripcion_ubicacion,
          latitud: data.latitud,
          longitud: data.longitud,
          region: data.region,
          comuna: data.comuna,
          categoria_general: data.categoria_general,
          tipologias: data.tipologia_especifica,
          cultura_asociada: data.cultura_asociada,
          periodo_cronologico: data.periodo_cronologico,
          estado_conservacion: data.estado_conservacion,
          codigo_accesibilidad: data.codigo_accesibilidad ?? 'B',
          origen: 'reporte',
        })
      }

      // ── 2. Medios ─────────────────────────────────────────────────────────
      // master → tabla medios (id_sitio)
      // reporte → tabla reportes_medios (id_reporte), fallback a medios si vacío
      let mediosData: any[] = []

      if (origen === 'master') {
        const { data } = await supabase
          .from('medios')
          .select('id_medio, url_publica, descripcion_imagen, tipo_medio, titulo')
          .eq('id_sitio', idSitio)
          .order('prioridad_visualizacion', { ascending: false })
        mediosData = data ?? []
      } else {
        const { data } = await supabase
          .from('reportes_medios')
          .select('id_medio, url_publica, descripcion_imagen, tipo_medio, titulo')
          .eq('id_reporte', idSitio)
          .order('prioridad_visualizacion', { ascending: false })
        mediosData = data ?? []
        // Fallback: si el reporte no tiene medios propios, buscar en medios via id_reporte
        if (mediosData.length === 0) {
          const { data: fallback } = await supabase
            .from('medios')
            .select('id_medio, url_publica, descripcion_imagen, tipo_medio, titulo')
            .eq('id_reporte', idSitio)
            .order('prioridad_visualizacion', { ascending: false })
          mediosData = fallback ?? []
        }
      }

      setFotos(mediosData.filter(m => !m.tipo_medio || m.tipo_medio === 'foto'))
      setLink360(mediosData.find(m => m.tipo_medio === 'link_360')?.url_publica ?? null)
      setLinksVideo(mediosData.filter(m => m.tipo_medio === 'link_video'))
      setLinks3d(mediosData.filter(m => m.tipo_medio === 'link_3d'))

      // ── 3. Publicaciones ──────────────────────────────────────────────────
      const campoId = origen === 'master' ? 'id_sitio' : 'id_reporte'
      const { data: pubData } = await supabase
        .from('sitios_publicaciones')
        .select('publicaciones(id_publicacion, titulo, autor, año, url_pdf)')
        .eq(campoId, idSitio)
      if (pubData) {
        setPublicaciones(
          pubData.map((r: any) => r.publicaciones).filter(Boolean).flat() as Publicacion[]
        )
      }

    } catch (err) {
      console.error('Error cargando ficha:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleCompartir() {
    const url = `${window.location.origin}/mapa?sitio=${idSitio}&origen=${origen}`
    if (navigator.share) {
      navigator.share({ title: sitio?.nombre, text: `${sitio?.nombre} - Red Patrimonio Chile`, url })
    } else {
      navigator.clipboard.writeText(url)
      alert('Link copiado al portapapeles')
    }
  }

  function prevFoto() { setFotoActual(i => (i - 1 + fotos.length) % fotos.length) }
  function nextFoto() { setFotoActual(i => (i + 1) % fotos.length) }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
        <div className="flex flex-col items-center gap-3">
          <div style={{ width: 40, height: 40, borderWidth: '3px', borderStyle: 'solid', borderColor: '#B6875D', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />
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
    { label: 'Tipología', value: sitio.tipologias?.join(' · ') },
    { label: 'Cultura', value: sitio.cultura_asociada },
    { label: 'Período', value: sitio.periodo_cronologico },
    { label: 'Conservación', value: sitio.estado_conservacion },
    ...(puedeVerCoordenadas ? [{ label: 'Coordenadas', value: `${sitio.latitud.toFixed(6)}, ${sitio.longitud.toFixed(6)}` }] : []),
  ].filter(d => d.value)

  const hayMultimedia = linksVideo.length > 0 || links3d.length > 0

  // Badge de origen
  const badgeOrigen = origen === 'reporte'
    ? { label: 'Reporte comunitario', color: '#92400e', bg: '#fef3c7' }
    : { label: 'Sitio validado', color: '#065f46', bg: '#d1fae5' }

  return (
    <>
      <style>{`
        .leaflet-popup-content-wrapper {
          padding: 0 !important;
          border-radius: 14px !important;
          box-shadow: 0 8px 28px rgba(0,0,0,0.14) !important;
          border: none !important;
          overflow: hidden;
        }
        .leaflet-popup-content { margin: 0 !important; width: auto !important; }
        .leaflet-popup-tip-container { margin-top: -1px; }
        .leaflet-popup-tip { box-shadow: none !important; background: white !important; }
        .leaflet-popup-close-button {
          top: 6px !important; right: 8px !important;
          color: #9ca3af !important; font-size: 18px !important; z-index: 10;
        }
        .leaflet-popup-close-button:hover { color: #374151 !important; }
      `}</style>

      <div
        className="fixed inset-0 z-[1000]"
        style={{ backgroundColor: 'rgba(0,0,0,0.72)' }}
        onClick={onClose}
      >
        <div
          className="absolute inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center md:p-6"
          onClick={e => e.stopPropagation()}
        >
          <div
            className="relative bg-white w-full md:max-w-2xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: 'calc(100vh - 56px)' }}
          >

            {/* ══ ZONA FOTOS ══ */}
            <div className="relative w-full flex-shrink-0 bg-black" style={{ maxHeight: '50vh' }}>
              {fotos.length > 0 ? (
                <>
                  <img
                    src={fotos[fotoActual].url_publica}
                    alt={fotos[fotoActual].descripcion_imagen || sitio.nombre}
                    style={{ width: '100%', maxHeight: '50vh', objectFit: 'contain', display: 'block' }}
                  />
                  {fotos.length > 1 && (
                    <>
                      <button onClick={prevFoto} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', color: 'white', border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>‹</button>
                      <button onClick={nextFoto} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', color: 'white', border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>›</button>
                    </>
                  )}
                  <button
                    onClick={() => setFotoFullscreen(true)}
                    title="Ver a pantalla completa"
                    style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: 8, padding: '6px 7px', cursor: 'pointer', lineHeight: 0 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                  </button>
                  {fotos.length > 1 && (
                    <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
                      {fotos.map((_, idx) => (
                        <button key={idx} onClick={() => setFotoActual(idx)}
                          style={{ width: idx === fotoActual ? 20 : 7, height: 7, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.2s', backgroundColor: idx === fotoActual ? '#B6875D' : 'rgba(255,255,255,0.55)' }} />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ fontSize: 48, opacity: 0.35 }}>🏺</span>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Sin fotografías</p>
                </div>
              )}
              <button
                onClick={onClose}
                style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', color: 'white', fontSize: 20, lineHeight: 1.3, fontWeight: 300 }}
              >×</button>
            </div>

            {/* ── Contenido scrolleable ── */}
            <div className="overflow-y-auto flex-1" style={{ paddingBottom: '84px' }}>

              {/* Título + badge origen + 360° */}
              <div style={{ padding: '20px 24px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#10454B', lineHeight: 1.25, marginBottom: 6 }}>
                    {sitio.nombre}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <p style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 500 }}>
                      {sitio.comuna}{sitio.region ? ` · ${sitio.region}` : ''}
                    </p>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: 999, backgroundColor: badgeOrigen.bg, color: badgeOrigen.color, letterSpacing: '0.04em' }}>
                      {badgeOrigen.label}
                    </span>
                  </div>
                </div>
                {link360 && (
                  <button
                    onClick={() => setModal360Abierto(true)}
                    title="Ver tour 360°"
                    style={{ flexShrink: 0, marginTop: 2, background: 'none', border: '1.5px solid #6b7280', borderRadius: 8, padding: '4px 8px', cursor: 'pointer', color: '#374151', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', lineHeight: 1.4 }}
                  >
                    360°
                  </button>
                )}
              </div>

              {/* Datos técnicos */}
              {datosTecnicos.length > 0 && (
                <div style={{ backgroundColor: '#f8f7f5', padding: '16px 24px', borderTop: '1px solid #ede9e3', borderBottom: '1px solid #ede9e3' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: '#10454B', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Datos técnicos</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 16px' }}>
                    {datosTecnicos.map(d => (
                      <div key={d.label}>
                        <p style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{d.label}</p>
                        <p style={{ fontSize: '13px', color: '#1f2937', fontWeight: 500, lineHeight: 1.4 }}>{d.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Descripción */}
              {sitio.descripcion && (
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: '#10454B', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Descripción</p>
                  <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.65 }}>{sitio.descripcion}</p>
                </div>
              )}

              {/* Publicaciones */}
              {publicaciones.length > 0 && (
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: '#10454B', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Publicaciones</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {publicaciones.map(pub => (
                      <div key={pub.id_publicacion} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', backgroundColor: '#f8f7f5', borderRadius: 10, border: '1px solid #ede9e3' }}>
                        <div style={{ flexShrink: 0, width: 36, height: 36, backgroundColor: '#10454B', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B6875D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                          </svg>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937', lineHeight: 1.3, marginBottom: 2 }} className="truncate">{pub.titulo}</p>
                          {(pub.autor || pub.año) && (
                            <p style={{ fontSize: '11px', color: '#9ca3af' }}>{[pub.autor, pub.año].filter(Boolean).join(', ')}</p>
                          )}
                        </div>
                        <a href={pub.url_pdf} target="_blank" rel="noopener noreferrer"
                          style={{ flexShrink: 0, padding: 6, borderRadius: 6, border: '1px solid #d1d5db', display: 'flex', alignItems: 'center', color: '#6b7280', textDecoration: 'none' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Multimedia */}
              {hayMultimedia && (
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: '#10454B', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Multimedia</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {[...linksVideo, ...links3d].map(lm => (
                      <a key={lm.id_medio} href={lm.url_publica} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', backgroundColor: '#f8f7f5', border: '1px solid #ede9e3', borderRadius: 8, fontSize: '13px', fontWeight: 600, color: '#10454B', textDecoration: 'none' }}>
                        {lm.tipo_medio === 'link_video'
                          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
                        }
                        {lm.titulo || (lm.tipo_medio === 'link_video' ? 'Ver video' : 'Modelo 3D')}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Info contacto */}
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
                {puedeVerInfoContacto ? (
                  <InfoContactoDisplay idSitio={idSitio} />
                ) : (
                  <button
                    onClick={() => setMostrarSolicitud(true)}
                    style={{ width: '100%', padding: '11px 0', backgroundColor: '#10454B', color: '#B6875D', border: 'none', borderRadius: 10, fontSize: '14px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.02em' }}
                  >
                    📨 Solicitar información de contacto
                  </button>
                )}
              </div>

              {/* Compartir */}
              <div style={{ padding: '12px 24px 20px' }}>
                <button
                  onClick={handleCompartir}
                  style={{ width: '100%', padding: '10px 0', backgroundColor: 'white', color: '#10454B', border: '1.5px solid #10454B', borderRadius: 10, fontSize: '13px', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.02em' }}
                >
                  Compartir sitio
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Modal 360° */}
      {modal360Abierto && link360 && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', paddingTop: '56px' }}>
          <div style={{ height: '10%', display: 'flex', alignItems: 'center', paddingLeft: 20 }}>
            <button onClick={() => setModal360Abierto(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: 28, cursor: 'pointer', fontWeight: 300, lineHeight: 1, padding: '4px 8px' }}>‹</button>
          </div>
          <div style={{ height: '80%', width: '100%' }}>
            <iframe src={link360} style={{ width: '100%', height: '100%', border: 'none', display: 'block' }} allowFullScreen title="Tour 360°" />
          </div>
          <div style={{ height: '10%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>© RedPatrimonio 2026</p>
          </div>
        </div>
      )}

      {/* Fullscreen foto */}
      {fotoFullscreen && fotos.length > 0 && (
        <div onClick={() => setFotoFullscreen(false)} style={{ position: 'fixed', inset: 0, zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
          <img src={fotos[fotoActual].url_publica} alt={fotos[fotoActual].descripcion_imagen || sitio.nombre}
            style={{ maxWidth: '95vw', maxHeight: '95vh', objectFit: 'contain' }}
            onClick={e => e.stopPropagation()} />
          <button onClick={() => setFotoFullscreen(false)} style={{ position: 'absolute', top: 16, right: 20, background: 'none', border: 'none', color: 'white', fontSize: 32, cursor: 'pointer', opacity: 0.8 }}>×</button>
        </div>
      )}

      {mostrarSolicitud && (
        <SolicitarContactoModal
          idSitio={idSitio}
          nombreSitio={sitio.nombre}
          onClose={() => setMostrarSolicitud(false)}
        />
      )}
    </>
  )
}
