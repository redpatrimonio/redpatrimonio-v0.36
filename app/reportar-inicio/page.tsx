'use client'

import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'

const RAW = 'https://raw.githubusercontent.com/redpatrimonio/redpatrimonio-v0.36/main'

const tiposReporte = [
  {
    id: 'hallazgo',
    titulo: 'Hallazgo Arqueológico',
    descripcion: 'Registra un sitio o hallazgo. Inicia la documentación formal.',
    href: '/reportar',
    requiereLogin: true,
    activo: true,
    badge: null,
    iconoBg: 'rgba(143,181,164,0.1)',
    iconoColor: 'var(--accent)',
    icono: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: 'riesgo',
    titulo: 'Arqueología en Riesgo',
    descripcion: 'Reporta daños a un sitio o un hallazgo en peligro. Puede ser anónimo.',
    href: '/reportar/riesgo',
    requiereLogin: false,
    activo: true,
    badge: null,
    iconoBg: 'rgba(155,104,69,0.12)',
    iconoColor: 'var(--tierra)',
    icono: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    id: 'lugar',
    titulo: 'Lugar de Interés',
    descripcion: 'Museos, sitios turísticos y lugares de interés patrimonial.',
    href: null,
    requiereLogin: true,
    activo: false,
    badge: 'Próximamente',
    iconoBg: 'rgba(82,96,88,0.12)',
    iconoColor: 'var(--faint)',
    icono: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    id: 'memoria',
    titulo: 'Memoria e Historia Local',
    descripcion: 'Historia local, tradición oral y memoria colectiva.',
    href: null,
    requiereLogin: true,
    activo: false,
    badge: 'Próximamente',
    iconoBg: 'rgba(82,96,88,0.12)',
    iconoColor: 'var(--faint)',
    icono: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </svg>
    ),
  },
]

export default function ReportarInicioPage() {
  const { user } = useAuth()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '28px 20px 80px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>

        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{ display: 'block', width: 20, height: 1, background: 'var(--accent)', opacity: 0.6 }} />
          <span style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', opacity: 0.8 }}>
            Paso 1 de 4
          </span>
        </div>

        {/* Título */}
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: 'clamp(28px,7vw,36px)', color: 'var(--text)', lineHeight: 1.15, marginBottom: 8 }}>
          Selecciona el tipo<br />de registro
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 20, maxWidth: '44ch' }}>
          Elige el tipo de registro que describe mejor lo que quieres documentar.
        </p>

        {/* Notice */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
          padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(155,104,69,0.22)',
          background: 'rgba(155,104,69,0.07)', marginBottom: 20,
        }}>
          <p style={{ fontSize: 11, color: 'var(--tierra)', lineHeight: 1.6 }}>
            Todo reporte ingresado es <strong style={{ fontWeight: 500 }}>privado</strong> y será revisado por nuestro equipo, antes de incorporarse al mapa.
          </p>
          <Link href="/resguardos" style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'underline', whiteSpace: 'nowrap', flexShrink: 0, marginTop: 1 }}>
            Ver resguardos →
          </Link>
        </div>

        {/* Cards principales */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tiposReporte.map((tipo) => {
            const needsLogin = tipo.requiereLogin && !user

            const inner = (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '15px 16px',
                borderRadius: 13, border: '1px solid var(--border)', background: 'var(--surface)',
                opacity: !tipo.activo ? 0.4 : 1,
                cursor: !tipo.activo ? 'default' : needsLogin ? 'default' : 'pointer',
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  background: tipo.iconoBg, color: tipo.iconoColor,
                }}>
                  {tipo.icono}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                    {tipo.titulo}
                    {tipo.badge && (
                      <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 20, fontWeight: 500, letterSpacing: '0.04em', background: 'rgba(82,96,88,0.18)', color: 'var(--faint)', border: '1px solid rgba(82,96,88,0.25)' }}>
                        {tipo.badge}
                      </span>
                    )}
                    {tipo.requiereLogin && tipo.activo && (
                      <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 20, fontWeight: 500, letterSpacing: '0.04em', background: 'rgba(143,181,164,0.08)', color: 'var(--accent)', border: '1px solid rgba(143,181,164,0.18)' }}>
                        Requiere cuenta
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3, lineHeight: 1.5 }}>
                    {tipo.descripcion}
                  </div>
                  {needsLogin && tipo.activo && (
                    <p style={{ fontSize: 11, color: 'var(--tierra)', marginTop: 5 }}>
                      Necesitas{' '}
                      <Link href="/auth/login" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>iniciar sesión</Link>
                      {' '}para continuar.
                    </p>
                  )}
                </div>
                {tipo.activo && !needsLogin && (
                  <span style={{ color: 'var(--faint)', fontSize: 18, flexShrink: 0 }}>›</span>
                )}
              </div>
            )

            if (!tipo.activo || needsLogin) return <div key={tipo.id}>{inner}</div>
            return <Link key={tipo.id} href={tipo.href!} style={{ textDecoration: 'none' }}>{inner}</Link>
          })}
        </div>

        {/* Separador */}
        <div style={{ margin: '20px 0 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--faint)' }}>Canal especializado</span>
          <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Card Sitios en Publicaciones */}
        {user ? (
          <Link href="/ingesta-inicio" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '15px 16px',
              borderRadius: 13, border: '1px solid rgba(194,120,64,0.25)',
              background: 'rgba(194,120,64,0.05)', cursor: 'pointer',
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10, display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                background: 'rgba(194,120,64,0.12)', color: 'var(--cobre)',
              }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 7 }}>
                  Sitios en Publicaciones
                  <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 20, fontWeight: 500, letterSpacing: '0.04em', background: 'rgba(194,120,64,0.12)', color: 'var(--cobre)', border: '1px solid rgba(194,120,64,0.2)' }}>
                    Equipo
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3, lineHeight: 1.5 }}>
                  Extrae sitios con IA de estudios publicados o fuentes referenciadas.
                </div>
              </div>
              <span style={{ color: 'var(--faint)', fontSize: 18, flexShrink: 0 }}>›</span>
            </div>
          </Link>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '15px 16px',
            borderRadius: 13, border: '1px solid var(--border)',
            background: 'var(--surface)', opacity: 0.45, cursor: 'default',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              background: 'rgba(82,96,88,0.12)', color: 'var(--faint)',
            }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 7 }}>
                Sitios en Publicaciones
                <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 20, fontWeight: 500, letterSpacing: '0.04em', background: 'rgba(82,96,88,0.18)', color: 'var(--faint)', border: '1px solid rgba(82,96,88,0.25)' }}>
                  Requiere cuenta
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3, lineHeight: 1.5 }}>
                Extrae sitios con IA de estudios publicados o fuentes referenciadas.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
