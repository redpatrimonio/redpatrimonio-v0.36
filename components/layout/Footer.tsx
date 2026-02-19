'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Footer() {
  const { user, usuario } = useAuth()
  const pathname = usePathname()

  // No mostrar en login
  if (pathname === '/login') return null

  const isActive = (path: string) => pathname === path

  return (
    <footer 
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden shadow-2xl"
      style={{ backgroundColor: '#25494D' }}
    >
      <div className="flex justify-around items-center h-16 px-2">
        
        {/* Mapa */}
        <Link
          href="/mapa"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all rounded-lg ${
            isActive('/mapa') ? 'bg-white/20 scale-105' : 'hover:bg-white/10'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 text-white drop-shadow-md"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
            />
          </svg>
          <span className="text-xs mt-1 text-white font-medium">Mapa</span>
        </Link>

        {/* Reportar - Siempre visible, deshabilitado si no hay login */}
        {user ? (
          <Link
            href="/reportar"
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all rounded-lg ${
              isActive('/reportar') ? 'bg-white/20 scale-105' : 'hover:bg-white/10'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-white drop-shadow-md"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
            <span className="text-xs mt-1 text-white font-medium">Reportar</span>
          </Link>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 h-full opacity-50 pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-white/60"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
            <span className="text-xs mt-1 text-white/60 font-medium">Reportar</span>
          </div>
        )}

        {/* Panel (va a /perfil) - Solo autenticados */}
        {user ? (
          <Link
            href="/perfil"
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all rounded-lg ${
              isActive('/perfil') ? 'bg-white/20 scale-105' : 'hover:bg-white/10'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-white drop-shadow-md"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
              />
            </svg>
            <span className="text-xs mt-1 text-white font-medium">Panel</span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex flex-col items-center justify-center flex-1 h-full transition-all hover:bg-white/10 rounded-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-white drop-shadow-md"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
            <span className="text-xs mt-1 text-white font-medium">Entrar</span>
          </Link>
        )}

        {/* Más */}
        <Link
          href="/mas"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all rounded-lg ${
            isActive('/mas') ? 'bg-white/20 scale-105' : 'hover:bg-white/10'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 text-white drop-shadow-md"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
            />
          </svg>
          <span className="text-xs mt-1 text-white font-medium">Más</span>
        </Link>

      
      </div>
    </footer>
  )
}
