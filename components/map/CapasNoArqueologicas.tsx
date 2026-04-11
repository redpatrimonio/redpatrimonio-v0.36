'use client'

import { Marker, Popup, useMapEvents } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { useState } from 'react'
import { useLugaresCapa } from '@/lib/hooks/useLugaresCapa'
import {
  iconoPatrimonioNatural,
  iconoMuseo,
  iconoLugarInteres,
  iconoTuristico,
  iconoBarRestaurant,
  iconoComercial,
  iconoComercialPremium,
  iconoRastrosMemoria,
} from '@/components/map/IconosCapas'
import type { EstadoCapas } from '@/types/index'
import type { LugarCapa, SitioMemoria } from '@/types/database'
import L from 'leaflet'

interface Props {
  capasActivas: EstadoCapas
}

// SVG huella de pie — formal, trazo fino, sin relleno sólido
function HuellaPlaceholder() {
  return (
    <div style={{
      width: '100%',
      height: '100px',
      borderRadius: '8px',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '8px',
    }}>
      <svg
        width="44"
        height="64"
        viewBox="0 0 44 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ opacity: 0.32 }}
      >
        {/* Planta del pie */}
        <path
          d="M22 62 C10 62 6 50 6 40 C6 30 8 22 12 16 C15 11 18 8 22 8 C26 8 29 11 32 16 C36 22 38 30 38 40 C38 50 34 62 22 62 Z"
          stroke="#1f2937"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Dedo gordo */}
        <ellipse cx="16" cy="6" rx="4" ry="5.5" stroke="#1f2937" strokeWidth="1.5" />
        {/* Segundo dedo */}
        <ellipse cx="22" cy="4" rx="3" ry="4.5" stroke="#1f2937" strokeWidth="1.5" />
        {/* Tercer dedo */}
        <ellipse cx="27.5" cy="5.5" rx="2.8" ry="4" stroke="#1f2937" strokeWidth="1.5" />
        {/* Cuarto dedo */}
        <ellipse cx="32" cy="8" rx="2.4" ry="3.5" stroke="#1f2937" strokeWidth="1.5" />
        {/* Meñique */}
        <ellipse cx="35.5" cy="12" rx="2" ry="3" stroke="#1f2937" strokeWidth="1.5" />
      </svg>
    </div>
  )
}

function PopupLugar({
  nombre, descripcion, subcategoria, url_externo, url_imagen, capa, latitud, longitud
}: {
  nombre: string
  descripcion: string | null
  subcategoria: string | null
  url_externo: string | null
  url_imagen: string | null
  capa?: string
  latitud: number
  longitud: number
}) {
  const [imgError, setImgError] = useState(false)

  const fallbackEmoji =
    capa === 'museo'                                       ? '🏛️' :
    capa === 'lugar_interes'                               ? '🏳️' :
    capa === 'geografico' || capa === 'patrimonio_natural' ? '⛰️' :
    capa === 'turistico'                                   ? '🏴' : '📍'

  const googleMapsUrl = `https://www.google.com/maps?q=${latitud},${longitud}`

  // Bloque de imagen: 3 casos
  // 1. url_imagen existe y carga bien → <img>
  // 2. url_imagen existe pero falla   → emoji fallback
  // 3. url_imagen es null + capa memoria → HuellaPlaceholder SVG
  // 4. url_imagen es null + otra capa → nada
  const bloqueImagen = (() => {
    if (url_imagen && !imgError) {
      return (
        <img
          src={url_imagen}
          alt={nombre}
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }}
        />
      )
    }
    if (url_imagen && imgError) {
      return (
        <div style={{ width: '100%', height: '100px', borderRadius: '8px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', marginBottom: '8px' }}>
          {fallbackEmoji}
        </div>
      )
    }
    if (!url_imagen && capa === 'memoria') {
      return <HuellaPlaceholder />
    }
    return null
  })()

  return (
    <div style={{ width: '240px', fontFamily: 'inherit', padding: '12px' }}>

      {bloqueImagen}

      {/* Nombre */}
      <p style={{ fontWeight: 700, fontSize: '14px', color: '#111827', marginBottom: '4px' }}>{nombre}</p>

      {/* Subcategoria badge */}
      {subcategoria && (
        <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', backgroundColor: '#f3f4f6', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {subcategoria}
        </span>
      )}

      {/* Descripcion */}
      {descripcion && (
        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', lineHeight: '1.4' }}>{descripcion}</p>
      )}

      {/* Botones */}
      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            padding: '8px 0',
            backgroundColor: '#10454B', color: 'white',
            borderRadius: '8px',
            fontSize: '12px', fontWeight: 600,
            textDecoration: 'none',
            letterSpacing: '0.02em',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Abrir en Google Maps
        </a>

        {url_externo && (
          <a
            href={url_externo}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block', textAlign: 'center',
              padding: '7px 0',
              backgroundColor: 'white', color: '#10454B',
              border: '1.5px solid #10454B',
              borderRadius: '8px',
              fontSize: '12px', fontWeight: 600,
              textDecoration: 'none',
              letterSpacing: '0.02em',
            }}
          >
            Ver más
          </a>
        )}
      </div>
    </div>
  )
}

