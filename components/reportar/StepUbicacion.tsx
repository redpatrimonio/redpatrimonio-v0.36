'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { REGIONES, COMUNAS } from '@/lib/constants/tipologias'

const MapPicker = dynamic(() => import('@/components/reportar/MapPicker'), { ssr: false })

interface StepUbicacionProps {
  onNext: (data: {
    latitud: number
    longitud: number
    region: string
    comuna: string
  }) => void
}

async function getReverseGeocode(lat: number, lng: number) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
    const res = await fetch(url, { headers: { 'Accept-Language': 'es' } })
    const data = await res.json()
    return {
      region: data.address?.state || data.address?.region || '',
      comuna:
        data.address?.city ||
        data.address?.town ||
        data.address?.municipality ||
        data.address?.village ||
        '',
    }
  } catch (err) {
    console.error('Error en geocoding:', err)
    return { region: '', comuna: '' }
  }
}

function normalizarRegion(rawRegion: string): string {
  if (!rawRegion) return ''

  const mapaExplicito: Record<string, string> = {
    'región metropolitana de santiago': 'Metropolitana',
    'región metropolitana': 'Metropolitana',
    'metropolitana de santiago': 'Metropolitana',
    'región de la araucanía': 'Araucanía',
    'región del biobío': 'Biobío',
    'región de los lagos': 'Los Lagos',
    'región de los ríos': 'Los Ríos',
    'región de aysén del general carlos ibáñez del campo': 'Aysén',
    'región de magallanes y de la antártica chilena': 'Magallanes',
    'región de magallanes y la antártica chilena': 'Magallanes',
    "región del libertador general bernardo o'higgins": "O'Higgins",
    "región de o'higgins": "O'Higgins",
    'región del maule': 'Maule',
    'región de valparaíso': 'Valparaíso',
    'región de coquimbo': 'Coquimbo',
    'región de atacama': 'Atacama',
    'región de antofagasta': 'Antofagasta',
    'región de tarapacá': 'Tarapacá',
    'región de arica y parinacota': 'Arica y Parinacota',
    'región de ñuble': 'Ñuble',
  }

  const lowerRaw = rawRegion.toLowerCase().trim()
  if (mapaExplicito[lowerRaw]) return mapaExplicito[lowerRaw]
  for (const [key, value] of Object.entries(mapaExplicito)) {
    if (lowerRaw.includes(key) || key.includes(lowerRaw)) return value
  }

  const limpio = rawRegion
    .replace(/^Regi[oó]n\s+Metropolitana\s+de\s+Santiago/i, 'Metropolitana')
    .replace(/^Regi[oó]n\s+de\s+la\s+/i, '')
    .replace(/^Regi[oó]n\s+de\s+los?\s+/i, 'Los ')
    .replace(/^Regi[oó]n\s+del?\s+/i, '')
    .replace(/^Regi[oó]n\s+de\s+/i, '')
    .trim()

  const exacta = (REGIONES as readonly string[]).find(
    r => r.toLowerCase() === limpio.toLowerCase()
  )
  if (exacta) return exacta

  const parcial = (REGIONES as readonly string[]).find(r =>
    limpio.toLowerCase().includes(r.toLowerCase()) ||
    r.toLowerCase().includes(limpio.toLowerCase())
  )
  return parcial ?? ''
}

