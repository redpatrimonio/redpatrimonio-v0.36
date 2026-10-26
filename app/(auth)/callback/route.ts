import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const nextParam = requestUrl.searchParams.get('next')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirigir a la ruta solicitada si es relativa y segura, o a /perfil por defecto
  let destination = '/perfil'
  if (nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')) {
    destination = nextParam
  }

  return NextResponse.redirect(`${origin}${destination}`)
}
