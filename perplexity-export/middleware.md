## middleware.ts
```typescript
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
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Rutas protegidas - requieren autenticación
  const protectedPaths = ['/perfil', '/reportar', '/mis-reportes', '/dashboard', '/panel-usuarios']
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si hay usuario autenticado, verificar permisos por rol
  if (user && isProtectedPath) {
    console.log('🔍 Middleware - User ID:', user.id) // DEBUG
    
    const { data: profile, error } = await supabase
      .from('usuarios_autorizados')
      .select('rol')
      .eq('id_usuario', user.id)
      .single()

    console.log('🔍 Middleware - Profile:', profile) // DEBUG
    console.log('🔍 Middleware - Error:', error) // DEBUG

    // Panel usuarios - solo founder
    if (request.nextUrl.pathname.startsWith('/panel-usuarios')) {
      if (!profile || profile.rol !== 'founder') {
        console.log('❌ Acceso denegado a /panel-usuarios - Rol:', profile?.rol) // DEBUG
        return NextResponse.redirect(new URL('/mapa', request.url))
      }
      console.log('✅ Acceso permitido a /panel-usuarios') // DEBUG
    }

    // Dashboard - experto, partner o founder
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      if (!profile || !['experto', 'partner', 'founder'].includes(profile.rol)) {
        console.log('❌ Acceso denegado a /dashboard - Rol:', profile?.rol) // DEBUG
        return NextResponse.redirect(new URL('/mapa', request.url))
      }
      console.log('✅ Acceso permitido a /dashboard') // DEBUG
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```