export function StepUbicacion({ onNext }: StepUbicacionProps) {
  const [latitud, setLatitud] = useState<number | null>(null)
  const [longitud, setLongitud] = useState<number | null>(null)
  // --- NUEVO: strings para los inputs manuales ---
  const [latStr, setLatStr] = useState('')
  const [lngStr, setLngStr] = useState('')
  const [errorCoords, setErrorCoords] = useState('')
  // -----------------------------------------------
  const [region, setRegion] = useState('')
  const [comuna, setComuna] = useState('')
  const [comunasDisponibles, setComunasDisponibles] = useState<string[]>([])
  const [error, setError] = useState('')
  const [cargandoGPS, setCargandoGPS] = useState(false)
  const [cargandoGeocode, setCargandoGeocode] = useState(false)

  async function aplicarGeocode(lat: number, lng: number) {
    setCargandoGeocode(true)
    const geo = await getReverseGeocode(lat, lng)
    const regionNormalizada = normalizarRegion(geo.region)
    if (regionNormalizada) {
      setRegion(regionNormalizada)
      const comunas = COMUNAS[regionNormalizada] || []
      setComunasDisponibles(comunas)
      const comunaEncontrada = comunas.find(c =>
        geo.comuna.toLowerCase().includes(c.toLowerCase()) ||
        c.toLowerCase().includes(geo.comuna.toLowerCase())
      )
      setComuna(comunaEncontrada ?? '')
    } else {
      setRegion('')
      setComuna('')
      setComunasDisponibles([])
    }
    setCargandoGeocode(false)
  }

  // Actualiza todo: estado numérico + strings de inputs + geocoding
  async function aplicarCoordenadas(lat: number, lng: number) {
    setLatitud(lat)
    setLongitud(lng)
    setLatStr(lat.toFixed(6))
    setLngStr(lng.toFixed(6))
    await aplicarGeocode(lat, lng)
  }

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
        await aplicarCoordenadas(position.coords.latitude, position.coords.longitude)
        setCargandoGPS(false)
      },
      (err) => {
        setError('No se pudo obtener tu ubicación. Usa el mapa.')
        setCargandoGPS(false)
        console.error(err)
      }
    )
  }

  async function handleMapClick(lat: number, lng: number) {
    await aplicarCoordenadas(lat, lng)
  }

  // --- NUEVO: aplicar coordenadas ingresadas manualmente ---
  async function handleManualApply() {
    setErrorCoords('')
    const lat = parseFloat(latStr.replace(',', '.'))
    const lng = parseFloat(lngStr.replace(',', '.'))

    if (isNaN(lat) || isNaN(lng)) {
      setErrorCoords('Ingresa valores numéricos válidos')
      return
    }
    if (lat < -90 || lat > 90) {
      setErrorCoords('Latitud debe estar entre -90 y 90')
      return
    }
    if (lng < -180 || lng > 180) {
      setErrorCoords('Longitud debe estar entre -180 y 180')
      return
    }
    await aplicarCoordenadas(lat, lng)
  }
  // ---------------------------------------------------------

  function handleRegionChange(nuevaRegion: string) {
    setRegion(nuevaRegion)
    setComuna('')
    const comunas = COMUNAS[nuevaRegion] || []
    setComunasDisponibles(comunas)
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

  const cargando = cargandoGPS || cargandoGeocode

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Paso 1: Ubicación</h2>
      <p className="text-gray-600 text-sm">Selecciona dónde está el sitio</p>

      {/* Botón GPS */}
      <button
        onClick={handleUseCurrentLocation}
        disabled={cargando}
        className="w-full py-3 rounded-lg font-medium transition"
        style={{
          backgroundColor: '#10454B',
          color: cargando ? '#ccc' : '#B18256',
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

      {/* --- NUEVO: Inputs manuales de coordenadas --- */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          O ingresa coordenadas manualmente{' '}
          <span className="text-gray-400 font-normal">(ej. desde GPS Garmin)</span>
        </p>
        <div className="flex gap-2 items-start">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Latitud (-90 a 90)</label>
            <input
              type="text"
              value={latStr}
              onChange={(e) => setLatStr(e.target.value)}
              placeholder="-33.456789"
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B]"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Longitud (-180 a 180)</label>
            <input
              type="text"
              value={lngStr}
              onChange={(e) => setLngStr(e.target.value)}
              placeholder="-70.678901"
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B]"
            />
          </div>
          <div className="pt-5">
            <button
              onClick={handleManualApply}
              disabled={cargando || !latStr || !lngStr}
              className="px-4 py-2 text-sm rounded-lg font-medium transition disabled:bg-gray-200 disabled:text-gray-400"
              style={{
                backgroundColor: latStr && lngStr && !cargando ? '#10454B' : undefined,
                color: latStr && lngStr && !cargando ? '#B18256' : undefined,
              }}
            >
              Aplicar
            </button>
          </div>
        </div>
        {errorCoords && (
          <p className="text-xs text-red-600 mt-1">{errorCoords}</p>
        )}
      </div>
      {/* --------------------------------------------- */}

      {/* Coordenadas activas */}
      {latitud && longitud && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            <strong>Coordenadas:</strong> {latitud.toFixed(6)}, {longitud.toFixed(6)}
          </p>
        </div>
      )}

      {/* Banner: Cargando geocoding */}
      {cargandoGeocode && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
          <svg
            className="animate-spin h-4 w-4 text-blue-600 flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="text-sm text-blue-700">Cargando ubicación...</p>
        </div>
      )}

      {/* Región */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Región <span className="text-red-500">*</span>
        </label>
        <select
          value={region}
          onChange={(e) => handleRegionChange(e.target.value)}
          disabled={cargandoGeocode}
          className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B] disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="" className="text-gray-400">
            {cargandoGeocode ? 'Cargando ubicación...' : 'Selecciona una región'}
          </option>
          {REGIONES.map((r) => (
            <option key={r} value={r} className="text-gray-900">{r}</option>
          ))}
        </select>
      </div>

      {/* Comuna */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Comuna <span className="text-red-500">*</span>
        </label>
        <select
          value={comuna}
          onChange={(e) => setComuna(e.target.value)}
          disabled={cargandoGeocode || !region || comunasDisponibles.length === 0}
          className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B] disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="" className="text-gray-400">
            {cargandoGeocode
              ? 'Cargando ubicación...'
              : !region
                ? 'Primero selecciona una región'
                : 'Selecciona una comuna'}
          </option>
          {comunasDisponibles.map((c) => (
            <option key={c} value={c} className="text-gray-900">{c}</option>
          ))}
        </select>
      </div>

      {/* Error general */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Siguiente */}
      <button
        onClick={handleNext}
        disabled={!latitud || !longitud || !region || !comuna || cargandoGeocode}
        className="w-full py-3 rounded-lg font-medium transition disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
        style={{
          backgroundColor:
            latitud && longitud && region && comuna && !cargandoGeocode ? '#10454B' : undefined,
          color:
            latitud && longitud && region && comuna && !cargandoGeocode ? 'white' : undefined,
        }}
      >
        Siguiente
      </button>
    </div>
  )
}

export default StepUbicacion
