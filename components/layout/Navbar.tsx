'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'

export function Navbar() {
  const { user, usuario, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')
  const esEquipo = !loading && usuario && ['founder', 'partner', 'experto'].includes(usuario.rol)

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{ backgroundColor: 'var(--nav)', borderColor: 'var(--border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Red Patrimonio Chile" width={40} height={40} className="object-contain" />
            <span
              className="font-display font-light text-base tracking-wide hidden sm:block"
              style={{ color: 'var(--text)' }}
            >
              RedPatrimonio
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
            ) : user && usuario ? (
              <>
                <span className="text-xs hidden lg:block" style={{ color: 'var(--muted)' }}>
                  {usuario.nombre_completo || usuario.email}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full hidden sm:block"
                  style={{ backgroundColor: 'rgba(143,181,164,0.12)', color: 'var(--accent)' }}
                >
                  {usuario.rol}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-xs px-3 py-1.5 rounded-md transition"
                  style={{ color: 'var(--muted)', border: '1px solid var(--border-m)' }}
                >
                  Salir
                </button>
              </>
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
