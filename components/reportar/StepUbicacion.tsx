'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const MapPicker = dynamic(() => import('./MapPicker'), { ssr: false })

interface StepUbicacionProps {
  onNext: (data: { 
    latitud: number
    longitud: number
    region: string
    comuna: string
  }) => void
}

// Geocoding reverso con Nominatim
async function getReverseGeocode(lat: number, lng: number) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
    const res = await fetch(url)
    const data = await res.json()
    
    return {
      region: data.address?.state || data.address?.region || '',
      comuna: data.address?.city || data.address?.town || data.address?.municipality || data.address?.village || ''
    }
  } catch (err) {
    console.error('Error en geocoding:', err)
    return { region: '', comuna: '' }
  }
}

export function StepUbicacion({ onNext }: StepUbicacionProps) {
  const [latitud, setLatitud] = useState<number | null>(null)
  const [longitud, setLongitud] = useState<number | null>(null)
  const [region, setRegion] = useState('')
  const [comuna, setComuna] = useState('')
  const [error, setError] = useState('')
  const [cargandoGPS, setCargandoGPS] = useState(false)

  async function handleUseCurrentLocation() {
    setCargandoGPS(true)
    setError('')

    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización')
      setCargandoGPS(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        
        setLatitud(lat)
        setLongitud(lng)

        // Obtener región y comuna automáticamente
        const geo = await getReverseGeocode(lat, lng)
        setRegion(geo.region)
        setComuna(geo.comuna)
        
        setCargandoGPS(false)
      },
      (err) => {
        setError('No se pudo obtener tu ubicación. Usa el mapa.')
        setCargandoGPS(false)
        console.error(err)
      }
    )
  }

  function handleMapClick(lat: number, lng: number) {
    setLatitud(lat)
    setLongitud(lng)
  }

  function handleNext() {
    if (!latitud || !longitud) {
      setError('Debes seleccionar una ubicación')
      return
    }

    if (!region || !comuna) {
      setError('Completa región y comuna')
      return
    }

    onNext({ latitud, longitud, region, comuna })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Paso 1: Ubicación</h2>
      <p className="text-gray-600 text-sm">Selecciona dónde está el sitio</p>

      {/* Botón GPS */}
      <button
        onClick={handleUseCurrentLocation}
        disabled={cargandoGPS}
        className="w-full py-3 rounded-lg font-medium transition"
        style={{ 
          backgroundColor: '#10454B', 
          color: cargandoGPS ? '#ccc' : '#B18256'
        }}
      >
        {cargandoGPS ? '📍 Obteniendo ubicación...' : '📍 Usar mi ubicación actual'}
      </button>

      {/* Mapa */}
      <div className="h-64 rounded-lg overflow-hidden border-2 border-gray-300">
        <MapPicker
          lat={latitud || -33.4489}
          lng={longitud || -70.6693}
          onLocationSelect={handleMapClick}
        />
      </div>

      {/* Coordenadas */}
      {latitud && longitud && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            <strong>Coordenadas:</strong> {latitud.toFixed(6)}, {longitud.toFixed(6)}
          </p>
        </div>
      )}

      {/* Región */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Región <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="Ej: Metropolitana"
          className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B]"
        />
      </div>

      {/* Comuna */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Comuna <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={comuna}
          onChange={(e) => setComuna(e.target.value)}
          placeholder="Ej: Santiago"
          className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B]"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Botón Siguiente */}
      <button
        onClick={handleNext}
        disabled={!latitud || !longitud || !region || !comuna}
        className="w-full py-3 rounded-lg font-medium transition disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
        style={{ 
          backgroundColor: (latitud && longitud && region && comuna) ? '#10454B' : undefined,
          color: (latitud && longitud && region && comuna) ? 'white' : undefined
        }}
      >
        Siguiente
      </button>
    </div>
  )
}

export default StepUbicacion
