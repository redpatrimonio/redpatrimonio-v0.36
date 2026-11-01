'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

const ROL_LABEL: Record<string, string> = {
  founder: 'Founder',
  partner: 'Partner',
  experto: 'Experto',
  publico: 'Público',
}

const ROL_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  founder: { bg: 'rgba(194,120,64,0.13)', color: 'var(--cobre)', border: 'rgba(194,120,64,0.22)' },
  partner: { bg: 'rgba(143,181,164,0.1)', color: 'var(--accent)', border: 'rgba(143,181,164,0.2)' },
  experto: { bg: 'rgba(78,138,96,0.12)', color: 'var(--musgo)', border: 'rgba(78,138,96,0.22)' },
  publico: { bg: 'rgba(82,96,88,0.15)', color: 'var(--muted)', border: 'rgba(82,96,88,0.25)' },
}

export function Navbar() {
  const { user, usuario, loading } = useAuth()
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')
  const esEquipo = !loading && usuario && ['founder', 'partner', 'experto'].includes(usuario.rol)

  const nombreVisible = usuario?.nombre_completo || user?.email || ''
  const inicial = nombreVisible.trim() ? nombreVisible.trim().charAt(0).toUpperCase() : '?'
  const rolKey = usuario?.rol && ROL_STYLE[usuario.rol] ? usuario.rol : 'publico'
  const rolStyle = ROL_STYLE[rolKey]

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{ backgroundColor: 'var(--nav)', borderColor: 'var(--border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Arqueoportal" width={40} height={40} className="object-contain" />
            <span
              className="font-display font-light text-base tracking-wide"
              style={{ color: 'var(--text)' }}
            >
              Arqueoportal
            </span>
          </Link>

          {/* Links Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { href: '/mapa',      label: 'Mapa' },
              { href: '/ficha',     label: 'Biblioteca' },
              { href: '/dashboard', label: 'Dashboard' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 rounded-md text-sm transition"
                style={{
                  color: isActive(href) ? 'var(--text)' : 'var(--muted)',
                  backgroundColor: isActive(href) ? 'rgba(143,181,164,0.08)' : 'transparent',
                }}
              >
                {label}
              </Link>
            ))}

            {!loading && user && (
              <Link
                href="/reportar-inicio"
                className="px-3 py-1.5 rounded-md text-sm transition"
                style={{
                  color: isActive('/reportar') ? 'var(--text)' : 'var(--muted)',
                  backgroundColor: isActive('/reportar') ? 'rgba(143,181,164,0.08)' : 'transparent',
                }}
              >
                Reportar
              </Link>
            )}

            {esEquipo && (
              <Link
                href="/ingesta"
                className="px-3 py-1.5 rounded-md text-sm transition"
                style={{
                  color: isActive('/ingesta') ? 'var(--accent)' : 'var(--muted)',
                  backgroundColor: isActive('/ingesta') ? 'rgba(143,181,164,0.08)' : 'transparent',
                  borderLeft: '1px solid var(--border)',
                  marginLeft: '4px',
                  paddingLeft: '12px',
                }}
              >
                Ingesta
              </Link>
            )}
          </div>

          {/* Derecha */}
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="w-16 h-7 rounded animate-pulse" style={{ backgroundColor: 'var(--surface-2)' }} />
            ) : user ? (
              <Link
                href="/perfil"
                aria-label="Ir a mi perfil"
                className="flex items-center gap-2 transition"
              >
                {usuario && (
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: rolStyle.bg, color: rolStyle.color, border: `1px solid ${rolStyle.border}` }}
                  >
                    {ROL_LABEL[rolKey]}
                  </span>
                )}
                <span
                  className="text-xs hidden lg:block max-w-[180px] truncate"
                  style={{ color: 'var(--muted)' }}
                >
                  {nombreVisible}
                </span>
                <span
                  aria-hidden="true"
                  className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: 'rgba(143,181,164,0.12)',
                    color: 'var(--accent)',
                    border: `1px solid ${isActive('/perfil') ? 'var(--accent)' : 'var(--border-m)'}`,
                  }}
                >
                  {inicial}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium px-4 py-1.5 rounded-md transition"
                style={{ backgroundColor: 'var(--btn-light)', color: '#111110' }}
              >
                Ingresar
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  )
}
