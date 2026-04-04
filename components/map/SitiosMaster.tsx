'use client'

import { useEffect, useRef, useState } from 'react'
import { Marker, Popup } from 'react-leaflet'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { puedeVerSitio, puedeVerCoordenadasExactas } from '@/lib/utils/accesibilidad'
import { iconoArqueologico, areaB, areaC } from '@/components/map/IconosCapas'

interface SitioMaster {
  id_sitio: string
  nombre_sitio: string
  latitud: number
  longitud: number
  region: string | null
  comuna: string | null
  categoria_general: string | null
  categoria_sitio: string | null
  tipologias: string[] | null
  codigo_accesibilidad: 'A' | 'B' | 'C'
  imagen_principal: string | null
}

function desplazarCoordenada(lat: number, lng: number, radioMetros: number): [number, number] {
  const radioGrados = radioMetros / 111320
  const angulo = Math.random() * 2 * Math.PI
  const distancia = Math.random() * radioGrados
  return [
    lat + distancia * Math.cos(angulo),
    lng + distancia * Math.sin(angulo) / Math.cos((lat * Math.PI) / 180),
  ]
}

interface Props {
  zoomActual: number
  onSeleccionar: (id: string) => void
}

export function SitiosMaster({ zoomActual, onSeleccionar }: Props) {
  const { usuario } = useAuth()
  const [sitios, setSitios] = useState<SitioMaster[]>([])
  const coordsDesplazadasRef = useRef<Record<string, [number, number]>>({})
  const supabase = createClient()

  function getCoordsDesplazadas(sitio: SitioMaster): [number, number] {
    if (!coordsDesplazadasRef.current[sitio.id_sitio]) {
      coordsDesplazadasRef.current[sitio.id_sitio] = desplazarCoordenada(sitio.latitud, sitio.longitud, 300)
    }
    return coordsDesplazadasRef.current[sitio.id_sitio]
  }

  useEffect(() => {
    async function fetchSitios() {
      const { data: sitiosData, error } = await supabase
        .from('sitios_master')
        .select('id_sitio, nombre_sitio, latitud, longitud, region, comuna, categoria_general, categoria_sitio, tipologias, codigo_accesibilidad')
        .eq('estado_validacion', 'verde')
        .order('nombre_sitio')
      if (error) { console.error('SitiosMaster fetch error:', error); return }

      const rolUsuario = (usuario?.rol as 'publico' | 'experto' | 'partner' | 'founder') || null
      const filtrados = (sitiosData || []).filter(s =>
        puedeVerSitio(s.codigo_accesibilidad as 'A' | 'B' | 'C', rolUsuario)
      )

      const ids = filtrados.map(s => s.id_sitio)
      let imagenesPorSitio: Record<string, string> = {}

      if (ids.length > 0) {
        const { data: mediosData } = await supabase
          .from('medios')
          .select('id_sitio, url_publica, tipo_medio')
          .in('id_sitio', ids)
          .eq('tipo_medio', 'foto')
          .eq('prioridad_visualizacion', 1)

        for (const m of mediosData || []) {
          imagenesPorSitio[m.id_sitio] = m.url_publica
        }
      }

      setSitios(filtrados.map(s => ({
        ...s,
        imagen_principal: imagenesPorSitio[s.id_sitio] ?? null
      })))
    }
    fetchSitios()
  }, [usuario])

  const rolUsuario = (usuario?.rol as 'publico' | 'experto' | 'partner' | 'founder') || null

  return (
    <>
      {sitios.map(sitio => {
        const codigo = sitio.codigo_accesibilidad
        const verExacto = puedeVerCoordenadasExactas(codigo, rolUsuario)
        const coords: [number, number] = verExacto
          ? [sitio.latitud, sitio.longitud]
          : getCoordsDesplazadas(sitio)

        const tipologias: string[] = sitio.tipologias ?? []
        const necesitaSolicitar =
          (codigo === 'B' && rolUsuario === 'publico') ||
          (codigo === 'C' && ['experto', 'partner', 'founder'].includes(rolUsuario || ''))

        const googleMapsUrl = `https://www.google.com/maps?q=${sitio.latitud},${sitio.longitud}`

        const popup = (
          <div style={{ width: '272px', fontFamily: 'inherit' }}>
            <div style={{ display: 'flex', gap: '10px', padding: '14px 14px 10px 14px', alignItems: 'flex-start' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '8px', backgroundColor: '#e5e7eb', flexShrink: 0, overflow: 'hidden' }}>
                {sitio.imagen_principal ? (
                  <img
                    src={sitio.imagen_principal}
                    alt={sitio.nombre_sitio}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>🏺</div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: '14px', color: '#111827', lineHeight: '1.35', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '4px' }}>
                  {sitio.nombre_sitio}
                </p>
                <p style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span>📍</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sitio.comuna}</span>
                </p>
                {!verExacto && (
                  <p style={{ fontSize: '10px', color: '#d97706', marginTop: '3px' }}>Ubicación aproximada</p>
                )}
              </div>
            </div>

            {(sitio.categoria_general || tipologias.length > 0) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', padding: '0 14px 10px 14px' }}>
                {sitio.categoria_general && (
                  <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', backgroundColor: '#e6f0ef', color: '#10454B', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                    {sitio.categoria_general}
                  </span>
                )}
                {tipologias.slice(0, 2).map((tip, i) => (
                  <span key={i} style={{ fontSize: '10px', fontWeight: 500, padding: '2px 8px', borderRadius: '999px', backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                    {tip}
                  </span>
                ))}
                {tipologias.length > 2 && (
                  <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '999px', backgroundColor: '#f3f4f6', color: '#6b7280' }}>+{tipologias.length - 2}</span>
                )}
              </div>
            )}

            <div style={{ height: '1px', backgroundColor: '#f3f4f6', margin: '0 0 10px 0' }} />

            <div style={{ padding: '0 14px 14px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => onSeleccionar(sitio.id_sitio)}
                style={{ width: '100%', padding: '8px 0', backgroundColor: '#10454B', color: '#B6875D', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'background-color 0.15s', letterSpacing: '0.02em' }}
                onMouseOver={e => (e.currentTarget.style.backgroundColor = '#0b3237')}
                onMouseOut={e => (e.currentTarget.style.backgroundColor = '#10454B')}
              >
                {necesitaSolicitar ? <><span>📨</span> Solicitar info de contacto</> : <><span>📄</span> Ver ficha</>}
              </button>

              {verExacto && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ width: '100%', padding: '7px 0', backgroundColor: 'white', color: '#10454B', border: '1.5px solid #10454B', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', letterSpacing: '0.02em', textDecoration: 'none' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Abrir en Google Maps
                </a>
              )}
            </div>
          </div>
        )

        if (codigo === 'A') {
          return <Marker key={sitio.id_sitio} position={coords} icon={iconoArqueologico}><Popup>{popup}</Popup></Marker>
        }
        if (verExacto) {
          return <Marker key={sitio.id_sitio} position={coords} icon={iconoArqueologico}><Popup>{popup}</Popup></Marker>
        }
        if (zoomActual >= 16) return null
        if (zoomActual >= 10) {
          return <Marker key={sitio.id_sitio} position={coords} icon={codigo === 'B' ? areaB : areaC}><Popup>{popup}</Popup></Marker>
        }
        return <Marker key={sitio.id_sitio} position={coords} icon={iconoArqueologico}><Popup>{popup}</Popup></Marker>
      })}
    </>
  )
}
