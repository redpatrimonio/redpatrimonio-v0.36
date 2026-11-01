import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const next = url.searchParams.get('next') || '/perfil'
  let destination = '/perfil'
  try {
    const target = new URL(next, url.origin)
    if (next.startsWith('/') && !next.startsWith('//') && target.origin === url.origin && !['/callback', '/confirm', '/login'].includes(target.pathname)) {
      destination = target.pathname + target.search + target.hash
    }
  } catch {}
  const redirect = (path: string) => {
    const response = NextResponse.redirect(new URL(path, url.origin))
    response.headers.set('Cache-Control', 'no-store')
    response.headers.set('Referrer-Policy', 'no-referrer')
    return response
  }
  const code = url.searchParams.get('code')
  if (url.searchParams.has('error') || !code) return redirect('/login?auth_error=invalid_link')
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error || !data.session) return redirect('/login?auth_error=session_failed')
    return redirect(destination)
  } catch {
    return redirect('/login?auth_error=session_failed')
  }
}
