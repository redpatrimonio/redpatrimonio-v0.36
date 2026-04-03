'use client'

import { Marker, Popup, useMapEvents } from 'react-leaflet'
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

interface Props {
  capasActivas: EstadoCapas
}

function PopupLugar({ nombre, descripcion, subcategoria, url_externo, url_imagen }: {
  nombre: string
  descripcion: string | null
  subcategoria: string | null
  url_externo: string | null
  url_imagen: string | null
}) {
  return (
    <div style={{ width: '240px', fontFamily: 'inherit', padding: '12px' }}>
      {url_imagen && (
        <img
          src={url_imagen}
          alt={nombre}
          style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }}
        />
      )}
      <p style={{ fontWeight: 700, fontSize: '14px', color: '#111827', marginBottom: '4px' }}>{nombre}</p>
      {subcategoria && (
        <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', backgroundColor: '#f3f4f6', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {subcategoria}
        </span>
      )}
      {descripcion && (
        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', lineHeight: '1.4' }}>{descripcion}</p>
      )}
      {url_externo && (
        <a
          href={url_externo}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'block', marginTop: '10px', fontSize: '12px', color: '#10454B', fontWeight: 600, textDecoration: 'none' }}
        >
          Ver mas
        </a>
      )}
    </div>
  )
}

export function CapasNoArqueologicas({ capasActivas }: Props) {
  const { lugares, memoria, loading } = useLugaresCapa()
  const [zoomActual, setZoomActual] = useState(6)

  useMapEvents({
    zoomend: (e) => setZoomActual(e.target.getZoom()),
  })

  if (loading) return null

  return (
    <>
      {/* Capas desde lugares_capas */}
      {lugares.map((lugar: LugarCapa) => {
        // Si la capa tiene toggle, respetarlo.
        // Si la capa no tiene toggle aun (capas nuevas), mostrar por defecto.
        const capaKey = lugar.capa as keyof EstadoCapas
        if (capaKey in capasActivas && !capasActivas[capaKey]) return null

        // Zoom minimo controlado por campo en BD
        if (zoomActual < lugar.zoom_minimo) return null

        // Seleccion de icono por valor del campo capa
        const capa = lugar.capa as string
        const icono =
          capa === 'geografico'         ? iconoPatrimonioNatural :
          capa === 'patrimonio_natural'  ? iconoPatrimonioNatural :
          capa === 'museo'               ? iconoMuseo :
          capa === 'lugar_interes'       ? iconoLugarInteres :
          capa === 'turistico'           ? iconoTuristico :
          capa === 'bar_restaurant'      ? iconoBarRestaurant :
          lugar.es_premium                    ? iconoComercialPremium : iconoComercial

        return (
          <Marker key={lugar.id} position={[lugar.latitud, lugar.longitud]} icon={icono}>
            <Popup>
              <PopupLugar
                nombre={lugar.nombre}
                descripcion={lugar.descripcion}
                subcategoria={lugar.subcategoria}
                url_externo={lugar.url_externo}
                url_imagen={lugar.url_imagen}
              />
            </Popup>
          </Marker>
        )
      })}

      {/* Capa rastros de memoria (tabla separada) */}
      {capasActivas.memoria && memoria.map((sitio: SitioMemoria) => {
        if (zoomActual < sitio.zoom_minimo) return null

        return (
          <Marker key={sitio.id} position={[sitio.latitud, sitio.longitud]} icon={iconoRastrosMemoria}>
            <Popup>
              <PopupLugar
                nombre={sitio.nombre}
                descripcion={sitio.descripcion}
                subcategoria={sitio.que_lo_cubre ?? null}
                url_externo={sitio.url_publicacion ?? null}
                url_imagen={sitio.url_imagen}
              />
            </Popup>
          </Marker>
        )
      })}
    </>
  )
}