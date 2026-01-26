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

  const isActive = (path: string) => pathname === path

  return (
    <nav className="border-b border-gray-700 sticky top-0 z-50" style={{ backgroundColor: '#154A4E' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Red Patrimonio Chile" width={40} height={40} className="object-contain" />
            <span className="font-bold text-white hidden sm:block">Red Patrimonio Chile</span>
          </Link>

          {/* Links Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/mapa" className={`font-medium transition ${isActive('/mapa') ? 'text-yellow-300' : 'text-gray-200 hover:text-yellow-300'}`}>
              Mapa
            </Link>

            {loading ? (
              <div className="w-20 h-8 bg-gray-600 animate-pulse rounded"></div>
            ) : user ? (
              <>
                <Link href="/reportar" className={`font-medium transition ${isActive('/reportar') ? 'text-yellow-300' : 'text-gray-200 hover:text-yellow-300'}`}>
                  Reportar
                </Link>
                <Link href="/perfil" className={`font-medium transition ${isActive('/perfil') ? 'text-yellow-300' : 'text-gray-200 hover:text-yellow-300'}`}>
                  Perfil
                </Link>
                <Link href="/mas" className={`font-medium transition ${isActive('/mas') ? 'text-yellow-300' : 'text-gray-200 hover:text-yellow-300'}`}>
                  ...
                </Link>
              </>
            ) : (
              <Link href="/login" className="text-white px-4 py-2 rounded-lg font-medium transition"
                style={{ backgroundColor: '#B6875D' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#9a6f4d'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#B6875D'}>
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* Usuario info Desktop */}
          {user && usuario && (
            <div className="hidden md:flex items-center gap-2 ml-2">
              <span className="text-sm text-gray-200 hidden lg:block">{usuario.nombre_completo || usuario.email}</span>
              <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#B6875D', color: '#fff' }}>
                {usuario.rol}
              </span>
              <button onClick={handleSignOut} className="text-sm text-gray-200 hover:text-red-400 font-medium transition ml-2">
                Salir
              </button>
            </div>
          )}

          {/* Mobile: Solo rol y salir */}
          {user && usuario && (
            <div className="flex md:hidden items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#B6875D', color: '#fff' }}>
                {usuario.rol}
              </span>
              <button onClick={handleSignOut} className="text-sm text-gray-200 hover:text-red-400">
                Salir
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
