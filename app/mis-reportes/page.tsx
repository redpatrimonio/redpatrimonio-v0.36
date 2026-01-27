'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

interface Reporte {
  id_reporte: string
  nombre_reporte: string
  region: string | null
  comuna: string | null
  timestamp_creado: string
  estado_validacion: string
  categoria_general: string | null
}

export default function MisReportesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [fotos, setFotos] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      cargarReportes()
    }
  }, [user])

  async function cargarReportes() {
    if (!user) return
    
    try {
      setLoading(true)
      const { data, error: reportesError } = await supabase
        .from('reportes_nuevos')
        .select('id_reporte, nombre_reporte, region, comuna, timestamp_creado, estado_validacion, categoria_general')
        .eq('id_usuario', user.id)
        .order('timestamp_creado', { ascending: false })

      if (reportesError) throw reportesError
      setReportes(data || [])

      // Cargar primera foto de cada reporte
      const fotosMap: Record<string, string> = {}
      for (const reporte of data || []) {
        const { data: fotoData } = await supabase
          .from('reportes_medios')
          .select('url_publica')
          .eq('id_reporte', reporte.id_reporte)
          .order('prioridad_visualizacion', { ascending: false })
          .limit(1)

        if (fotoData && fotoData.length > 0) {
          fotosMap[reporte.id_reporte] = fotoData[0].url_publica
        }
      }
      setFotos(fotosMap)
    } catch (err) {
      console.error('Error cargando reportes:', err)
      setError('Error al cargar reportes')
    } finally {
      setLoading(false)
    }
  }

  function getEstadoBadge(estado: string) {
    const config = {
      rojo: { bg: 'bg-red-100', text: 'text-red-700', label: 'PENDIENTE' },
      amarillo: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'EN REVISIÓN' },
      verde: { bg: 'bg-green-100', text: 'text-green-700', label: 'PUBLICADO' },
    }[estado] || { bg: 'bg-gray-100', text: 'text-gray-700', label: estado.toUpperCase() }

    return (
      <span className={`px-2 py-0.5 ${config.bg} ${config.text} rounded-full font-medium text-xs`}>
        {config.label}
      </span>
    )
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando tus reportes...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-g
