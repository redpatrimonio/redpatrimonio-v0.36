'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { StepUbicacion } from '@/components/reportar/StepUbicacion'
import { StepCaracterizacion } from '@/components/reportar/StepCaracterizacion'
import { StepEstado } from '@/components/reportar/StepEstado'
import { StepFotos } from '@/components/reportar/StepFotos'

import type { ReporteData } from '@/types/reporte'

export default function ReportarPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [reporteData, setReporteData] = useState<ReporteData>({})

  function handleUbicacionNext(data: { latitud: number; longitud: number }) {
    setReporteData({ ...reporteData, ...data })
    setStep(2)
  }

  function handleCaracterizacionNext(data: {
    categoria: string
    tipologia: string
    cultura?: string
    periodo?: string
  }) {
    setReporteData({ ...reporteData, ...data })
    setStep(3)
  }

  function handleEstadoNext(data: {
    estado_conservacion: string
    nivel_acceso: string
    descripcion: string
    amenazas?: string
  }) {
    setReporteData({ ...reporteData, ...data })
    setStep(4)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Debes iniciar sesión para reportar</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20 md:pb-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reportar Sitio</h1>
        <p className="text-gray-600">Comparte un sitio arqueológico con la comunidad</p>
      </div>

      {/* Progress */}
      <div className="flex justify-between mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`flex-1 h-2 mx-1 rounded ${
              s <= step ? 'bg-green-600' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Steps */}
      {step === 1 && <StepUbicacion onNext={handleUbicacionNext} />}

      {step === 2 && (
        <StepCaracterizacion
          onNext={handleCaracterizacionNext}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <StepEstado
          onNext={handleEstadoNext}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && (
        <StepFotos
          reporteData={reporteData}
          onBack={() => setStep(3)}
        />
      )}
    </div>
  )
}
