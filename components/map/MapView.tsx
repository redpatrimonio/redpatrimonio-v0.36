'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { createClient } from '@/lib/supabase/client'
import { Sitio } from '@/types'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix para iconos de Leaflet en Next.js (sin any)
;(L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl = undefined

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export function MapView() {
  const [sitios, setSitios] = useState<Sitio[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  async function fetchSitios() {
    try {
      const { data, error } = await supabase
        .from('sitios_master')
        .select('*')
        .eq('nivel_acceso', 'resguardado')
        .order('nombre_sitio')

      if (error) throw error
      setSitios(data || [])
    } catch (error) {
      console.error('Error fetching sitios:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSitios()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        center={[-33.4489, -70.6693]} // Santiago, Chile
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {sitios.map((sitio) => (
          <Marker key={sitio.id_sitio} position={[sitio.latitud, sitio.longitud]}>
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-base mb-1">{sitio.nombre_sitio}</h3>

                {sitio.alias_local && (
                  <p className="text-sm text-gray-600 italic mb-2">
                    &quot;{sitio.alias_local}&quot;
                  </p>
                )}

                <p className="text-sm text-gray-700 mb-2">{sitio.descripcion_breve}</p>

                <div className="text-xs text-gray-500 mb-2">
                  <p>
                    📍 {sitio.region}, {sitio.comuna}
                  </p>
                  <p>🏛️ {sitio.categoria_general}</p>
                </div>

                <button
                  onClick={() => window.open(`/sitio/${sitio.id_sitio}`, '_blank')}
                  className="text-sm bg-green-700 text-white px-3 py-1 rounded hover:bg-green-800 transition"
                >
                  Ver detalle →
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
