'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Footer() {
  const { user } = useAuth()
  const pathname = usePathname()

  // No mostrar en login
  if (pathname === '/login') return null

  const isActive = (path: string) => pathname === path

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden">
      <div className="flex justify-around items-center h-16">
        
        {/* Mapa */}
        <Link href="/mapa" className={`flex flex-col items-center justify-center flex-1 h-full transition ${isActive('/mapa') ? 'text-green-700' : 'text-gray-600'}`}>
          <span className="text-2xl">📍</span>
          <span className="text-xs mt-1">Mapa</span>
        </Link>

        {/* Reportar (solo autenticados) */}
        {user ? (
          <Link href="/reportar" className={`flex flex-col items-center justify-center flex-1 h-full transition ${isActive('/reportar') ? 'text-green-700' : 'text-gray-600'}`}>
            <span className="text-2xl">📝</span>
            <span className="text-xs mt-1">Reportar</span>
          </Link>
        ) : (
          <div className="flex-1"></div>
        )}

        {/* Perfil (autenticados) / Login (no autenticados) */}
        {user ? (
          <Link href="/perfil" className={`flex flex-col items-center justify-center flex-1 h-full transition ${isActive('/perfil') ? 'text-green-700' : 'text-gray-600'}`}>
            <span className="text-2xl">👤</span>
            <span className="text-xs mt-1">Perfil</span>
          </Link>
        ) : (
          <Link href="/login" className="flex flex-col items-center justify-center flex-1 h-full text-gray-600">
            <span className="text-2xl">🔐</span>
            <span className="text-xs mt-1">Entrar</span>
          </Link>
        )}

        {/* Más (siempre visible) */}
        <Link href="/mas" className={`flex flex-col items-center justify-center flex-1 h-full transition ${isActive('/mas') ? 'text-green-700' : 'text-gray-600'}`}>
          <span className="text-2xl">⋯</span>
          <span className="text-xs mt-1">Más</span>
        </Link>

      </div>
    </footer>
  )
}
