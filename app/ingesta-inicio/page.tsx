'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'

const RAW = 'https://raw.githubusercontent.com/redpatrimonio/redpatrimonio-v0.36/main'

const KIT_ARCHIVOS = [
  {
    nombre: 'Manual de usuario',
    detalle: 'Guía completa del proceso de ingesta · PDF',
    icono: '📖',
    url: `${RAW}/_kit_ingesta/Manual%20de%20usuario%20-%20Kit%20Red%20Patrimonio.pdf`,
    filename: 'Manual_Kit_RedPatrimonio.pdf',
  },
  {
    nombre: 'Instrucciones agente extractor',
    detalle: 'Prompt e instrucciones para Canal A · Markdown',
    icono: '🤖',
    url: `${RAW}/_kit_ingesta/instrucciones_agente_extractor.md`,
    filename: 'instrucciones_agente_extractor.md',
  },
  {
    nombre: 'Plantilla CSV',
    detalle: 'Cabecera oficial con columnas requeridas · CSV',
    icono: '📊',
    url: `${RAW}/_kit_ingesta/plantilla_ingesta_base.csv`,
    filename: 'plantilla_ingesta_base.csv',
  },
]

export default function IngestaInicioPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [modalAbierto, setModalAbierto] = useState(false)

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Acceso restringido.</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '28px 20px 80px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>

        {/* Back */}
        <button
          onClick={() => router.push('/reportar-inicio')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 24, padding: 0 }}
        >
          <span style={{ fontSize: 14 }}>‹</span> Volver
        </button>

        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{ display: 'block', width: 20, height: 1, background: 'var(--cobre)', opacity: 0.6 }} />
          <span style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--cobre)', opacity: 0.8 }}>
            Canal especializado
          </span>
        </div>

        {/* Título */}
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: 'clamp(28px,7vw,36px)', color: 'var(--text)', lineHeight: 1.15, marginBottom: 8 }}>
          Sitios en<br />Publicaciones
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 28, maxWidth: '44ch' }}>
          Extrae sitios arqueológicos y patrimoniales desde estudios publicados o fuentes referenciadas, usando un agente de IA guiado. Los datos generados se suben en formato CSV para revisión del equipo.
        </p>

        {/* Cards de acción */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Kit */}
          <button
            onClick={() => setModalAbierto(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
              borderRadius: 13, border: '1px solid rgba(194,120,64,0.3)',
              background: 'rgba(194,120,64,0.06)', cursor: 'pointer', textAlign: 'left',
              width: '100%',
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10, display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              background: 'rgba(194,120,64,0.12)', fontSize: 18,
            }}>📦</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>Kit de recopilación</p>
              <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
                Manual, instrucciones del agente y plantilla CSV.
              </p>
            </div>
            <span style={{ fontSize: 18, color: 'var(--cobre)', flexShrink: 0 }}>↓</span>
          </button>

          {/* Subir CSV */}
          <button
            onClick={() => router.push('/ingesta')}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
              borderRadius: 13, border: '1px solid rgba(143,181,164,0.25)',
              background: 'rgba(143,181,164,0.06)', cursor: 'pointer', textAlign: 'left',
              width: '100%',
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10, display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              background: 'rgba(143,181,164,0.12)', fontSize: 18,
            }}>📂</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>Subir lote CSV</p>
              <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
                Sube un CSV extraído y adjunta publicaciones de respaldo.
              </p>
            </div>
            <span style={{ fontSize: 18, color: 'var(--accent)', flexShrink: 0 }}>›</span>
          </button>

        </div>

        {/* Nota */}
        <div style={{
          marginTop: 24, padding: '10px 14px', borderRadius: 10,
          border: '1px solid var(--border)', background: 'var(--surface)',
        }}>
          <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }}>
            <span style={{ color: 'var(--accent)', fontWeight: 500 }}>Sin escritura automática.</span>{' '}
            Ningún dato se incorpora al repositorio sin revisión y aprobación del equipo.
          </p>
        </div>

      </div>

      {/* Modal Kit */}
      {modalAbierto && (
        <div
          onClick={() => setModalAbierto(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200, padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border-m)',
              borderRadius: 16, padding: 24, width: '100%', maxWidth: 400,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>Kit de recopilación</p>
              <button
                onClick={() => setModalAbierto(false)}
                style={{ background: 'none', border: 'none', color: 'var(--faint)', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}
              >✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {KIT_ARCHIVOS.map((archivo) => (
                <a
                  key={archivo.filename}
                  href={archivo.url}
                  download={archivo.filename}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 10,
                    border: '1px solid var(--border)', background: 'var(--surface-2)',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s',
                  }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{archivo.icono}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{archivo.nombre}</p>
                      <p style={{ fontSize: 11, color: 'var(--muted)' }}>{archivo.detalle}</p>
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--cobre)', flexShrink: 0 }}>↓</span>
                  </div>
                </a>
              ))}
            </div>

            <p style={{ fontSize: 11, color: 'var(--faint)', textAlign: 'center', marginTop: 16 }}>
              Haz clic fuera para cerrar
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
