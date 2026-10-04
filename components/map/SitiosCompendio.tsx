'use client'

import { useEffect, useState } from 'react'
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { createClient } from '@/lib/supabase/client'

interface SitioCompendioRow {
  id: string
  nombre_sitio: string
  latitud: number
  longitud: number
  region: string | null
  comuna: string | null
  localidad_sector: string | null
  descripcion_breve: string | null
  descripcion_detallada: string | null
  categoria_general: string | null
  tipologia_especifica: string[] | null
  cultura_asociada: string | null
  periodo_cronologico: string | null
  fuente_principal: string | null
  autor_original: string | null
  titulo_obra: string | null
  anio_publicacion: number | null
  institucion_editora: string | null
  compilador_digital: string | null
  url_portada: string | null
  compendio_slug: string
}

interface Props {
  compendiosActivos: string[]
  onSeleccionar?: (id: string) => void
  onSelectSitio?: (id: string, origen: 'compendio') => void
  zoomActual?: number
}

function crearIconoCompendio(): L.DivIcon {
  const html = `
    <div style="
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #78350f;
      border: 2px solid #fef3c7;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
      cursor: pointer;
    ">
      <span style="font-size: 15px; line-height: 1;">🏺</span>
    </div>
  `
  return L.divIcon({
    html,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  })
}

export function SitiosCompendio({ compendiosActivos, onSeleccionar, onSelectSitio, zoomActual }: Props) {
  const [sitios, setSitios] = useState<SitioCompendioRow[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleAbrirFicha = (id: string) => {
    if (onSeleccionar) {
      onSeleccionar(id)
    } else if (onSelectSitio) {
      onSelectSitio(id, 'compendio')
    }
  }

  useEffect(() => {
    if (compendiosActivos.length === 0) {
      setSitios([])
      return
    }

    async function cargarSitiosCompendio() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('sitios_compendio')
          .select(`
            id,
            nombre_sitio,
            latitud,
            longitud,
            region,
            comuna,
            localidad_sector,
            descripcion_breve,
            descripcion_detallada,
            categoria_general,
            tipologia_especifica,
            cultura_asociada,
            periodo_cronologico,
            fuente_principal,
            autor_original,
            titulo_obra,
            anio_publicacion,
            institucion_editora,
            compilador_digital,
            url_portada,
            compendio_slug
          `)
          .in('compendio_slug', compendiosActivos)

        if (error) throw error
        setSitios(data ?? [])
      } catch (err) {
        console.error('Error cargando sitios de compendio:', err)
      } finally {
        setLoading(false)
      }
    }

    cargarSitiosCompendio()
  }, [compendiosActivos])

  if (sitios.length === 0) return null

  const icono = crearIconoCompendio()

  return (
    <>
      {sitios.map(s => {
        const googleMapsUrl = `https://www.google.com/maps?q=${s.latitud},${s.longitud}&t=k`

        return (
          <Marker
            key={s.id}
            position={[s.latitud, s.longitud]}
            icon={icono}
          >
            <Popup maxWidth={380} minWidth={320}>
              <div
                style={{
                  width: '330px',
                  maxWidth: '85vw',
                  padding: '16px 18px',
                  fontFamily: 'inherit',
                  maxHeight: '440px',
                  overflowY: 'auto',
                }}
              >
                {/* ── TOP: Miniatura sello + Título + Ubicación ── */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '52px',
                      backgroundColor: '#f3ece3',
                      border: '1px solid #d4c5b3',
                      borderRadius: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>🏺</span>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: '#78716c', marginTop: '2px' }}>1975</span>
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '15px',
                        fontWeight: 700,
                        color: '#10454B',
                        lineHeight: 1.25,
                      }}
                    >
                      {s.nombre_sitio}
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: '#dc2626', fontSize: '13px' }}>📍</span>
                      <span>{[s.comuna, s.region].filter(Boolean).join(' · ')}</span>
                    </p>
                  </div>
                </div>

                {/* ── BODY ── */}
                {s.localidad_sector && (
                  <p style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, margin: '0 0 6px 0' }}>
                    Sector: {s.localidad_sector}
                  </p>
                )}

                {s.descripcion_breve && (
                  <p
                    style={{
                      fontSize: '12px',
                      color: '#374151',
                      fontWeight: 600,
                      fontStyle: 'italic',
                      margin: '0 0 6px 0',
                      lineHeight: 1.35,
                    }}
                  >
                    {s.descripcion_breve}
                  </p>
                )}

                {s.descripcion_detallada && s.descripcion_detallada !== s.descripcion_breve && (
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#4b5563',
                      margin: '0 0 8px 0',
                      lineHeight: 1.45,
                      maxHeight: '90px',
                      overflowY: 'auto',
                      padding: '6px 8px',
                      backgroundColor: '#f9f8f5',
                      borderRadius: '6px',
                      border: '1px solid #ede9e3',
                    }}
                  >
                    {s.descripcion_detallada}
                  </div>
                )}

                {/* Fuente Principal */}
                {s.fuente_principal && (
                  <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 8px 0', lineHeight: 1.3 }}>
                    <strong style={{ color: '#374151' }}>Fuente:</strong> {s.fuente_principal}
                  </p>
                )}

                {/* Tipologías */}
                {s.tipologia_especifica && s.tipologia_especifica.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                    {s.tipologia_especifica.map((t, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: '#f3f4f6',
                          color: '#4b5563',
                          fontWeight: 500,
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Caja de créditos regularizada */}
                <div
                  style={{
                    padding: '8px 10px',
                    backgroundColor: '#f9f8f5',
                    border: '1px solid #e5e3df',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#4b5563',
                    lineHeight: 1.4,
                    marginBottom: '12px',
                  }}
                >
                  <p style={{ margin: '0 0 2px 0' }}>
                    <strong>Autor:</strong> {s.autor_original || 'Rubén Stehberg'}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Compilación:</strong> {s.compilador_digital || 'Carlos Verdugo Rotella'}
                  </p>
                </div>

                {/* ── BOTTOM: Botones de Acción ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => handleAbrirFicha(s.id)}
                    style={{
                      width: '100%',
                      padding: '9px 0',
                      backgroundColor: '#10454B',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      letterSpacing: '0.02em',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    Ver Ficha
                  </button>

                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 0',
                      backgroundColor: 'white',
                      color: '#10454B',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      border: '1.5px solid #10454B',
                    }}
                  >
                    Abrir en Google Maps
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </>
  )
}
