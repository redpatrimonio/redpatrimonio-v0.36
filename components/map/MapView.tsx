'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { puedeVerSitio } from '@/lib/utils/accesibilidad'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// ✅ Fix iconos Leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Iconos personalizados por nivel de accesibilidad
const iconoVerde = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const iconoAzul = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const iconoGris = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

interface SitioMapa {
  id_reporte: string
  nombre_reporte: string
  latitud: number
  longitud: number
  region: string | null
  comuna: string | null
  descripcion_ubicacion: string | null
  categoria_general: string | null
  origen_acceso: string
  nivel_accesibilidad: string
  codigo_accesibilidad: string
}

export function MapView() {
  const { usuario } = useAuth()
  const [sitios, setSitios] = useState<SitioMapa[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  async function fetchSitios() {
    try {
      const { data, error } = await supabase
        .from('reportes_nuevos')
        .select('id_reporte, nombre_reporte, latitud, longitud, region, comuna, descripcion_ubicacion, categoria_general, origen_acceso, nivel_accesibilidad, codigo_accesibilidad')
        .eq('estado_validacion', 'verde')
        .not('codigo_accesibilidad', 'is', null)
        .order('nombre_reporte')

      if (error) throw error

      // Filtrar según rol del usuario
      const rolUsuario = usuario?.rol as 'experto' | 'partner' | 'founder' | 'publico' | null
      const sitiosFiltrados = (data || []).filter((sitio) => 
        puedeVerSitio(
          sitio.codigo_accesibilidad as 'A' | 'B' | 'C',
          rolUsuario
        )
      )

      setSitios(sitiosFiltrados)
    } catch (error) {
      console.error('Error fetching sitios:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSitios()
  }, [usuario])

  function getIconoPorNivel(nivel: string) {
    switch (nivel) {
      case 'abierto':
      case 'controlado':
        return iconoVerde
      case 'protegido':
        return iconoAzul
      case 'restringido':
        return iconoGris
      default:
        return iconoVerde
    }
  }

  function getNivelTexto(nivel: string) {
    switch (nivel) {
      case 'abierto': return 'Abierto'
      case 'controlado': return 'Controlado'
      case 'protegido': return 'Protegido'
      case 'restringido': return 'Restringido'
      default: return nivel
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full">
      <MapContainer
        center={[-33.4489, -70.6693]}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {sitios.map((sitio) => (
          <Marker 
            key={sitio.id_reporte} 
            position={[sitio.latitud, sitio.longitud]}
            icon={getIconoPorNivel(sitio.nivel_accesibilidad)}
          >
            <Popup>
              <div className="min-w-[220px]">
                <h3 className="font-bold text-base mb-2">{sitio.nombre_reporte}</h3>

                <div className="text-sm space-y-1 mb-3">
                  {sitio.descripcion_ubicacion && (
                    <p className="text-gray-700 italic">{sitio.descripcion_ubicacion}</p>
                  )}
                  {sitio.region && sitio.comuna && (
                    <p className="text-gray-600">📍 {sitio.region}, {sitio.comuna}</p>
                  )}
                  {sitio.categoria_general && (
                    <p className="text-gray-600">🏛️ {sitio.categoria_general}</p>
                  )}
                </div>

                <div className="mb-3 pb-2 border-t pt-2">
                  <p className="text-xs font-semibold text-gray-700">Nivel de Acceso:</p>
                  <p className="text-sm font-medium text-gray-900">{getNivelTexto(sitio.nivel_accesibilidad)}</p>
                </div>

                <button
                  onClick={() => window.open('/sitio/' + sitio.id_reporte, '_blank')}
                  className="text-sm bg-green-700 text-white px-3 py-1.5 rounded hover:bg-green-800 transition w-full"
                >
                  Ver ficha completa →
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