function crearIconoClusterPublico(cluster: L.MarkerCluster) {
  const count = cluster.getChildCount()
  const size = count < 10 ? 30 : count < 50 ? 36 : 42
  return L.divIcon({
    html: `<div style="
      width:${size}px; height:${size}px;
      background:#4B5563;
      border:2px solid rgba(255,255,255,0.6);
      border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      color:white; font-size:${size < 36 ? 11 : 12}px; font-weight:600;
      font-family:inherit; box-shadow:0 2px 6px rgba(0,0,0,0.25);
    ">${count}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

export function CapasNoArqueologicas({ capasActivas }: Props) {
  const { lugares, memoria, loading } = useLugaresCapa()
  const [zoomActual, setZoomActual] = useState(5)

  useMapEvents({
    zoomend: (e) => setZoomActual(e.target.getZoom()),
  })

  if (loading) return null

  const lugaresFiltrados = lugares.filter((lugar: LugarCapa) => {
    const capaKey = lugar.capa as keyof EstadoCapas
    if (capaKey in capasActivas && !capasActivas[capaKey]) return false
    if (zoomActual < lugar.zoom_minimo) return false
    return true
  })

  const memoriaFiltrada = memoria.filter((sitio: SitioMemoria) => {
    if (!capasActivas.memoria) return false
    if (zoomActual < sitio.zoom_minimo) return false
    return true
  })

  return (
    <MarkerClusterGroup
      iconCreateFunction={crearIconoClusterPublico}
      maxClusterRadius={50}
      disableClusteringAtZoom={14}
      spiderfyOnMaxZoom={true}
      showCoverageOnHover={false}
      chunkedLoading={true}
    >
      {lugaresFiltrados.map((lugar: LugarCapa) => {
        const capa = lugar.capa as string
        const icono =
          capa === 'geografico'         ? iconoPatrimonioNatural :
          capa === 'patrimonio_natural'  ? iconoPatrimonioNatural :
          capa === 'museo'               ? iconoMuseo :
          capa === 'lugar_interes'       ? iconoLugarInteres :
          capa === 'turistico'           ? iconoTuristico :
          capa === 'bar_restaurant'      ? iconoBarRestaurant :
          lugar.es_premium               ? iconoComercialPremium : iconoComercial

        return (
          <Marker key={lugar.id} position={[lugar.latitud, lugar.longitud]} icon={icono}>
            <Popup>
              <PopupLugar
                nombre={lugar.nombre}
                descripcion={lugar.descripcion}
                subcategoria={lugar.subcategoria}
                url_externo={lugar.url_externo}
                url_imagen={lugar.url_imagen}
                capa={capa}
                latitud={lugar.latitud}
                longitud={lugar.longitud}
              />
            </Popup>
          </Marker>
        )
      })}

      {memoriaFiltrada.map((sitio: SitioMemoria) => (
        <Marker key={sitio.id} position={[sitio.latitud, sitio.longitud]} icon={iconoRastrosMemoria}>
          <Popup>
            <PopupLugar
              nombre={sitio.nombre}
              descripcion={sitio.descripcion}
              subcategoria={sitio.que_lo_cubre ?? null}
              url_externo={sitio.url_publicacion ?? null}
              url_imagen={sitio.url_imagen}
              capa="memoria"
              latitud={sitio.latitud}
              longitud={sitio.longitud}
            />
          </Popup>
        </Marker>
      ))}
    </MarkerClusterGroup>
  )
}
