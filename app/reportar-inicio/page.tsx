'use client'

import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'

const tiposReporte = [
  {
    id: 'hallazgo',
    titulo: 'Hallazgo Arqueol\u00f3gico',
    descripcion: 'Registra un sitio o hallazgo arqueol\u00f3gico. Requiere cuenta. El reporte entra como pendiente y es revisado por un experto antes de publicarse en el mapa.',
    icono: '\ud83c\udfdb',
    href: '/reportar',
    requiereLogin: true,
    activo: true,
    badge: null,
  },
  {
    id: 'riesgo',
    titulo: 'Arqueolog\u00eda en Riesgo',
    descripcion: 'Reporta una amenaza o da\u00f1o a un sitio arqueol\u00f3gico. Puede enviarse sin cuenta. El aviso es revisado internamente.',
    icono: '\u26a0\ufe0f',
    href: '/reportar/riesgo',
    requiereLogin: false,
    activo: true,
    badge: null,
  },
  {
    id: 'lugar',
    titulo: 'Lugar de Inter\u00e9s',
    descripcion: 'Registra museos, sitios tur\u00edsticos u otros lugares de inter\u00e9s patrimonial.',
    icono: '\ud83d\udccd',
    href: null,
    requiereLogin: true,
    activo: false,
    badge: 'Pr\u00f3ximamente',
  },
  {
    id: 'memoria',
    titulo: 'Memoria e Historia Local',
    descripcion: 'Documenta lugares asociados a historia local, tradici\u00f3n oral o memoria colectiva.',
    icono: '\ud83d\udcd6',
    href: null,
    requiereLogin: true,
    activo: false,
    badge: 'Pr\u00f3ximamente',
  },
]

export default function ReportarInicioPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="mb-8 text-center">
          <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-2">Paso 1 de 4</p>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">\u00bfQu\u00e9 quieres reportar?</h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Selecciona el tipo de registro que mejor describe tu hallazgo o contribuci\u00f3n.
            Esto define el formulario y el flujo de revisi\u00f3n.
          </p>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 mb-7 text-sm text-amber-800 flex gap-2">
          <span>\u2139\ufe0f</span>
          <span>
            Todo reporte ingresa con estado <strong>pendiente</strong>. Un experto o partner revisa y aprueba
            antes de que aparezca en el mapa p\u00fablico. Los hallazgos arqueol\u00f3gicos con coordenadas sensibles
            se publican con <strong>\u00e1rea difusa de 300m</strong> hasta su aprobaci\u00f3n.
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {tiposReporte.map((tipo) => {
            const needsLogin = tipo.requiereLogin && !user

            const contenido = (
              <div
                className={`rounded-xl border-2 p-5 flex gap-4 items-start transition-all ${
                  !tipo.activo
                    ? 'border-gray-200 bg-white opacity-50 cursor-not-allowed'
                    : 'border-gray-200 bg-white hover:border-[#154A4E] hover:shadow-sm cursor-pointer'
                }`}
              >
                <span className="text-3xl mt-0.5">{tipo.icono}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-semibold text-gray-800">{tipo.titulo}</h2>
                    {tipo.badge && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                        {tipo.badge}
                      </span>
                    )}
                    {tipo.requiereLogin && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: '\u0023EEF4F4', color: '\u0023154A4E' }}
                      >
                        Requiere cuenta
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{tipo.descripcion}</p>
                  {needsLogin && tipo.activo && (
                    <p className="text-xs text-amber-700 mt-2">
                      Necesitas{' '}
                      <Link href="/login" className="underline font-medium">iniciar sesi\u00f3n</Link>
                      {' '}para continuar con este tipo de reporte.
                    </p>
                  )}
                </div>
                {tipo.activo && !needsLogin && (
                  <span className="text-gray-300 text-xl self-center">\u203a</span>
                )}
              </div>
            )

            if (!tipo.activo) return <div key={tipo.id}>{contenido}</div>
            if (needsLogin) return <div key={tipo.id}>{contenido}</div>
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
