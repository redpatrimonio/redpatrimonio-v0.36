'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function GraciasContenido() {
  const params = useSearchParams()
  const id = params.get('id')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Reporte recibido</h1>
        <p className="text-gray-500 text-sm mb-4">
          Tu aviso de Arqueolog\u00eda en Riesgo fue enviado correctamente.
          El equipo de Red Patrimonio lo revisar\u00e1 y evaluar\u00e1 la urgencia.
        </p>

        {id && (
          <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 mb-6">
            <p className="text-xs text-gray-400 mb-1">C\u00f3digo de seguimiento</p>
            <p className="font-mono text-xs text-gray-600 break-all">{id}</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Link href="/mapa"
            className="w-full py-3 rounded-lg font-semibold text-white text-sm"
            style={{ backgroundColor: '#154A4E' }}>
            Ver mapa
          </Link>
          <Link href="/reportar-inicio"
            className="w-full py-3 rounded-lg border-2 border-gray-200 font-semibold text-gray-600 text-sm hover:border-gray-400 transition">
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
