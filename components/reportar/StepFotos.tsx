'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { ReporteData } from '@/types/reporte'

const supabase = createClient()

interface StepFotosProps {
  reporteData: ReporteData
  onBack: () => void
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

export function StepFotos({ reporteData, onBack }: StepFotosProps) {
  const { user } = useAuth()
  const router = useRouter()

  const [fotos, setFotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])

    if (files.length + fotos.length > 5) {
      setError('Máximo 5 fotos permitidas')
      return
    }

    const invalidFiles = files.filter((f) => f.size > 5 * 1024 * 1024)
    if (invalidFiles.length > 0) {
      setError('Algunas fotos superan los 5MB')
      return
    }

    setError('')
    setFotos([...fotos, ...files])

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  function removeFoto(index: number) {
    setFotos(fotos.filter((_, i) => i !== index))
    setPreviews(previews.filter((_, i) => i !== index))
  }

  async function handleSubmit() {
    if (!user) {
      setError('No estás autenticado')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data: reporte, error: reporteError } = await supabase
        .from('reportes_nuevos')
        .insert({
          id_usuario: user.id,
          autor_reporte: user.email,
          latitud: reporteData.latitud,
          longitud: reporteData.longitud,
          nombre_reporte: reporteData.nombre || 'Sin nombre',
          categoria_general: reporteData.categoria,
          tipologia_especifica: reporteData.tipologia ? [reporteData.tipologia] : null,
          cultura_asociada: reporteData.cultura || null,
          periodo_cronologico: reporteData.periodo || null,
          estado_conservacion: reporteData.estado_conservacion ?? null,
          nivel_acceso: reporteData.nivel_acceso || 'resguardado',
          descripcion_ubicacion: reporteData.descripcion ?? null,
          amenazas: reporteData.amenazas || null,
          region: reporteData.region || null,
          comuna: reporteData.comuna || null,
          recinto_privado: reporteData.recinto_privado || false,
          tipo_riesgo_principal: reporteData.tipo_riesgo || null,
          nivel_proteccion: reporteData.nivel_proteccion || null,
          estado_validacion: 'rojo',
        })
        .select()
        .single()

      if (reporteError) throw reporteError

      if (fotos.length > 0) {
        for (let i = 0; i < fotos.length; i++) {
          const foto = fotos[i]
          const fileName = `reportes/${reporte.id_reporte}/${Date.now()}_${foto.name}`

          const { error: uploadError } = await supabase.storage
            .from('fotos')
            .upload(fileName, foto)

          if (uploadError) {
            console.error('Error subiendo foto:', uploadError)
            continue
          }

          const { data: urlData } = supabase.storage.from('fotos').getPublicUrl(fileName)

          // ✅ CORREGIDO: columnas correctas según tabla reportes_medios
          const { error: medioError } = await supabase.from('reportes_medios').insert({
            id_reporte: reporte.id_reporte,
            url_publica: urlData.publicUrl,
            descripcion_imagen: `Foto ${i + 1}`,
            prioridad_visualizacion: i === 0 ? 1 : 0,
          })

          if (medioError) {
            console.error('Error guardando medio:', medioError)
          }
        }
      }

      router.push('/reportar/confirmacion')
    } catch (err: unknown) {
      console.error('Error enviando reporte:', err)
      setError(getErrorMessage(err) || 'Error al enviar el reporte')
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Paso 4: Fotos del Sitio</h2>
      <p className="text-gray-600 text-sm">Agrega hasta 5 fotos (opcional, máx 5MB cada una)</p>

      <div>
        <label
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition ${
            fotos.length >= 5
              ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
              : 'border-green-400 bg-green-50 hover:bg-green-100'
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <span className="text-3xl mb-2">📷</span>
            <p className="text-sm text-gray-600">
              {fotos.length >= 5 ? 'Máximo alcanzado' : 'Click para seleccionar fotos'}
            </p>
            <p className="text-xs text-gray-500">PNG, JPG (máx 5MB)</p>
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={fotos.length >= 5}
            className="hidden"
          />
        </label>
      </div>

      {previews.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Fotos seleccionadas ({fotos.length}/5)
          </p>
          <div className="grid grid-cols-2 gap-3">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-300"
                />
                <button
                  onClick={() => removeFoto(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  type="button"
                >
                  ×
                </button>
                <p className="text-xs text-gray-500 mt-1 truncate">{fotos[index]?.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          ℹ️ Puedes enviar el reporte sin fotos o agregar fotos más tarde desde tu perfil.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
          type="button"
        >
          ← Atrás
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`flex-1 py-3 rounded-lg font-medium transition ${
            loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'
          }`}
          type="button"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⟳</span>
              Enviando...
            </span>
          ) : (
            'Enviar Reporte ✓'
          )}
        </button>
      </div>
    </div>
  )
}
