import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Rutas que requieren autenticación
  const protectedPaths = [
    '/perfil',
    '/reportar',
    '/mis-reportes',
    '/dashboard',
    '/panel-usuarios',
    '/denuncia',
    '/ficha',
  ]
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isProtectedPath) {
    const { data: profile } = await supabase
      .from('usuarios_autorizados')
      .select('rol')
      .eq('id_usuario', user.id)
      .single()

    const rol = profile?.rol

    // /panel-usuarios — solo founder
    if (request.nextUrl.pathname.startsWith('/panel-usuarios')) {
      if (rol !== 'founder') {
        return NextResponse.redirect(new URL('/mapa', request.url))
      }
    }

    // /dashboard — experto, partner o founder
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      if (!rol || !['experto', 'partner', 'founder'].includes(rol)) {
        return NextResponse.redirect(new URL('/mapa', request.url))
      }
    }

    // /denuncia — solo partner o founder
    if (request.nextUrl.pathname.startsWith('/denuncia')) {
      if (!rol || !['partner', 'founder'].includes(rol)) {
        return NextResponse.redirect(new URL('/mapa', request.url))
      }
    }

    // /ficha — solo partner o founder
    if (request.nextUrl.pathname.startsWith('/ficha')) {
      if (!rol || !['partner', 'founder'].includes(rol)) {
        return NextResponse.redirect(new URL('/mapa', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
