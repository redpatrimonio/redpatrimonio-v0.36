'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { FichaSitioModal } from '@/components/modals/FichaSitioModal'
import { puedeVerSitio } from '@/lib/utils/accesibilidad'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix iconos Leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
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

// Iconos personalizados por código
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

function getIconoPorCodigo(codigo: 'A' | 'B' | 'C'): L.Icon {
  if (codigo === 'A') return iconoVerde
  if (codigo === 'B') return iconoAzul
  return iconoGris
}

export function MapView() {
  const { usuario } = useAuth()
  const [sitios, setSitios] = useState<SitioMapa[]>([])
  const [loading, setLoading] = useState(true)
  const [sitioSeleccionado, setSitioSeleccionado] = useState<string | null>(null)
  const supabase = createClient()

  async function fetchSitios() {
    try {
      const { data, error } = await supabase
        .from('reportes_nuevos')
        .select('id_reporte, nombre_sitio, latitud, longitud, region, comuna, categoria_general, codigo_accesibilidad')
        .eq('estado_validacion', 'verde')
        .order('nombre_sitio')

      if (error) throw error

      // Filtrar según rol del usuario
      const rolUsuario = (usuario?.rol as 'publico' | 'experto' | 'partner' | 'founder') || null
      const sitiosFiltrados = (data || []).filter(sitio => 
        puedeVerSitio(sitio.codigo_accesibilidad as 'A' | 'B' | 'C', rolUsuario)
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

  return (
    <>
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

          {sitios.map(sitio => (
            <Marker
              key={sitio.id_reporte}
              position={[sitio.latitud, sitio.longitud]}
              icon={getIconoPorCodigo(sitio.codigo_accesibilidad)}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-bold text-base mb-1">{sitio.nombre_sitio}</h3>
                  <p className="text-sm text-gray-700 mb-2">{sitio.categoria_general || 'Sin categoría'}</p>
                  <div className="text-xs text-gray-500 mb-2">
                    <p>{sitio.region}, {sitio.comuna}</p>
                  </div>
                  <button
                    onClick={() => setSitioSeleccionado(sitio.id_reporte)}
                    className="text-sm bg-green-700 text-white px-3 py-1 rounded hover:bg-green-800 transition w-full"
                  >
                    📄 Ver ficha completa
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Modal Ficha */}
      {sitioSeleccionado && (
        <FichaSitioModal
          idSitio={sitioSeleccionado}
          onClose={() => setSitioSeleccionado(null)}
        />
      )}
    </>
  )
}
