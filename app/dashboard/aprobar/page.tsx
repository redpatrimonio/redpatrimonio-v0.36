'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { esPartnerOMas } from '@/lib/utils/role'

interface Reporte {
  id_reporte: string
  nombre_reporte: string
  latitud: number
  longitud: number
  categoria_general: string
  estado_validacion: string
  autor_reporte: string
  timestamp_creado: string
  region: string
  comuna: string
  cultura_asociada: string
  periodo_cronologico: string
  estado_conservacion: string
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  try {
    return JSON.stringify(err)
  } catch {
    return 'Error desconocido'
  }
}

export default function AprobarReportesPage() {
  const { usuario, loading: authLoading } = useAuth()
  const router = useRouter()
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedReporte, setSelectedReporte] = useState<Reporte | null>(null)
  const [procesando, setProcesando] = useState(false)

  // Verificar permisos (solo Partner+)
  useEffect(() => {
    if (!authLoading && (!usuario || !esPartnerOMas(usuario.rol))) {
      router.push('/')
    }
  }, [usuario, authLoading, router])

  // Cargar reportes AMARILLOS
  useEffect(() => {
    if (usuario && esPartnerOMas(usuario.rol)) {
      cargarReportes()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario])

  async function cargarReportes() {
    try {
      setLoading(true)
      const res = await fetch('/api/reportes?estado=amarillo')

      if (!res.ok) {
        throw new Error('Error cargando reportes')
      }

      const data = await res.json()
      setReportes(data.reportes || [])
      setError('')
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function publicarReporte(id: string) {
    if (!confirm('¿Confirmar publicación? El sitio será visible en el mapa público.')) {
      return
    }

    try {
      setProcesando(true)
      const res = await fetch(`/api/reportes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado_validacion: 'verde' }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al publicar')
      }

      alert('✅ Reporte publicado. Ahora aparece en sitios_master')

      // Recargar lista
      await cargarReportes()
      setSelectedReporte(null)
    } catch (err: unknown) {
      alert(`Error: ${getErrorMessage(err)}`)
    } finally {
      setProcesando(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    )
  }

  if (!usuario || !esPartnerOMas(usuario.rol)) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Aprobar Reportes Revisados</h1>
      <p className="text-gray-600 mb-6">
        Reportes en estado <span className="text-yellow-600 font-semibold">AMARILLO</span> listos
        para publicación
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {reportes.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <p className="text-blue-900 text-lg">✅ No hay reportes pendientes de aprobación</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nombre Sitio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Autor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportes.map((reporte) => (
                <tr key={reporte.id_reporte} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{reporte.nombre_reporte}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{reporte.categoria_general || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {reporte.region || '-'}, {reporte.comuna || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {reporte.autor_reporte?.split('@')[0] || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      🟡 AMARILLO
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => setSelectedReporte(reporte)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Detalle */}
      {selectedReporte && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">{selectedReporte.nombre_reporte}</h2>
              <p className="text-sm text-gray-500 mt-1">ID: {selectedReporte.id_reporte}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Categoría</p>
                  <p className="text-gray-900">{selectedReporte.categoria_general || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Estado</p>
                  <p className="text-yellow-600 font-semibold">
                    🟡 {selectedReporte.estado_validacion.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Región</p>
                  <p className="text-gray-900">{selectedReporte.region || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Comuna</p>
                  <p className="text-gray-900">{selectedReporte.comuna || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Cultura Asociada</p>
                  <p className="text-gray-900">{selectedReporte.cultura_asociada || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Período</p>
                  <p className="text-gray-900">{selectedReporte.periodo_cronologico || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Latitud</p>
                  <p className="text-gray-900">{selectedReporte.latitud}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Longitud</p>
                  <p className="text-gray-900">{selectedReporte.longitud}</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setSelectedReporte(null)}
                disabled={procesando}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
              >
                Cerrar
              </button>
              <button
                onClick={() => publicarReporte(selectedReporte.id_reporte)}
                disabled={procesando}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
              >
                {procesando ? 'Procesando...' : '🌍 Publicar Sitio (Verde)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
