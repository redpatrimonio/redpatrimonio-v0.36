'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get('next') || '/perfil'

  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [loadingEmail, setLoadingEmail] = useState(false)
  const [emailEnviado, setEmailEnviado] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push(nextUrl)
      }
    })
  }, [router, supabase, nextUrl])

  async function handleGoogleLogin() {
    setErrorMsg(null)
    setLoadingGoogle(true)
    try {
      const redirectTarget = `${window.location.origin}/callback?next=${encodeURIComponent(nextUrl)}`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTarget,
        },
      })
      if (error) throw error
    } catch (error: any) {
      console.error('Error en Google login:', error)
      setErrorMsg(error?.message || 'Error al conectar con Google')
      setLoadingGoogle(false)
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)

    const emailLimpio = email.trim()
    if (!emailLimpio || !emailLimpio.includes('@')) {
      setErrorMsg('Ingresa un correo electrónico válido')
      return
    }

    setLoadingEmail(true)
    try {
      const redirectTarget = `${window.location.origin}/callback?next=${encodeURIComponent(nextUrl)}`
      const { error } = await supabase.auth.signInWithOtp({
        email: emailLimpio,
        options: {
          emailRedirectTo: redirectTarget,
        },
      })
      if (error) throw error
      setEmailEnviado(true)
    } catch (error: any) {
      console.error('Error enviando magic link:', error)
      setErrorMsg(error?.message || 'No pudimos enviar el enlace. Intenta nuevamente.')
    } finally {
      setLoadingEmail(false)
    }
  }

  return (
    <div
      className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div
        className="w-full max-w-[420px] rounded-2xl p-7 md:p-9 flex flex-col gap-6"
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)',
        }}
      >
        {/* Encabezado */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="flex items-center gap-2">
            <span className="block w-5 h-px" style={{ backgroundColor: 'var(--accent)', opacity: 0.6 }} />
            <span
              className="text-[10px] font-medium tracking-widest uppercase"
              style={{ color: 'var(--accent)', opacity: 0.85 }}
            >
              Patrimonio arqueológico
            </span>
            <span className="block w-5 h-px" style={{ backgroundColor: 'var(--accent)', opacity: 0.6 }} />
          </div>

          <Link href="/" className="my-1 opacity-90 hover:opacity-100 transition">
            <Image
              src="/logo.png"
              alt="ArqueoPortal"
              width={140}
              height={140}
              className="object-contain"
            />
          </Link>

          <div>
            <h1
              className="font-display font-light text-2xl md:text-3xl leading-tight"
              style={{ color: 'var(--text)' }}
            >
              ArqueoPortal
            </h1>
            <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--muted)' }}>
              Accede a la plataforma para documentar, consultar y resguardar sitios arqueologicos.
            </p>
          </div>
        </div>

        {/* Mensaje de error */}
        {errorMsg && (
          <div
            className="text-xs p-3 rounded-lg leading-relaxed"
            style={{
              backgroundColor: 'rgba(168,80,64,0.12)',
              border: '1px solid rgba(168,80,64,0.3)',
              color: 'var(--ladrillo)',
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Opción 1: Google OAuth */}
        <button
          onClick={handleGoogleLogin}
          disabled={loadingGoogle || loadingEmail}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: '#FFFFFF',
            color: '#1F1F1F',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {loadingGoogle ? 'Conectando con Google…' : 'Continuar con Google'}
        </button>

        {/* Separador */}
        <div className="flex items-center gap-3">
          <span className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
          <span className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--faint)' }}>
            o con tu correo
          </span>
          <span className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
        </div>

        {/* Opción 2: Magic Link */}
        {emailEnviado ? (
          <div
            className="p-4 rounded-xl flex flex-col gap-2 text-center"
            style={{
              backgroundColor: 'rgba(143,181,164,0.08)',
              border: '1px solid rgba(143,181,164,0.25)',
            }}
          >
            <div className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
              ✓ Enlace de acceso enviado
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text)' }}>
              Revisa tu bandeja de entrada en <strong className="font-semibold">{email}</strong>.
            </p>
            <p className="text-[11px] leading-relaxed mt-1" style={{ color: 'var(--muted)' }}>
              Haz clic en el enlace del correo para ingresar automáticamente. No necesitas contraseña. (Revisa también Spam).
            </p>
            <button
              onClick={() => { setEmailEnviado(false); setEmail('') }}
              className="text-[11px] underline mt-2 transition"
              style={{ color: 'var(--muted)' }}
            >
              Usar otro correo
            </button>
          </div>
        ) : (
          <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5 text-left">
              <label
                htmlFor="email"
                className="text-[11px] uppercase tracking-wider font-medium"
                style={{ color: 'var(--muted)' }}
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="tu.nombre@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loadingEmail || loadingGoogle}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm transition outline-none"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  color: 'var(--text)',
                  border: '1px solid var(--border-m)',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-m)')}
              />
            </div>

            <button
              type="submit"
              disabled={loadingEmail || loadingGoogle}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--btn-light)',
                color: '#111110',
              }}
            >
              {loadingEmail ? 'Enviando enlace…' : 'Enviar enlace de acceso'}
            </button>
            <p className="text-[11px] text-center leading-snug" style={{ color: 'var(--faint)' }}>
              Te enviaremos un enlace a tu correo para ingresar a validarlo.
            </p>
          </form>
        )}

        {/* Legal */}
        <div className="text-[11px] text-center leading-relaxed pt-2" style={{ color: 'var(--faint)' }}>
          Al ingresar, aceptas nuestros{' '}
          <Link href="/terminos" className="underline hover:text-white transition" style={{ color: 'var(--muted)' }}>
            Términos
          </Link>{' '}
          y nuestra{' '}
          <Link href="/privacidad" className="underline hover:text-white transition" style={{ color: 'var(--muted)' }}>
            Privacidad
          </Link>.
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center text-xs"
          style={{ backgroundColor: 'var(--bg)', color: 'var(--muted)' }}
        >
          Cargando…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
