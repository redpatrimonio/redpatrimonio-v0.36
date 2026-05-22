'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { REGIONES, COMUNAS } from '@/lib/constants/tipologias'
import { StepWrapper } from '@/components/ui/StepWrapper'
import { StepButton } from '@/components/ui/StepButton'
import * as S from '@/lib/ui/stepStyles'

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
    'regi\u00f3n metropolitana de santiago': 'Metropolitana',
    'regi\u00f3n metropolitana': 'Metropolitana',
    'metropolitana de santiago': 'Metropolitana',
    'regi\u00f3n de la araucan\u00eda': 'Araucan\u00eda',
    'regi\u00f3n del biob\u00edo': 'Biob\u00edo',
    'regi\u00f3n de los lagos': 'Los Lagos',
    'regi\u00f3n de los r\u00edos': 'Los R\u00edos',
    'regi\u00f3n de ays\u00e9n del general carlos ib\u00e1\u00f1ez del campo': 'Ays\u00e9n',
    'regi\u00f3n de magallanes y de la ant\u00e1rtica chilena': 'Magallanes',
    'regi\u00f3n de magallanes y la ant\u00e1rtica chilena': 'Magallanes',
    "regi\u00f3n del libertador general bernardo o'higgins": "O'Higgins",
    "regi\u00f3n de o'higgins": "O'Higgins",
    'regi\u00f3n del maule': 'Maule',
    'regi\u00f3n de valpara\u00edso': 'Valpara\u00edso',
    'regi\u00f3n de coquimbo': 'Coquimbo',
    'regi\u00f3n de atacama': 'Atacama',
    'regi\u00f3n de antofagasta': 'Antofagasta',
    'regi\u00f3n de tarapac\u00e1': 'Tarapac\u00e1',
    'regi\u00f3n de arica y parinacota': 'Arica y Parinacota',
    'regi\u00f3n de \u00f1uble': '\u00d1uble',
  }
  const lowerRaw = rawRegion.toLowerCase().trim()
  if (mapaExplicito[lowerRaw]) return mapaExplicito[lowerRaw]
  for (const [key, value] of Object.entries(mapaExplicito)) {
    if (lowerRaw.includes(key) || key.includes(lowerRaw)) return value
  }
  const limpio = rawRegion
    .replace(/^Regi[o\u00f3]n\s+Metropolitana\s+de\s+Santiago/i, 'Metropolitana')
    .replace(/^Regi[o\u00f3]n\s+de\s+la\s+/i, '')
    .replace(/^Regi[o\u00f3]n\s+de\s+los?\s+/i, 'Los ')
    .replace(/^Regi[o\u00f3]n\s+del?\s+/i, '')
    .replace(/^Regi[o\u00f3]n\s+de\s+/i, '')
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
  const [latStr, setLatStr] = useState('')
  const [lngStr, setLngStr] = useState('')
  const [errorCoords, setErrorCoords] = useState('')
  const [region, setRegion] = useState('')
  const [comuna, setComuna] = useState('')
  const [comunasDisponibles, setComunasDisponibles] = useState<string[]>([])
  const [error, setError] = useState('')
  const [cargandoGPS, setCargandoGPS] = useState(false)
  const [cargandoGeocode, setCargandoGeocode] = useState(false)
  const [focusField, setFocusField] = useState<string | null>(null)

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

  async function handleManualApply() {
    setErrorCoords('')
    const lat = parseFloat(latStr.replace(',', '.'))
    const lng = parseFloat(lngStr.replace(',', '.'))
    if (isNaN(lat) || isNaN(lng)) { setErrorCoords('Ingresa valores numéricos válidos'); return }
    if (lat < -90 || lat > 90) { setErrorCoords('Latitud debe estar entre -90 y 90'); return }
    if (lng < -180 || lng > 180) { setErrorCoords('Longitud debe estar entre -180 y 180'); return }
    await aplicarCoordenadas(lat, lng)
  }

  function handleRegionChange(nuevaRegion: string) {
    setRegion(nuevaRegion)
    setComuna('')
    const comunas = COMUNAS[nuevaRegion] || []
    setComunasDisponibles(comunas)
  }

  function handleNext() {
    if (!latitud || !longitud) { setError('Debes seleccionar una ubicación'); return }
    if (!region || !comuna) { setError('Completa región y comuna'); return }
    onNext({ latitud, longitud, region, comuna })
  }

  const cargando = cargandoGPS || cargandoGeocode
  const canAdvance = !!(latitud && longitud && region && comuna && !cargandoGeocode)

  const GpsIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </svg>
  )

  return (
    <StepWrapper
      step={1}
      totalSteps={5}
      stepLabel="Ubicación"
      title="¿Dónde está el sitio?"
      subtitle="Marca el punto en el mapa o usa tu ubicación actual."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Botón GPS — ícono izquierda, texto centrado */}
        <button
          onClick={handleUseCurrentLocation}
          disabled={cargandoGPS}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            padding: '13px 18px',
            borderRadius: 10,
            border: '1.5px solid var(--accent)',
            background: 'transparent',
            color: 'var(--accent)',
            fontSize: 14,
            fontWeight: 600,
            cursor: cargandoGPS ? 'not-allowed' : 'pointer',
            opacity: cargandoGPS ? 0.6 : 1,
            transition: 'background 0.15s',
          }}
          type="button"
        >
          {cargandoGPS ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}>
              <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          ) : (
            <GpsIcon />
          )}
          <span style={{ flex: 1, textAlign: 'center' }}>
            {cargandoGPS ? 'Obteniendo ubicación...' : 'Usar mi ubicación actual'}
          </span>
        </button>

        {/* Mapa */}
        <div style={{ height: 240, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-m)' }}>
          <MapPicker
            lat={latitud || -33.4489}
            lng={longitud || -70.6693}
            onLocationSelect={handleMapClick}
          />
        </div>

        {/* Coordenadas manuales */}
        <div>
          <p style={S.fieldLabel}>O ingresa coordenadas manualmente</p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={S.fieldLabel}>
                Latitud
                <span style={{ ...S.fieldHint, display: 'block', textTransform: 'none', letterSpacing: 0 }}>-90 a 90</span>
              </label>
              <input
                type="text"
                value={latStr}
                onChange={(e) => setLatStr(e.target.value)}
                placeholder="-33.456789"
                style={{ ...S.input, ...(focusField === 'lat' ? S.inputFocus : S.inputBlur) }}
                onFocus={() => setFocusField('lat')}
                onBlur={() => setFocusField(null)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={S.fieldLabel}>
                Longitud
                <span style={{ ...S.fieldHint, display: 'block', textTransform: 'none', letterSpacing: 0 }}>-180 a 180</span>
              </label>
              <input
                type="text"
                value={lngStr}
                onChange={(e) => setLngStr(e.target.value)}
                placeholder="-70.678901"
                style={{ ...S.input, ...(focusField === 'lng' ? S.inputFocus : S.inputBlur) }}
                onFocus={() => setFocusField('lng')}
                onBlur={() => setFocusField(null)}
              />
            </div>
            <div style={{ flexShrink: 0 }}>
              <StepButton onClick={handleManualApply} disabled={cargando || !latStr || !lngStr} variant="action">
                Aplicar
              </StepButton>
            </div>
          </div>
          {errorCoords && <p style={{ ...S.fieldHint, color: 'var(--ladrillo)', marginTop: 6 }}>{errorCoords}</p>}
        </div>

        {/* Coordenadas activas */}
        {latitud && longitud && (
          <div style={S.successBox}>
            <strong>Coordenadas:</strong> {latitud.toFixed(6)}, {longitud.toFixed(6)}
          </div>
        )}

        {/* Geocoding en curso */}
        {cargandoGeocode && (
          <div style={S.loadingBox}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}>
              <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            Detectando región y comuna...
          </div>
        )}

        {/* Región */}
        <div>
          <label style={S.fieldLabel}>Región <span style={S.required}>*</span></label>
          <select value={region} onChange={(e) => handleRegionChange(e.target.value)}
            disabled={cargandoGeocode}
            style={{ ...S.select, ...(focusField === 'region' ? S.inputFocus : S.inputBlur), opacity: cargandoGeocode ? 0.5 : 1 }}
            onFocus={() => setFocusField('region')} onBlur={() => setFocusField(null)}>
            <option value="">{cargandoGeocode ? 'Cargando...' : 'Selecciona una región'}</option>
            {REGIONES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* Comuna */}
        <div>
          <label style={S.fieldLabel}>Comuna <span style={S.required}>*</span></label>
          <select value={comuna} onChange={(e) => setComuna(e.target.value)}
            disabled={cargandoGeocode || !region || comunasDisponibles.length === 0}
            style={{ ...S.select, ...(focusField === 'comuna' ? S.inputFocus : S.inputBlur), opacity: (cargandoGeocode || !region) ? 0.5 : 1 }}
            onFocus={() => setFocusField('comuna')} onBlur={() => setFocusField(null)}>
            <option value="">
              {cargandoGeocode ? 'Cargando...' : !region ? 'Primero selecciona una región' : 'Selecciona una comuna'}
            </option>
            {comunasDisponibles.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Error general */}
        {error && <div style={S.errorBox}>{error}</div>}

        <StepButton onClick={handleNext} disabled={!canAdvance} fullWidth>Siguiente</StepButton>

      </div>
    </StepWrapper>
  )
}

export default StepUbicacion
