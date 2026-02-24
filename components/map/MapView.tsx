'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { FichaSitioModal } from '@/components/modals/FichaSitioModal'
import { puedeVerSitio, puedeVerCoordenadasExactas } from '@/lib/utils/accesibilidad'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: '',
})

interface SitioMapa {
  id_reporte: string
  nombre_reporte: string
  latitud: number
  longitud: number
  region: string
  comuna: string
  categoria_general: string | null
  categoria_sitio: string | null
  tipologia_especifica: string[] | null
  imagen_url: string | null
  codigo_accesibilidad: 'A' | 'B' | 'C'
}

function crearIconoPin(color: string): L.DivIcon {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="23" height="35">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24S24 21 24 12C24 5.373 18.627 0 12 0z"
      fill="${color}" stroke="white" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="4.5"
      fill="white" fill-opacity="0.55" stroke="white" stroke-width="1"/>
  </svg>`
  return L.divIcon({
    className: '',
    html: svg,
    iconSize: [23, 35],
    iconAnchor: [11, 35],
    popupAnchor: [0, -36],
  })
}

function crearIconoArea(color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="width:30px;height:30px;border-radius:50%;background-color:${color};opacity:0.4;cursor:pointer;"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  })
}

const pinA = crearIconoPin('#526A3A')
const pinB = crearIconoPin('#2563eb')
const pinC = crearIconoPin('#374151')
const areaB = crearIconoArea('#3b82f6')
const areaC = crearIconoArea('#374151')

function desplazarCoordenada(lat: number, lng: number, radioMetros: number): [number, number] {
  const radioGrados = radioMetros / 111320
  const angulo = Math.random() * 2 * Math.PI
  const distancia = Math.random() * radioGrados
  return [
    lat + distancia * Math.cos(angulo),
    lng + distancia * Math.sin(angulo) / Math.cos((lat * Math.PI) / 180),
  ]
}

function ZoomWatcher({ onZoomChange }: { onZoomChange: (z: number) => void }) {
  useMapEvents({ zoomend: (e) => onZoomChange(e.target.getZoom()) })
  return null
}

function ControlesMapa() {
  const map = useMap()
  const [localizando, setLocalizando] = useState(false)

  function irAMiUbicacion() {
    if (!navigator.geolocation) { alert('Tu navegador no soporta geolocalización'); return }
    setLocalizando(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => { map.flyTo([pos.coords.latitude, pos.coords.longitude], 15, { duration: 1.5 }); setLocalizando(false) },
      () => { alert('No se pudo obtener tu ubicación'); setLocalizando(false) }
    )
  }

  const btn = {
    width: '36px', height: '36px', backgroundColor: 'white',
    border: '1px solid rgba(0,0,0,0.25)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#333', fontSize: '20px', fontWeight: 'bold',
  } as const

  return (
    <div className="leaflet-bottom leaflet-right" style={{ marginBottom: '74px', marginRight: '10px' }}>
      <div className="leaflet-control" style={{ display: 'flex', flexDirection: 'column', boxShadow: '0 1px 5px rgba(0,0,0,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
        <button onClick={() => map.zoomIn()} style={btn}>+</button>
        <div style={{ height: '1px', backgroundColor: 'rgba(0,0,0,0.15)' }} />
        <button onClick={() => map.zoomOut()} style={btn}>−</button>
        <div style={{ height: '5px', backgroundColor: 'rgba(0,0,0,0.06)' }} />
        <button onClick={irAMiUbicacion} title="Ir a mi ubicación" style={btn}>
          {localizando ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5"><circle cx="12" cy="12" r="9" /></svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#333"><path d="M12 2L2 22l10-6 10 6L12 2z" /></svg>
          )}
        </button>
      </div>
    </div>
  )
}

export function MapView() {
  const { usuario } = useAuth()
  const [sitios, setSitios] = useState<SitioMapa[]>([])
  const [loading, setLoading] = useState(true)
  const [sitioSeleccionado, setSitioSeleccionado] = useState<string | null>(null)
  const [zoomActual, setZoomActual] = useState(6)
  const supabase = createClient()
  const coordsDesplazadasRef = useRef<Record<string, [number, number]>>({})

  function getCoordsDesplazadas(sitio: SitioMapa): [number, number] {
    if (!coordsDesplazadasRef.current[sitio.id_reporte]) {
      coordsDesplazadasRef.current[sitio.id_reporte] = desplazarCoordenada(sitio.latitud, sitio.longitud, 300)
    }
    return coordsDesplazadasRef.current[sitio.id_reporte]
  }

  async function fetchSitios() {
    try {
      const { data, error } = await supabase
        .from('reportes_nuevos')
        .select('id_reporte, nombre_reporte, latitud, longitud, region, comuna, categoria_general, categoria_sitio, tipologia_especifica, imagen_url, codigo_accesibilidad')
        .eq('estado_validacion', 'verde')
        .order('nombre_reporte')
      if (error) throw error
      const rolUsuario = (usuario?.rol as 'publico' | 'experto' | 'partner' | 'founder') || null
      const filtrados = (data || []).filter(s => puedeVerSitio(s.codigo_accesibilidad as 'A' | 'B' | 'C', rolUsuario))
      setSitios(filtrados)
    } catch (err) {
      console.error('Error fetching sitios:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSitios() }, [usuario])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    )
  }

  const rolUsuario = (usuario?.rol as 'publico' | 'experto' | 'partner' | 'founder') || null

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

      <div className="h-screen w-full">
        <MapContainer
          center={[-33.4489, -70.6693]}
          zoom={6}
          zoomControl={false}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ZoomWatcher onZoomChange={setZoomActual} />
          <ControlesMapa />

          {sitios.map(sitio => {
            const codigo = sitio.codigo_accesibilidad
            const verExacto = puedeVerCoordenadasExactas(codigo, rolUsuario)
            const coords: [number, number] = verExacto
              ? [sitio.latitud, sitio.longitud]
              : getCoordsDesplazadas(sitio)

            const tipologias: string[] = sitio.tipologia_especifica ?? []

            // FIX: Lógica de botón diferenciada por código y rol
            // B + público → "Solicitar info"
            // C + experto/partner/founder → "Solicitar info"
            // Todo lo demás → "Ver ficha"
            const necesitaSolicitar =
              (codigo === 'B' && rolUsuario === 'publico') ||
              (codigo === 'C' && ['experto', 'partner', 'founder'].includes(rolUsuario || ''))

            const popup = (
              <div style={{ width: '272px', fontFamily: 'inherit' }}>
                {/* Fila superior: miniatura + info */}
                <div style={{ display: 'flex', gap: '10px', padding: '14px 14px 10px 14px', alignItems: 'flex-start' }}>
                  {sitio.imagen_url ? (
                    <img
                      src={sitio.imagen_url}
                      alt={sitio.nombre_reporte}
                      style={{ width: '70px', height: '70px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, backgroundColor: '#e5e7eb' }}
                    />
                  ) : (
                    <div style={{ width: '70px', height: '70px', borderRadius: '8px', backgroundColor: '#e5e7eb', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>🏺</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '14px', color: '#111827', lineHeight: '1.35', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '4px' }}>
                      {sitio.nombre_reporte}
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

                {/* Badges */}
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

                {/* FIX: Botón con texto dinámico según código y rol */}
                <div style={{ padding: '0 14px 14px 14px' }}>
                  <button
                    onClick={() => setSitioSeleccionado(sitio.id_reporte)}
                    style={{ width: '100%', padding: '8px 0', backgroundColor: '#10454B', color: '#B6875D', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'background-color 0.15s', letterSpacing: '0.02em' }}
                    onMouseOver={e => (e.currentTarget.style.backgroundColor = '#0b3237')}
                    onMouseOut={e => (e.currentTarget.style.backgroundColor = '#10454B')}
                  >
                    {necesitaSolicitar ? <><span>📨</span> Solicitar info de contacto</> : <><span>📄</span> Ver ficha</>}
                  </button>
                </div>
              </div>
            )

            if (codigo === 'A') {
              return <Marker key={sitio.id_reporte} position={coords} icon={pinA}><Popup>{popup}</Popup></Marker>
            }
            if (codigo === 'B' && verExacto) {
              return <Marker key={sitio.id_reporte} position={coords} icon={pinB}><Popup>{popup}</Popup></Marker>
            }
            if (zoomActual >= 15) return null
            if (zoomActual >= 9) {
              return <Marker key={sitio.id_reporte} position={coords} icon={codigo === 'B' ? areaB : areaC}><Popup>{popup}</Popup></Marker>
            }
            return <Marker key={sitio.id_reporte} position={coords} icon={codigo === 'B' ? pinB : pinC}><Popup>{popup}</Popup></Marker>
          })}

        </MapContainer>
      </div>

      {sitioSeleccionado && (
        <FichaSitioModal
          idSitio={sitioSeleccionado}
          onClose={() => setSitioSeleccionado(null)}
        />
      )}
    </>
  )
}
