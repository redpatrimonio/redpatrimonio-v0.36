'use client'

import { useState } from 'react'
import { COMPENDIOS_DISPONIBLES } from '@/lib/constants/compendios'

interface Props {
  compendiosActivos: string[]
  onChange: (nuevosActivos: string[]) => void
}

export function SelectorCompendios({ compendiosActivos, onChange }: Props) {
  const [abierto, setAbierto] = useState(false)

  function toggleCompendio(slug: string) {
    if (compendiosActivos.includes(slug)) {
      onChange(compendiosActivos.filter(s => s !== slug))
    } else {
      onChange([...compendiosActivos, slug])
    }
  }

  const cantidadActivos = compendiosActivos.length

  return (
    <>
      <div
        className="leaflet-bottom"
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '22px',
          zIndex: 999,
          pointerEvents: 'auto',
        }}
      >
        <button
          onClick={() => setAbierto(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            backgroundColor: cantidadActivos > 0 ? '#10454B' : 'white',
            color: cantidadActivos > 0 ? '#B6875D' : '#10454B',
            border: '1.5px solid #10454B',
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
            letterSpacing: '0.02em',
            transition: 'all 0.15s ease',
          }}
          onMouseOver={e => {
            if (cantidadActivos === 0) e.currentTarget.style.backgroundColor = '#f8f7f5'
          }}
          onMouseOut={e => {
            if (cantidadActivos === 0) e.currentTarget.style.backgroundColor = 'white'
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>Compendios</span>
          {cantidadActivos > 0 && (
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: '#B6875D',
                color: '#10454B',
                fontSize: '11px',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {cantidadActivos}
            </span>
          )}
        </button>
      </div>

      {abierto && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2500,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setAbierto(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              maxWidth: '440px',
              width: '100%',
              padding: '22px 24px 20px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.22)',
              fontFamily: 'inherit',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#B6875D', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                  Capas de investigación
                </p>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#10454B', margin: 0 }}>
                  Compendios arqueológicos
                </h3>
              </div>
              <button
                onClick={() => setAbierto(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '22px',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  lineHeight: 1,
                  padding: '2px 6px',
                }}
              >
                ×
              </button>
            </div>

            <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.45, marginBottom: '16px' }}>
              Activa o apaga colecciones documentales de sitios arqueológicos. Por defecto inician apagadas para no sobrecargar el mapa.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {COMPENDIOS_DISPONIBLES.map(c => {
                const activo = compendiosActivos.includes(c.slug)
                return (
                  <label
                    key={c.slug}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: activo ? '2px solid #10454B' : '1px solid #e5e7eb',
                      backgroundColor: activo ? '#f0f6f6' : '#fafafa',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={activo}
                      onChange={() => toggleCompendio(c.slug)}
                      style={{ marginTop: '3px', accentColor: '#10454B', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                          {c.nombre}
                        </span>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '999px', backgroundColor: '#B6875D', color: 'white' }}>
                          {c.anio}
                        </span>
                      </div>
                      <p style={{ fontSize: '11px', color: '#4b5563', margin: '0 0 4px 0' }}>
                        Autor: <strong style={{ color: '#10454B' }}>{c.autor}</strong>
                      </p>
                      <p style={{ fontSize: '11px', color: '#6b7280', margin: 0, lineHeight: 1.35 }}>
                        {c.descripcionCorta}
                      </p>
                    </div>
                  </label>
                )
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              {cantidadActivos > 0 && (
                <button
                  onClick={() => onChange([])}
                  style={{
                    padding: '8px 14px',
                    backgroundColor: 'white',
                    color: '#6b7280',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Desactivar todos
                </button>
              )}
              <button
                onClick={() => setAbierto(false)}
                style={{
                  padding: '8px 18px',
                  backgroundColor: '#10454B',
                  color: '#B6875D',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  letterSpacing: '0.02em',
                }}
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
