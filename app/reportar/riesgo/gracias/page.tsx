'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function GraciasContenido() {
  const params = useSearchParams()
  const id = params.get('id')

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f2f5f6' }}>
      <div className="max-w-md w-full bg-white rounded-2xl border p-8 text-center" style={{ borderColor: '#dde4e6', boxShadow: '0 0 40px rgba(0,0,0,.06)' }}>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="RedPatrimonio"
            width={80}
            height={80}
            className="object-contain"
          />
        </div>

        <h1 className="text-xl font-bold mb-3" style={{ color: '#111827' }}>
          Aviso recibido
        </h1>

        <p className="text-sm leading-relaxed mb-2" style={{ color: '#374151' }}>
          Tu reporte de <strong>Arqueología en Riesgo</strong> fue enviado correctamente.
        </p>
        <p className="text-sm leading-relaxed mb-6" style={{ color: '#6b7280' }}>
          El equipo de RedPatrimonio lo revisará y evaluará su urgencia. Si dejaste datos de contacto, te avisaremos si hay novedades.
        </p>

        {id && (
          <div className="rounded-xl px-4 py-3 mb-6 text-left" style={{ background: '#f2f5f6', border: '1px solid #dde4e6' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: '#9ca3af' }}>Código de seguimiento</p>
            <p className="font-mono text-xs break-all" style={{ color: '#374151' }}>{id}</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Link
            href="/mapa"
            className="w-full py-3.5 rounded-xl font-bold text-white text-sm"
            style={{ backgroundColor: '#10454B' }}
          >
            Ver en el mapa
          </Link>
          <Link
            href="/reportar-inicio"
            className="w-full py-3.5 rounded-xl border-2 font-bold text-sm transition"
            style={{ borderColor: '#dde4e6', color: '#374151' }}
          >
            Enviar otro reporte
          </Link>
        </div>

      </div>
    </div>
  )
}

export default function GraciasPage() {
  return (
    <Suspense>
      <GraciasContenido />
    </Suspense>
  )
}
