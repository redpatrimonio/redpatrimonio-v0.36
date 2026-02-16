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

// Iconos personalizados por código
const iconoA = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'marker-verde-oscuro'
})

const iconoB = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'marker-cafe'
})

const iconoC = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'marker-gris'
})

interface SitioMapa {
  id_sitio: string
  nombre_sitio: string
  alias_local: string | null
  latitud: number
  longitud: number
  region: string
  comuna: string
  descripcion_breve: string
  categoria_general: string
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
        .from('sitios_master')
        .select('id_sitio, nombre_sitio, alias_local, latitud, longitud, region, comuna, descripcion_breve, categoria_general, codigo_accesibilidad')
        .eq('estado_validacion', 'verde')
        .order('nombre_sitio')

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

  function getIconoPorCodigo(codigo: string) {
    switch (codigo) {
      case 'A': return iconoA
      case 'B': return iconoB
      case 'C': return iconoC
      default: return iconoA
    }
  }

  function getColorBadge(codigo: string) {
    switch (codigo) {
      case 'A': return 'bg-green-700 text-white'
      case 'B': return 'bg-yellow-700 text-white'
      case 'C': return 'bg-gray-500 text-white'
      default: return 'bg-gray-400 text-white'
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
            key={sitio.id_sitio} 
            position={[sitio.latitud, sitio.longitud]}
            icon={getIconoPorCodigo(sitio.codigo_accesibilidad)}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-base flex-1">{sitio.nombre_sitio}</h3>
                  <span className={'text-xs px-2 py-1 rounded ml-2 ' + getColorBadge(sitio.codigo_accesibilidad)}>
                    {sitio.codigo_accesibilidad}
                  </span>
                </div>

                {sitio.alias_local && (
                  <p className="text-sm text-gray-600 italic mb-2">
                    &quot;{sitio.alias_local}&quot;
                  </p>
                )}

                <p className="text-sm text-gray-700 mb-2">{sitio.descripcion_breve}</p>

                <div className="text-xs text-gray-500 mb-2">
                  <p>📍 {sitio.region}, {sitio.comuna}</p>
                  <p>🏛️ {sitio.categoria_general}</p>
                </div>

                <button
                  onClick={() => window.open('/sitio/' + sitio.id_sitio, '_blank')}
                  className="text-sm bg-green-700 text-white px-3 py-1 rounded hover:bg-green-800 transition w-full"
                >
                  Ver detalle →
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Leyenda */}
      <div className="absolute bottom-6 right-6 bg-white rounded-lg shadow-lg p-4 z-[1000]">
        <h4 className="font-semibold text-sm mb-2 text-gray-900">Código de Acceso</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-700 rounded-full"></div>
            <span className="text-gray-700">A - Abierto/Controlado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-700 rounded-full"></div>
            <span className="text-gray-700">B - Protegido</span>
          </div>
          {usuario?.rol && ['experto', 'partner', 'founder'].includes(usuario.rol) && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span className="text-gray-700">C - Restringido</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
