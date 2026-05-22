'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function GraciasContenido() {
  const params = useSearchParams()
  const id = params.get('id')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 448, width: '100%', background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border-m)', boxShadow: '0 0 40px rgba(0,0,0,0.3)', padding: '40px 32px', textAlign: 'center' }}>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <Image src="/logo.png" alt="RedPatrimonio" width={72} height={72} style={{ objectFit: 'contain' }} />
        </div>

        <h1 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontWeight: 300,
          fontSize: 'clamp(22px, 5vw, 28px)',
          lineHeight: 1.15,
          color: 'var(--text)',
          marginBottom: 12,
        }}>
          Aviso recibido
        </h1>

        <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text)', marginBottom: 8 }}>
          Tu reporte de <strong>Arqueología en Riesgo</strong> fue enviado correctamente.
        </p>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--muted)', marginBottom: 28 }}>
          El equipo de RedPatrimonio lo revisará y evaluará su urgencia.
          Si dejaste datos de contacto y autorizaste ser contactado/a, te avisaremos si hay novedades.
        </p>

        {id && (
          <div style={{ borderRadius: 10, padding: '10px 14px', marginBottom: 28, textAlign: 'left', background: 'var(--surface-2)', border: '1px solid var(--border-m)' }}>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>Código de seguimiento</p>
            <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--faint)', wordBreak: 'break-all' }}>{id}</p>
          </div>
        )}

        <Link
          href="/reportar-inicio"
          style={{
            display: 'block',
            width: '100%',
            padding: '13px 20px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 500,
            background: 'var(--accent)',
            color: '#111110',
            textDecoration: 'none',
            textAlign: 'center',
            transition: 'opacity 120ms',
          }}
        >
          Enviar otro aviso
        </Link>

      </div>
    </div>
  )
}

export default function GraciasPage() {
  return (
    <Suspense>
      <GraciasContenido />
    </Suspense>
  )
}
