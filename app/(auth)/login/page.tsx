'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const authErrors: Record<string, string> = {
  invalid_link: 'El enlace no es válido, ya fue utilizado o venció. Solicita uno nuevo.',
  session_failed: 'No pudimos iniciar tu sesión. Solicita un enlace nuevo y ábrelo en el mismo navegador donde lo pediste, sin cambiar entre modo privado y normal.',
  confirmation_failed: 'No pudimos confirmar el correo. Intenta nuevamente con un enlace nuevo.',
}

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const requested = params.get('next') || '/perfil'
  let nextUrl = '/perfil'
  if (typeof window !== 'undefined') {
    try {
      const target = new URL(requested, window.location.origin)
      if (requested.startsWith('/') && !requested.startsWith('//') && target.origin === window.location.origin && !['/login', '/callback', '/confirm'].includes(target.pathname)) nextUrl = target.pathname + target.search + target.hash
    } catch {}
  }
  const [supabase] = useState(() => createClient())
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState<'google' | 'email' | null>(null)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const callbackError = authErrors[params.get('auth_error') || ''] || null

  useEffect(() => {
    let active = true
    supabase.auth.getUser().then(({ data }) => {
      if (active && data.user) router.replace(nextUrl)
    }).catch(() => {})
    return () => { active = false }
  }, [supabase, router, nextUrl])

  async function login(method: 'google' | 'email') {
    setError(null)
    setBusy(method)
    try {
      const redirectTo = `${window.location.origin}/callback?next=${encodeURIComponent(nextUrl)}`
      if (method === 'google') {
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: redirectTo } })
        if (error) throw error
        setSent(true)
        setBusy(null)
      }
    } catch {
      setError(method === 'email' ? 'No pudimos enviar el enlace. Espera unos minutos y vuelve a intentarlo.' : 'No pudimos conectar con Google. Intenta nuevamente.')
      setBusy(null)
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="w-full max-w-[420px] rounded-2xl p-7 md:p-9 flex flex-col gap-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)' }}>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="flex items-center gap-2">
            <span className="block w-5 h-px" style={{ backgroundColor: 'var(--accent)', opacity: 0.6 }} />
            <span className="text-[10px] font-medium tracking-widest uppercase" style={{ color: 'var(--accent)', opacity: 0.85 }}>Patrimonio arqueológico</span>
            <span className="block w-5 h-px" style={{ backgroundColor: 'var(--accent)', opacity: 0.6 }} />
          </div>
          <Link href="/" className="my-1 opacity-90 hover:opacity-100 transition"><Image src="/logo.png" alt="ArqueoPortal" width={140} height={140} className="object-contain" /></Link>
          <div>
            <h1 className="font-display font-light text-2xl md:text-3xl leading-tight" style={{ color: 'var(--text)' }}>ArqueoPortal</h1>
            <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--muted)' }}>Accede a la plataforma para documentar, consultar y resguardar sitios arqueologicos.</p>
          </div>
        </div>
        {(error || callbackError) && <div role="alert" className="text-xs p-3 rounded-lg leading-relaxed" style={{ backgroundColor: 'rgba(168,80,64,0.12)', border: '1px solid rgba(168,80,64,0.3)', color: 'var(--text)' }}>{error || callbackError}</div>}
        <button onClick={() => login('google')} disabled={busy !== null} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: '#FFFFFF', color: '#1F1F1F', border: '1px solid rgba(255,255,255,0.2)' }}>
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>{busy === 'google' ? 'Conectando con Google…' : 'Continuar con Google'}
        </button>
        <div className="flex items-center gap-3"><span className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} /><span className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--faint)' }}>o con tu correo</span><span className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} /></div>
        {sent ? <div role="status" className="p-4 rounded-xl text-center flex flex-col gap-2" style={{ backgroundColor: 'rgba(143,181,164,0.08)', border: '1px solid rgba(143,181,164,0.25)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--accent)' }}>✓ Enlace de acceso enviado</p>
          <p className="text-xs" style={{ color: 'var(--text)' }}>Revisa tu bandeja de entrada en {email.trim()}.</p>
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--muted)' }}>Abre el enlace en el mismo navegador donde lo solicitaste, sin cambiar de modo privado a normal. Revisa también Spam. El enlace es de un solo uso.</p>
          <button disabled={busy !== null} onClick={() => { setSent(false); setEmail(''); setError(null) }} className="text-[11px] underline mt-2" style={{ color: 'var(--muted)' }}>Usar otro correo</button>
        </div> : <form onSubmit={e => { e.preventDefault(); login('email') }} className="flex flex-col gap-3">
          <label htmlFor="email" className="text-[11px] uppercase tracking-wider font-medium" style={{ color: 'var(--muted)' }}>Correo electrónico</label>
          <input id="email" type="email" required autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="tu.nombre@ejemplo.com" value={email} onChange={e => setEmail(e.target.value)} disabled={busy !== null} className="w-full px-3.5 py-2.5 rounded-xl text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border-m)', outlineColor: 'var(--accent)' }} />
          <button type="submit" disabled={busy !== null} className="w-full py-2.5 px-4 rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: 'var(--btn-light)', color: '#111110' }}>{busy === 'email' ? 'Enviando enlace…' : 'Enviar enlace de acceso'}</button>
          <p className="text-[11px] text-center leading-snug" style={{ color: 'var(--faint)' }}>Te enviaremos un enlace a tu correo para ingresar a validarlo.</p>
        </form>}
        <div className="text-[11px] text-center leading-relaxed pt-2" style={{ color: 'var(--faint)' }}>Al ingresar, aceptas nuestros <Link href="/terminos" className="underline" style={{ color: 'var(--muted)' }}>Términos</Link> y nuestra <Link href="/privacidad" className="underline" style={{ color: 'var(--muted)' }}>Privacidad</Link>.</div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs" style={{ backgroundColor: 'var(--bg)', color: 'var(--muted)' }}>Cargando…</div>}><LoginForm /></Suspense>
}
