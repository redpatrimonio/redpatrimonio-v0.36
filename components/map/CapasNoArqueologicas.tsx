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

function HuellaPlaceholder() {
  return (
    <div style={{
      width: '100%', height: '100px', borderRadius: '8px',
      backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center',
      justifyContent: 'center', marginBottom: '8px',
    }}>
      <svg width="44" height="64" viewBox="0 0 44 64" fill="none"
        xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ opacity: 0.32 }}>
        <path d="M22 62 C10 62 6 50 6 40 C6 30 8 22 12 16 C15 11 18 8 22 8 C26 8 29 11 32 16 C36 22 38 30 38 40 C38 50 34 62 22 62 Z"
          stroke="#1f2937" strokeWidth="1.5" strokeLinejoin="round" />
        <ellipse cx="16" cy="6" rx="4" ry="5.5" stroke="#1f2937" strokeWidth="1.5" />
        <ellipse cx="22" cy="4" rx="3" ry="4.5" stroke="#1f2937" strokeWidth="1.5" />
        <ellipse cx="27.5" cy="5.5" rx="2.8" ry="4" stroke="#1f2937" strokeWidth="1.5" />
        <ellipse cx="32" cy="8" rx="2.4" ry="3.5" stroke="#1f2937" strokeWidth="1.5" />
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

  const bloqueImagen = (() => {
    if (url_imagen && !imgError) {
      return (
        <img src={url_imagen} alt={nombre} onError={() => setImgError(true)}
          style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }} />
      )
    }
    if (url_imagen && imgError) {
      return (
        <div style={{ width: '100%', height: '100px', borderRadius: '8px', backgroundColor: '#f3f4f6',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', marginBottom: '8px' }}>
          {fallbackEmoji}
        </div>
      )
    }
    if (!url_imagen && capa === 'memoria') return <HuellaPlaceholder />
    return null
  })()

  return (
    <div style={{ width: '240px', fontFamily: 'inherit', padding: '12px' }}>
      {bloqueImagen}
      <p style={{ fontWeight: 700, fontSize: '14px', color: '#111827', marginBottom: '4px' }}>{nombre}</p>
      {subcategoria && (
        <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px',
          backgroundColor: '#f3f4f6', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {subcategoria}
        </span>
      )}
      {descripcion && (
        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', lineHeight: '1.4' }}>{descripcion}</p>
      )}
      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            padding: '8px 0', backgroundColor: '#10454B', color: 'white', borderRadius: '8px',
            fontSize: '12px', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.02em' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Abrir en Google Maps
        </a>
        {url_externo && (
          <a href={url_externo} target="_blank" rel="noopener noreferrer"
            style={{ display: 'block', textAlign: 'center', padding: '7px 0',
              backgroundColor: 'white', color: '#10454B', border: '1.5px solid #10454B',
              borderRadius: '8px', fontSize: '12px', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.02em' }}>
            Ver más
          </a>
        )}
      </div>
    </div>
  )
}

// Tipo mínimo requerido por iconCreateFunction — evita depender de @types/leaflet MarkerCluster
type ClusterLike = { getChildCount: () => number }

function crearCluster(color: string, borderColor: string) {
  return function(cluster: ClusterLike) {
    const count = cluster.getChildCount()
    const size = count < 10 ? 30 : count < 50 ? 36 : 42
    return L.divIcon({
      html: `<div style="
        width:${size}px; height:${size}px;
        background:${color};
        border:2px solid ${borderColor};
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
}

const clusterGeografico = crearCluster('#2d6a4f', 'rgba(255,255,255,0.6)')
const clusterMuseo      = crearCluster('#4A6B8A', 'rgba(255,255,255,0.6)')
const clusterTuristico  = crearCluster('#1d3557', 'rgba(255,255,255,0.6)')
const clusterComercial  = crearCluster('#e76f51', 'rgba(255,255,255,0.6)')
const clusterMemoria    = crearCluster('#6b3fa0', 'rgba(255,255,255,0.6)')

const CLUSTER_OPTS = {
  maxClusterRadius: 50,
  disableClusteringAtZoom: 14,
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  chunkedLoading: true,
}

export function CapasNoArqueologicas({ capasActivas }: Props) {
  const { lugares, memoria, loading } = useLugaresCapa()
  const [zoomActual, setZoomActual] = useState(5)

  useMapEvents({
    zoomend: (e) => setZoomActual(e.target.getZoom()),
  })

  if (loading) return null

  const porCapa = (capa: string) =>
    lugares.filter((l: LugarCapa) => {
      if (l.capa !== capa) return false
      const capaKey = capa as keyof EstadoCapas
      if (capaKey in capasActivas && !capasActivas[capaKey]) return false
      if (zoomActual < l.zoom_minimo) return false
      return true
    })

  const geograficos = porCapa('geografico')
  const museos      = porCapa('museo')
  const turisticos  = lugares.filter((l: LugarCapa) => {
    if (l.capa !== 'turistico' && l.capa !== 'lugar_interes') return false
    if (!capasActivas.turistico) return false
    if (zoomActual < l.zoom_minimo) return false
    return true
  })
  const comerciales = lugares.filter((l: LugarCapa) => {
    if (l.capa !== 'comercial' && l.capa !== 'bar_restaurant') return false
    if (!capasActivas.comercial) return false
    if (zoomActual < l.zoom_minimo) return false
    return true
  })
  const memoriaFiltrada = memoria.filter((s: SitioMemoria) => {
    if (!capasActivas.memoria) return false
    if (zoomActual < s.zoom_minimo) return false
    return true
  })

  function iconoLugar(l: LugarCapa): L.DivIcon {
    const capa = l.capa as string
    if (capa === 'geografico')         return iconoPatrimonioNatural
    if (capa === 'patrimonio_natural') return iconoPatrimonioNatural
    if (capa === 'museo')              return iconoMuseo
    if (capa === 'lugar_interes')      return iconoLugarInteres
    if (capa === 'turistico')          return iconoTuristico
    if (capa === 'bar_restaurant')     return iconoBarRestaurant
    return l.es_premium ? iconoComercialPremium : iconoComercial
  }

  function markerLugar(l: LugarCapa) {
    return (
      <Marker key={l.id} position={[l.latitud, l.longitud]} icon={iconoLugar(l)}>
        <Popup>
          <PopupLugar
            nombre={l.nombre}
            descripcion={l.descripcion}
            subcategoria={l.subcategoria}
            url_externo={l.url_externo}
            url_imagen={l.url_imagen}
            capa={l.capa as string}
            latitud={l.latitud}
            longitud={l.longitud}
          />
        </Popup>
      </Marker>
    )
  }

  return (
    <>
      <MarkerClusterGroup iconCreateFunction={clusterGeografico} {...CLUSTER_OPTS}>
        {geograficos.map(markerLugar)}
      </MarkerClusterGroup>

      <MarkerClusterGroup iconCreateFunction={clusterMuseo} {...CLUSTER_OPTS}>
        {museos.map(markerLugar)}
      </MarkerClusterGroup>

      <MarkerClusterGroup iconCreateFunction={clusterTuristico} {...CLUSTER_OPTS}>
        {turisticos.map(markerLugar)}
      </MarkerClusterGroup>

      <MarkerClusterGroup iconCreateFunction={clusterComercial} {...CLUSTER_OPTS}>
        {comerciales.map(markerLugar)}
      </MarkerClusterGroup>

      <MarkerClusterGroup iconCreateFunction={clusterMemoria} {...CLUSTER_OPTS}>
        {memoriaFiltrada.map((s: SitioMemoria) => (
          <Marker key={s.id} position={[s.latitud, s.longitud]} icon={iconoRastrosMemoria}>
            <Popup>
              <PopupLugar
                nombre={s.nombre}
                descripcion={s.descripcion}
                subcategoria={s.que_lo_cubre ?? null}
                url_externo={s.url_publicacion ?? null}
                url_imagen={s.url_imagen}
                capa="memoria"
                latitud={s.latitud}
                longitud={s.longitud}
              />
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </>
  )
}
