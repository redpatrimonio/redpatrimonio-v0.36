'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import StepUbicacion from '@/components/reportar/StepUbicacion'
import StepCaracterizacion from '@/components/reportar/StepCaracterizacion'
import StepEstado from '@/components/reportar/StepEstado'
import StepFotos from '@/components/reportar/StepFotos'
import type { ReporteData } from '@/types/reporte'

export default function ReportarPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [reporteData, setReporteData] = useState<ReporteData>({
    latitud: 0,
    longitud: 0,
    region: '',
    comuna: '',
    nombre: '',
    clasificacionCMN: '',
    categoria: '',
    tipologia: [],
    estadoconservacion: '',
    condicionEmplazamiento: '',
    descripcion: '',
    tipoPropiedad: '',
    nivelacceso: 'Resguardado',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    )
  }

  if (!user) return null

  function handleStepUbicacion(data: {
    latitud: number
    longitud: number
    region: string
    comuna: string
  }) {
    setReporteData({ ...reporteData, ...data })
    setStep(2)
  }

  function handleStepCaracterizacion(data: {
    nombre: string
    clasificacionCMN: string
    categoria: string
    tipologia: string[]
    cultura?: string
    periodo?: string
    declarado_cmn?: string
  }) {
    setReporteData({ ...reporteData, ...data })
    setStep(3)
  }

  function handleStepEstado(data: {
    estadoconservacion: string
    condicionEmplazamiento: string
    descripcion: string
    tipoPropiedad: string
    nivelacceso: string
    usoSuelo?: string
    usoSueloOtro?: string
    amenazas?: string
    contactoPropietarioPosible?: boolean
    contactoPropietarioInfo?: string
    telefonoUsuarioContacto?: string
  }) {
    setReporteData({ ...reporteData, ...data })
    setStep(4)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full mx-1 transition ${s <= step ? 'bg-[#10454B]' : 'bg-gray-300'
                  }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 text-center">
            Paso {step} de 4:{' '}
            {step === 1
              ? 'Ubicación'
              : step === 2
                ? 'Identificación'
                : step === 3
                  ? 'Condición'
                  : 'Fotos'}
          </p>
        </div>

        {/* Steps */}
        {step === 1 && <StepUbicacion onNext={handleStepUbicacion} />}
        {step === 2 && (
          <StepCaracterizacion
            onNext={handleStepCaracterizacion}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepEstado onNext={handleStepEstado} onBack={() => setStep(2)} />
        )}
        {step === 4 && (
          <StepFotos reporteData={reporteData} onBack={() => setStep(3)} />
        )}
      </div>
    </div>
  )
}
