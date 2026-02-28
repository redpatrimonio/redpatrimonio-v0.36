'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import StepUbicacion from '@/components/reportar/StepUbicacion'
import StepCaracterizacion from '@/components/reportar/StepCaracterizacion'
import StepEstado from '@/components/reportar/StepEstado'
import StepMultimedia from '@/components/reportar/StepMultimedia'
import StepFotos from '@/components/reportar/StepFotos'
import type { ReporteData } from '@/types/reporte'
import type { MultimediaData } from '@/components/reportar/StepMultimedia'

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
  const [multimediaData, setMultimediaData] = useState<MultimediaData>({
    publicaciones: [],
    link360: '',
    linkVideo: '',
    link3d: '',
  })

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login')
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    )
  }
  if (!user) return null

  function handleStepUbicacion(data: { latitud: number; longitud: number; region: string; comuna: string }) {
    setReporteData({ ...reporteData, ...data })
    setStep(2)
  }

  function handleStepCaracterizacion(data: {
    nombre: string; clasificacionCMN: string; categoria: string
    tipologia: string[]; cultura?: string; periodo?: string
  }) {
    setReporteData({ ...reporteData, ...data })
    setStep(3)
  }

  function handleStepEstado(data: {
    estadoconservacion: string; condicionEmplazamiento: string; descripcion: string
    tipoPropiedad: string; nivelacceso: string; usoSuelo?: string; usoSueloOtro?: string
    amenazas?: string; contactoPropietarioPosible?: boolean
    contactoPropietarioInfo?: string; telefonoUsuarioContacto?: string
  }) {
    setReporteData({ ...reporteData, ...data })
    setStep(4)
  }

  function handleStepMultimedia(data: MultimediaData) {
    setMultimediaData(data)
    setStep(5)
  }

  const stepLabels: Record<number, string> = {
    1: 'Ubicación',
    2: 'Identificación',
    3: 'Condición',
    4: 'Documentación',
    5: 'Fotos y Videos',
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress — ahora 5 pasos */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full mx-1 transition ${
                  s <= step ? 'bg-[#10454B]' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 text-center">
            Paso {step} de 5: {stepLabels[step]}
          </p>
        </div>

        {step === 1 && <StepUbicacion onNext={handleStepUbicacion} />}
        {step === 2 && <StepCaracterizacion onNext={handleStepCaracterizacion} onBack={() => setStep(1)} />}
        {step === 3 && <StepEstado onNext={handleStepEstado} onBack={() => setStep(2)} />}
        {step === 4 && <StepMultimedia onNext={handleStepMultimedia} onBack={() => setStep(3)} />}
        {step === 5 && <StepFotos reporteData={reporteData} multimediaData={multimediaData} onBack={() => setStep(4)} />}
      </div>
    </div>
  )
}
