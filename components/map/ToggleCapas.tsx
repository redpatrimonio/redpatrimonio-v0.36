'use client'

import { useState } from 'react'
import { EstadoCapas, CONFIG_CAPAS } from '@/types/index'

interface Props {
  capasActivas: EstadoCapas
  onChange: (capa: keyof EstadoCapas) => void
}

const ORDEN: { clave: keyof EstadoCapas; label: string; color: string }[] = [
  { clave: 'geografico', label: CONFIG_CAPAS.geografico.label, color: CONFIG_CAPAS.geografico.color },
  { clave: 'turistico',  label: CONFIG_CAPAS.turistico.label,  color: CONFIG_CAPAS.turistico.color },
  { clave: 'comercial',  label: CONFIG_CAPAS.comercial.label,  color: CONFIG_CAPAS.comercial.color },
  { clave: 'memoria',    label: CONFIG_CAPAS.memoria.label,    color: CONFIG_CAPAS.memoria.color },
]

export function ToggleCapas({ capasActivas, onChange }: Props) {
  const [abierto, setAbierto] = useState(false)

  return (
    <div
      className="leaflet-top leaflet-right"
      style={{ marginTop: '10px', marginRight: '10px' }}
    >
      <div className="leaflet-control" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>

        {/* Botón trigger */}
        <button
          onClick={() => setAbierto(v => !v)}
          title="Capas del mapa"
          style={{
            width: '36px', height: '36px',
            backgroundColor: abierto ? '#10454B' : 'white',
            border: '1px solid rgba(0,0,0,0.25)',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 1px 5px rgba(0,0,0,0.2)',
            transition: 'background-color 0.15s',
          }}
        >
          {/* Ícono de capas (3 líneas apiladas) */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke={abierto ? 'white' : '#374151'} strokeWidth="2" strokeLinecap="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 12l10 5 10-5"/>
            <path d="M2 17l10 5 10-5"/>
          </svg>
        </button>

        {/* Panel desplegable */}
        {abierto && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 5px rgba(0,0,0,0.2)',
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            minWidth: '175px',
          }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>
              Capas visibles
            </p>

            {ORDEN.map(({ clave, label, color }) => (
              <label
                key={clave}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}
              >
                <input
                  type="checkbox"
                  checked={capasActivas[clave]}
                  onChange={() => onChange(clave)}
                  style={{ accentColor: color, width: '14px', height: '14px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '12px', color: '#374151', fontWeight: capasActivas[clave] ? 600 : 400 }}>
                  {label}
                </span>
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  backgroundColor: color,
                  opacity: capasActivas[clave] ? 1 : 0.25,
                  marginLeft: 'auto', flexShrink: 0,
                }}/>
              </label>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
