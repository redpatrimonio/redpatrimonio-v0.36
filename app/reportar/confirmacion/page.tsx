'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ConfirmacionContent() {
  const searchParams = useSearchParams()
  const reporteId = searchParams.get('id')

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20 md:pb-4">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">¡Reporte Enviado!</h1>
        <p className="text-gray-600 mb-6">
          Tu reporte ha sido enviado correctamente y será revisado por la comunidad.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Estado: Pendiente (🔴 Rojo)</strong>
            <br />
            Necesita validación de otros usuarios para aparecer en el mapa.
          </p>
        </div>

        {reporteId && <p className="text-xs text-gray-500 mb-6">ID del reporte: {reporteId}</p>}

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/mapa"
            className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium"
          >
            Ver Mapa
          </Link>
          <Link
            href="/perfil"
            className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 font-medium"
          >
            Mis Reportes
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto p-4 pb-20 md:pb-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <ConfirmacionContent />
    </Suspense>
  )
}
