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
  nombre_sitio: string
  latitud: number
  longitud: number
  region: string
  comuna: string
  categoria_general: string | null
  codigo_accesibilidad: 'A' | 'B' | 'C'
}

// ── SVG Pin con stroke blanco + círculo interior ──────────────
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

// ── DivIcon circular 30px sin stroke ─────────────────────────
function crearIconoArea(color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="width:30px;height:30px;border-radius:50%;background-color:${color};opacity:0.4;cursor:pointer;"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  })
}

const pinA  = crearIconoPin('#526A3A')  // verde terroso
const pinB  = crearIconoPin('#2563eb')  // azul
const pinC  = crearIconoPin('#374151')  // gris oscuro
const areaB = crearIconoArea('#3b82f6') // azul difuso
const areaC = crearIconoArea('#374151') // gris difuso

// ── Desplazamiento aleatorio 300m ─────────────────────────────
function desplazarCoordenada(lat: number, lng: number, radioMetros: number): [number, number] {
  const radioGrados = radioMetros / 111320
  const angulo = Math.random() * 2 * Math.PI
  const distancia = Math.random() * radioGrados
  return [
    lat + distancia * Math.cos(angulo),
    lng + distancia * Math.sin(angulo) / Math.cos((lat * Math.PI) / 180),
  ]
}

// ── Escucha cambios de zoom ───────────────────────────────────
function ZoomWatcher({ onZoomChange }: { onZoomChange: (z: number) => void }) {
  useMapEvents({ zoomend: (e) => onZoomChange(e.target.getZoom()) })
  return null
}

// ── Controles: zoom + ubicación apilados sobre footer ─────────
function ControlesMapa() {
  const map = useMap()
  const [localizando, setLocalizando] = useState(false)

  function irAMiUbicacion() {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización')
      return
    }
    setLocalizando(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo([pos.coords.latitude, pos.coords.longitude], 15, { duration: 1.5 })
        setLocalizando(false)
      },
      () => {
        alert('No se pudo obtener tu ubicación')
        setLocalizando(false)
      }
    )
  }

  const btn = {
    width: '36px',
    height: '36px',
    backgroundColor: 'white',
    border: '1px solid rgba(0,0,0,0.25)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#333',
    fontSize: '20px',
    fontWeight: 'bold',
  } as const

  return (
    <div
      className="leaflet-bottom leaflet-right"
      style={{ marginBottom: '74px', marginRight: '10px' }}
    >
      <div
        className="leaflet-control"
        style={{
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 1px 5px rgba(0,0,0,0.2)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        {/* Zoom + */}
        <button onClick={() => map.zoomIn()} style={btn}>+</button>
        {/* Separador */}
        <div style={{ height: '1px', backgroundColor: 'rgba(0,0,0,0.15)' }} />
        {/* Zoom - */}
        <button onClick={() => map.zoomOut()} style={btn}>−</button>
        {/* Separador doble */}
        <div style={{ height: '5px', backgroundColor: 'rgba(0,0,0,0.06)' }} />
        {/* Ubicación */}
        <button onClick={irAMiUbicacion} title="Ir a mi ubicación" style={btn}>
          {localizando ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5">
              <circle cx="12" cy="12" r="9"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#333">
              <path d="M12 2L2 22l10-6 10 6L12 2z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────
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
      coordsDesplazadasRef.current[sitio.id_reporte] = desplazarCoordenada(
        sitio.latitud, sitio.longitud, 300
      )
    }
    return coordsDesplazadasRef.current[sitio.id_reporte]
  }

  async function fetchSitios() {
    try {
      const { data, error } = await supabase
        .from('reportes_nuevos')
        .select('id_reporte, nombre_sitio, latitud, longitud, region, comuna, categoria_general, codigo_accesibilidad')
        .eq('estado_validacion', 'verde')
        .order('nombre_sitio')

      if (error) throw error

      const rolUsuario = (usuario?.rol as 'publico' | 'experto' | 'partner' | 'founder') || null
      const filtrados = (data || []).filter(s =>
        puedeVerSitio(s.codigo_accesibilidad as 'A' | 'B' | 'C', rolUsuario)
      )
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

            const popup = (
              <div className="min-w-[200px]">
                <h3 className="font-bold text-base mb-1">{sitio.nombre_sitio}</h3>
                <p className="text-sm text-gray-700 mb-2">{sitio.categoria_general || 'Sin categoría'}</p>
                <p className="text-xs text-gray-500 mb-2">{sitio.region}, {sitio.comuna}</p>
                {!verExacto && (
                  <p className="text-xs text-amber-600 mb-2">📍 Ubicación aproximada</p>
                )}
                <button
                  onClick={() => setSitioSeleccionado(sitio.id_reporte)}
                  className="text-sm bg-green-700 text-white px-3 py-1 rounded hover:bg-green-800 transition w-full"
                >
                  📄 Ver ficha completa
                </button>
              </div>
            )

            // ── Código A: siempre pin, sin lógica de zoom ───────
            if (codigo === 'A') {
              return (
                <Marker key={sitio.id_reporte} position={coords} icon={pinA}>
                  <Popup>{popup}</Popup>
                </Marker>
              )
            }

            // ── Código B + experto+: siempre pin exacto ─────────
            if (codigo === 'B' && verExacto) {
              return (
                <Marker key={sitio.id_reporte} position={coords} icon={pinB}>
                  <Popup>{popup}</Popup>
                </Marker>
              )
            }

            // ── B (público) y C (experto+): lógica de zoom ───────
            // zoom 0–8  → nada
            // zoom 9–14 → área difusa
            // zoom ≥ 15 → pin
            if (zoomActual < 9) return null

            if (zoomActual < 15) {
              return (
                <Marker
                  key={sitio.id_reporte}
                  position={coords}
                  icon={codigo === 'B' ? areaB : areaC}
                >
                  <Popup>{popup}</Popup>
                </Marker>
              )
            }

            return (
              <Marker
                key={sitio.id_reporte}
                position={coords}
                icon={codigo === 'B' ? pinB : pinC}
              >
                <Popup>{popup}</Popup>
              </Marker>
            )
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
