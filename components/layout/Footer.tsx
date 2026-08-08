'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Footer() {
  const { user } = useAuth()
  const pathname = usePathname()

  if (pathname === '/login') return null

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  const itemStyle = (path: string) => ({
    color: isActive(path) ? 'var(--accent)' : 'var(--faint)',
  })

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      style={{ backgroundColor: 'var(--nav)', borderTop: '1px solid var(--border)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex justify-around items-center h-[60px] px-1">

        {/* Inicio */}
        <Link href="/" className="flex flex-col items-center justify-center flex-1 h-full gap-0.5" style={itemStyle('/')}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 3l9 6.5V21H3z" />
          </svg>
          <span className="text-[10px] tracking-wide">Inicio</span>
        </Link>

        {/* Mapa */}
        <Link href="/mapa" className="flex flex-col items-center justify-center flex-1 h-full gap-0.5" style={itemStyle('/mapa')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="12" cy="12" r="8.5" />
            <path strokeLinecap="round" d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3" />
          </svg>
          <span className="text-[10px] tracking-wide">Mapa</span>
        </Link>

        {/* Reportar — central destacado */}
        <Link
          href="/reportar-inicio"
          className="flex flex-col items-center justify-center flex-1 h-full gap-0.5"
          style={{ color: 'var(--accent-pale)' }}
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 44,
              height: 44,
              background: 'rgba(168,207,191,0.07)',
              border: '1.5px solid rgba(168,207,191,0.30)',
              boxShadow: '0 0 0 5px rgba(168,207,191,0.05)',
              marginBottom: 2,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <span className="text-[10px] tracking-wide">Reportar</span>
        </Link>

        {/* Panel */}
        <Link
          href={user ? '/perfil' : '/login'}
          className="flex flex-col items-center justify-center flex-1 h-full gap-0.5"
          style={itemStyle('/perfil')}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path strokeLinecap="round" d="M7 9h10M7 13h6" />
          </svg>
          <span className="text-[10px] tracking-wide">Panel</span>
        </Link>

        {/* Más */}
        <Link href="/mas" className="flex flex-col items-center justify-center flex-1 h-full gap-0.5" style={itemStyle('/mas')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="5" cy="12" r="1.5" fill="currentColor" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            <circle cx="19" cy="12" r="1.5" fill="currentColor" />
          </svg>
          <span className="text-[10px] tracking-wide">Más</span>
        </Link>

      </div>
    </footer>
  )
}
