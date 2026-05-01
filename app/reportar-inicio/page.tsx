'use client'

import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'

const tiposReporte = [
  {
    id: 'hallazgo',
    titulo: 'Hallazgo Arqueológico',
    descripcion: 'Registra un sitio o hallazgo. Requiere cuenta y revisión experta.',
    icono: '🏛',
    href: '/reportar',
    requiereLogin: true,
    activo: true,
    badge: null,
  },
  {
    id: 'riesgo',
    titulo: 'Arqueología en Riesgo',
    descripcion: 'Reporta una amenaza o daño a un sitio. No necesitas cuenta.',
    icono: '⚠️',
    href: '/reportar/riesgo',
    requiereLogin: false,
    activo: true,
    badge: null,
  },
  {
    id: 'lugar',
    titulo: 'Lugar de Interés',
    descripcion: 'Museos, sitios turísticos u otros lugares de interés patrimonial.',
    icono: '📍',
    href: null,
    requiereLogin: true,
    activo: false,
    badge: 'Próximamente',
  },
  {
    id: 'memoria',
    titulo: 'Memoria e Historia Local',
    descripcion: 'Documenta lugares de historia local, tradición oral o memoria colectiva.',
    icono: '📖',
    href: null,
    requiereLogin: true,
    activo: false,
    badge: 'Próximamente',
  },
]

export default function ReportarInicioPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#10454B' }}>Paso 1 de 4</p>
          <h1 className="text-2xl font-extrabold mb-1.5" style={{ color: '#111827' }}>¿Qué quieres reportar?</h1>
          <p className="text-sm" style={{ color: '#6b7280' }}>
            Selecciona el tipo de registro que mejor describe tu hallazgo.
          </p>
        </div>

        {/* Banner compacto */}
        <div className="rounded-lg border px-3 py-2.5 mb-5 flex items-center justify-between gap-3"
          style={{ borderColor: '#fcd34d', background: '#fffbeb' }}>
          <div className="flex items-start gap-2">
            <span className="text-sm flex-shrink-0">ℹ️</span>
            <p className="text-xs" style={{ color: '#92400e' }}>
              Todo reporte ingresa <strong>pendiente</strong> y es revisado antes de publicarse.
            </p>
          </div>
          <Link href="/resguardos"
            className="text-xs font-semibold flex-shrink-0 underline"
            style={{ color: '#10454B' }}>
            Ver resguardos →
          </Link>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-3">
          {tiposReporte.map((tipo) => {
            const needsLogin = tipo.requiereLogin && !user

            const contenido = (
              <div
                className={`rounded-xl border-2 p-4 flex gap-3.5 items-start transition-all ${
                  !tipo.activo
                    ? 'border-gray-200 bg-white opacity-50 cursor-not-allowed'
                    : needsLogin
                    ? 'border-gray-200 bg-white cursor-default'
                    : 'border-gray-200 bg-white hover:border-[#10454B] hover:shadow-sm cursor-pointer'
                }`}
              >
                <span className="text-2xl mt-0.5 flex-shrink-0">{tipo.icono}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <h2 className="font-bold text-sm" style={{ color: '#111827' }}>{tipo.titulo}</h2>
                    {tipo.badge && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 font-medium" style={{ color: '#6b7280' }}>
                        {tipo.badge}
                      </span>
                    )}
                    {tipo.requiereLogin && tipo.activo && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: '#e8f4f5', color: '#10454B' }}>
                        Requiere cuenta
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: '#6b7280' }}>{tipo.descripcion}</p>
                  {needsLogin && tipo.activo && (
                    <p className="text-xs mt-1.5" style={{ color: '#b45309' }}>
                      Necesitas{' '}
                      <Link href="/auth/login" className="underline font-medium">iniciar sesión</Link>
                      {' '}para continuar.
                    </p>
                  )}
                </div>
                {tipo.activo && !needsLogin && (
                  <span className="text-xl self-center flex-shrink-0" style={{ color: '#d1d5db' }}>›</span>
                )}
              </div>
            )

            if (!tipo.activo || needsLogin) return <div key={tipo.id}>{contenido}</div>
            return (
              <Link key={tipo.id} href={tipo.href!}>
                {contenido}
              </Link>
            )
          })}
        </div>

      </div>
    </div>
  )
}
