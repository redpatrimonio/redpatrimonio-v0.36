'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const MapPicker = dynamic(() => import('@/components/reportar/MapPicker'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
})

interface StepUbicacionProps {
  onNext: (data: { latitud: number; longitud: number }) => void
}

export function StepUbicacion({ onNext }: StepUbicacionProps) {
  const [latitud, setLatitud] = useState<number | null>(null)
  const [longitud, setLongitud] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function getGPSLocation() {
    setLoading(true)
    setError('')

    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitud(position.coords.latitude)
        setLongitud(position.coords.longitude)
        setLoading(false)
      },
      (err) => {
        setError('No se pudo obtener ubicación. Selecciona manualmente en el mapa.')
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  function handleMapClick(lat: number, lng: number) {
    setLatitud(lat)
    setLongitud(lng)
    setError('')
  }

  function handleNext() {
    if (latitud === null || longitud === null) {
      setError('Debes seleccionar una ubicación')
      return
    }
    onNext({ latitud, longitud })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Paso 1: Ubicación del Sitio</h2>
      <p className="text-gray-600 text-sm">
        Usa el GPS o selecciona la ubicación en el mapa
      </p>

      {/* Botón GPS */}
      <button
        onClick={getGPSLocation}
        disabled={loading}
        className={`w-full py-3 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
          loading
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {loading ? (
          <>
            <span className="animate-spin">⟳</span>
            Obteniendo ubicación...
          </>
        ) : (
          <>
            <span>📍</span>
            Usar mi ubicación actual (GPS)
          </>
        )}
      </button>

      {/* Mapa */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <MapPicker
          lat={latitud || -33.4489}
          lng={longitud || -70.6693}
          onLocationSelect={handleMapClick}
        />
      </div>

      {/* Coordenadas */}
      {latitud !== null && longitud !== null && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-medium text-green-900 mb-1">
            ✓ Ubicación seleccionada
          </p>
          <p className="text-xs text-green-700">
            Lat: {latitud.toFixed(6)}, Lng: {longitud.toFixed(6)}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Botón siguiente */}
      <button
        onClick={handleNext}
        disabled={latitud === null || longitud === null}
        className={`w-full py-3 px-4 rounded-lg font-medium transition ${
          latitud !== null && longitud !== null
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Siguiente →
      </button>
    </div>
  )
}
