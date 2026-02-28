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
}

interface FichaSitioModalProps {
  idSitio: string
  onClose: () => void
}

export function FichaSitioModal({ idSitio, onClose }: FichaSitioModalProps) {
  const { usuario } = useAuth()
  const [sitio, setSitio] = useState<SitioCompleto | null>(null)
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

  useEffect(() => { cargarDatos() }, [idSitio])

  async function cargarDatos() {
    try {
      const { data: sitioData, error: sitioError } = await supabase
        .from('reportes_nuevos')
        .select('*')
        .eq('id_reporte', idSitio)
        .single()
      if (sitioError) throw sitioError
      setSitio(sitioData as any)

      // Medios — separar por tipo
      const { data: mediosData } = await supabase
        .from('reportes_medios')
        .select('id_medio, url_publica, descripcion_imagen, tipo_medio, titulo')
        .eq('id_reporte', idSitio)
        .order('prioridad_visualizacion', { ascending: false })

      if (mediosData && mediosData.length > 0) {
        const soloFotos = mediosData.filter(
          m => !m.tipo_medio || m.tipo_medio === 'foto' || m.tipo_medio === 'video'
        )
        setFotos(soloFotos)

        const m360 = mediosData.find(m => m.tipo_medio === 'link_360')
        setLink360(m360?.url_publica || null)

        setLinksVideo(mediosData.filter(m => m.tipo_medio === 'link_video') as LinkMedio[])
        setLinks3d(mediosData.filter(m => m.tipo_medio === 'link_3d') as LinkMedio[])
      } else {
        // Fallback a medios de sitios_master
        const { data: mediosMaster } = await supabase
          .from('medios')
          .select('id_medio, url_publica, descripcion_imagen, tipo_medio, titulo')
          .eq('id_sitio', idSitio)
          .order('prioridad_visualizacion', { ascending: false })

        if (mediosMaster) {
          setFotos(mediosMaster.filter(m => !m.tipo_medio || m.tipo_medio === 'foto'))
          const m360 = mediosMaster.find(m => m.tipo_medio === 'link_360')
          setLink360(m360?.url_publica || null)
          setLinksVideo(mediosMaster.filter(m => m.tipo_medio === 'link_video') as LinkMedio[])
          setLinks3d(mediosMaster.filter(m => m.tipo_medio === 'link_3d') as LinkMedio[])
        }
      }

      // Publicaciones vía tabla relacional
      const { data: pubData } = await supabase
        .from('sitios_publicaciones')
        .select('publicaciones(id_publicacion, titulo, autor, año, url_pdf)')
        .eq('id_reporte', idSitio)

      if (pubData) {
        const pubs = pubData
          .map((r: any) => r.publicaciones)
          .filter(Boolean)
          .flat() as Publicacion[]
        setPublicaciones(pubs)
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
    { label: 'Tipología', value: sitio.tipologia_especifica?.join(' · ') },
    { label: 'Cultura', value: sitio.cultura_asociada },
    { label: 'Período', value: sitio.periodo_cronologico },
    { label: 'Conservación', value: sitio.estado_conservacion },
    ...(puedeVerCoordenadas ? [{ label: 'Coordenadas', value: `${sitio.latitud.toFixed(6)}, ${sitio.longitud.toFixed(6)}` }] : []),
  ].filter(d => d.value)

  const hayMultimedia = linksVideo.length > 0 || links3d.length > 0

  return (
    <>
      {/* ── Backdrop ── */}
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
                    alt={fotos[fotoActual].descripcion_imagen || sitio.nombre_reporte}
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
                        <button
                          key={idx}
                          onClick={() => setFotoActual(idx)}
                          style={{ width: idx === fotoActual ? 20 : 7, height: 7, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.2s', backgroundColor: idx === fotoActual ? '#B6875D' : 'rgba(255,255,255,0.55)' }}
                        />
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

              {/* Título + ícono 360° */}
              <div style={{ padding: '20px 24px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#10454B', lineHeight: 1.25, marginBottom: 4 }}>
                    {sitio.nombre_reporte}
                  </h2>
                  <p style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 500, letterSpacing: '0.02em' }}>
                    {sitio.comuna}{sitio.region ? ` · ${sitio.region}` : ''}
                  </p>
                </div>
                {link360 && (
                  <button
                    onClick={() => setModal360Abierto(true)}
                    title="Ver tour 360°"
                    style={{
                      flexShrink: 0,
                      marginTop: 2,
                      background: 'none',
                      border: '1.5px solid #6b7280',
                      borderRadius: 8,
                      padding: '4px 8px',
                      cursor: 'pointer',
                      color: '#374151',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      lineHeight: 1.4,
                    }}
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
              {sitio.descripcion_ubicacion && (
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: '#10454B', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Descripción</p>
                  <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.65 }}>{sitio.descripcion_ubicacion}</p>
                </div>
              )}

              {/* ══ PUBLICACIONES ══ */}
              {publicaciones.length > 0 && (
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: '#10454B', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Publicaciones</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {publicaciones.map(pub => (
                      <div
                        key={pub.id_publicacion}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', backgroundColor: '#f8f7f5', borderRadius: 10, border: '1px solid #ede9e3' }}
                      >
                        {/* Ícono PDF */}
                        <div style={{ flexShrink: 0, width: 36, height: 36, backgroundColor: '#10454B', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B6875D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                          </svg>
                        </div>
                        {/* Título + Autor/Año */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937', lineHeight: 1.3, marginBottom: 2 }} className="truncate">
                            {pub.titulo}
                          </p>
                          {(pub.autor || pub.año) && (
                            <p style={{ fontSize: '11px', color: '#9ca3af', lineHeight: 1.3 }}>
                              {[pub.autor, pub.año].filter(Boolean).join(', ')}
                            </p>
                          )}
                        </div>
                        {/* Descarga */}
                        <a
                          href={pub.url_pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Descargar PDF"
                          style={{ flexShrink: 0, padding: 6, borderRadius: 6, border: '1px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', textDecoration: 'none' }}
                        >
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

              {/* ══ MULTIMEDIA (links externos) ══ */}
              {hayMultimedia && (
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: '#10454B', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Multimedia</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {linksVideo.map(lv => (
                      <a
                        key={lv.id_medio}
                        href={lv.url_publica}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', backgroundColor: '#f8f7f5', border: '1px solid #ede9e3', borderRadius: 8, fontSize: '13px', fontWeight: 600, color: '#10454B', textDecoration: 'none', cursor: 'pointer' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        {lv.titulo || 'Ver video'}
                      </a>
                    ))}
                    {links3d.map(l3 => (
                      <a
                        key={l3.id_medio}
                        href={l3.url_publica}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', backgroundColor: '#f8f7f5', border: '1px solid #ede9e3', borderRadius: 8, fontSize: '13px', fontWeight: 600, color: '#10454B', textDecoration: 'none', cursor: 'pointer' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        </svg>
                        {l3.titulo || 'Modelo 3D'}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Info contacto / solicitar */}
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

      {/* ══ MODAL 360° ══ */}
      {modal360Abierto && link360 && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 3000,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            flexDirection: 'column',
            paddingTop: '56px', // navbar height
          }}
        >
          {/* Franja superior 10% — botón volver */}
          <div style={{ height: '10%', display: 'flex', alignItems: 'center', paddingLeft: 20 }}>
            <button
              onClick={() => setModal360Abierto(false)}
              style={{ background: 'none', border: 'none', color: 'white', fontSize: 28, cursor: 'pointer', fontWeight: 300, lineHeight: 1, padding: '4px 8px' }}
              title="Volver"
            >
              ‹
            </button>
          </div>

          {/* Iframe 80% */}
          <div style={{ height: '80%', width: '100%' }}>
            <iframe
              src={link360}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              allowFullScreen
              title="Tour 360°"
            />
          </div>

          {/* Franja inferior 10% — copyright */}
          <div style={{ height: '10%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, letterSpacing: '0.04em' }}>
              © RedPatrimonio 2026
            </p>
          </div>
        </div>
      )}

      {/* ── Fullscreen foto ── */}
      {fotoFullscreen && fotos.length > 0 && (
        <div
          onClick={() => setFotoFullscreen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}
        >
          <img
            src={fotos[fotoActual].url_publica}
            alt={fotos[fotoActual].descripcion_imagen || sitio.nombre_reporte}
            style={{ maxWidth: '95vw', maxHeight: '95vh', objectFit: 'contain' }}
            onClick={e => e.stopPropagation()}
          />
          <button onClick={() => setFotoFullscreen(false)} style={{ position: 'absolute', top: 16, right: 20, background: 'none', border: 'none', color: 'white', fontSize: 32, cursor: 'pointer', opacity: 0.8 }}>×</button>
        </div>
      )}

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
