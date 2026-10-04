'use client'

import { useState, useRef, useEffect } from 'react'
import { EstadoCapas, CONFIG_CAPAS } from '@/types/index'

interface Props {
  capasActivas: EstadoCapas
  onChange: (capa: keyof EstadoCapas) => void
  compendiosActivos: string[]
  onToggleCompendio: (slug: string) => void
}

const ORDEN: { clave: keyof EstadoCapas; label: string; color: string }[] = [
  { clave: 'lugar_interes', label: CONFIG_CAPAS.lugar_interes.label, color: CONFIG_CAPAS.lugar_interes.color },
  { clave: 'museo', label: 'Museo', color: '#688998' },
  { clave: 'geografico', label: CONFIG_CAPAS.geografico.label, color: CONFIG_CAPAS.geografico.color },
  { clave: 'memoria', label: CONFIG_CAPAS.memoria.label, color: CONFIG_CAPAS.memoria.color },
  { clave: 'turistico', label: CONFIG_CAPAS.turistico.label, color: CONFIG_CAPAS.turistico.color },
  { clave: 'comercial', label: CONFIG_CAPAS.comercial.label, color: CONFIG_CAPAS.comercial.color },
]

export function ToggleCapas({ capasActivas, onChange, compendiosActivos, onToggleCompendio }: Props) {
  const [abierto, setAbierto] = useState(false)
  const contenedorRef = useRef<HTMLDivElement>(null)
  const stehbergActivo = compendiosActivos.includes('stehberg_1975')

  // Cierra el panel si el usuario hace clic fuera de él
  useEffect(() => {
    function handleClickAfuera(e: MouseEvent | TouchEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false)
      }
    }
    if (abierto) {
      document.addEventListener('mousedown', handleClickAfuera)
      document.addEventListener('touchstart', handleClickAfuera)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickAfuera)
      document.removeEventListener('touchstart', handleClickAfuera)
    }
  }, [abierto])

  return (
    <div
      ref={contenedorRef}
      className="leaflet-top leaflet-right"
      style={{ zIndex: 1100, pointerEvents: 'auto' }}
      onClick={e => e.stopPropagation()}
      onDoubleClick={e => e.stopPropagation()}
      onMouseDown={e => e.stopPropagation()}
      onTouchStart={e => e.stopPropagation()}
    >
      <div
        className="leaflet-control"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '6px',
          margin: '10px 10px 0 0',
        }}
      >
        {/* Botón trigger con paleta institucional (#f9f8f5, #10454B, #B6875D) */}
        <button
          type="button"
          onClick={e => {
            e.stopPropagation()
            setAbierto(prev => !prev)
          }}
          title="Capas del mapa"
          aria-label="Capas del mapa"
          style={{
            width: '38px',
            height: '38px',
            backgroundColor: abierto ? '#10454B' : '#f9f8f5',
            border: '1.5px solid #d4d1ca',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.14)',
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
          onMouseOver={e => {
            if (!abierto) e.currentTarget.style.backgroundColor = '#f3f0ec'
          }}
          onMouseOut={e => {
            if (!abierto) e.currentTarget.style.backgroundColor = '#f9f8f5'
          }}
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke={abierto ? '#B6875D' : '#10454B'}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 12l10 5 10-5" />
            <path d="M2 17l10 5 10-5" />
          </svg>
        </button>

        {/* Panel desplegable con paleta institucional (#f9f8f5, #28251d, #10454B, #B6875D) */}
        {abierto && (
          <div
            style={{
              backgroundColor: '#f9f8f5',
              borderRadius: '14px',
              border: '1px solid #d4d1ca',
              boxShadow: '0 8px 26px rgba(40,37,29,0.18)',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              minWidth: '220px',
              maxWidth: '260px',
              fontFamily: 'inherit',
            }}
          >
            {/* Header del panel */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '4px' }}>
              <p style={{ fontSize: '11px', fontWeight: 800, color: '#10454B', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
                Capas del mapa
              </p>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  setAbierto(false)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#7a7974',
                  fontSize: '18px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  lineHeight: 1,
                  padding: '2px 4px',
                }}
                title="Cerrar panel"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            {/* SECCIÓN 1: Capas generales */}
            <p style={{ fontSize: '9px', fontWeight: 700, color: '#B6875D', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '6px', marginBottom: '2px' }}>
              Patrimonio y entorno
            </p>

            {ORDEN.map(({ clave, label, color }) => (
              <label
                key={clave}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  padding: '3px 4px',
                  borderRadius: '6px',
                  transition: 'background-color 0.12s',
                }}
                onMouseOver={e => (e.currentTarget.style.backgroundColor = '#edeae5')}
                onMouseOut={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <input
                  type="checkbox"
                  checked={capasActivas[clave]}
                  onChange={() => onChange(clave)}
                  style={{ accentColor: '#10454B', width: '14px', height: '14px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '12px', color: '#28251d', fontWeight: capasActivas[clave] ? 600 : 400, flex: 1 }}>
                  {label}
                </span>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    opacity: capasActivas[clave] ? 1 : 0.25,
                    flexShrink: 0,
                  }}
                />
              </label>
            ))}

            {/* Divisor sutil */}
            <div style={{ height: '1px', backgroundColor: '#dcd9d5', margin: '6px 0 4px 0' }} />

            {/* SECCIÓN 2: Compendios documentales */}
            <p style={{ fontSize: '9px', fontWeight: 700, color: '#B6875D', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
              Compendios documentales
            </p>

            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                cursor: 'pointer',
                userSelect: 'none',
                padding: '4px',
                borderRadius: '6px',
                transition: 'background-color 0.12s',
                backgroundColor: stehbergActivo ? '#edeae5' : 'transparent',
              }}
              onMouseOver={e => {
                if (!stehbergActivo) e.currentTarget.style.backgroundColor = '#f3f0ec'
              }}
              onMouseOut={e => {
                if (!stehbergActivo) e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <input
                type="checkbox"
                checked={stehbergActivo}
                onChange={() => onToggleCompendio('stehberg_1975')}
                style={{ accentColor: '#10454B', width: '14px', height: '14px', marginTop: '2px', cursor: 'pointer' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#10454B', fontWeight: 700 }}>
                    Stehberg 1975
                  </span>
                  <span style={{ fontSize: '11px' }}>🏺</span>
                </div>
                <p style={{ fontSize: '10px', color: '#7a7974', margin: '1px 0 0 0', lineHeight: 1.25 }}>
                  Chile Central · 107 sitios
                </p>
              </div>
            </label>

          </div>
        )}

      </div>
    </div>
  )
}
