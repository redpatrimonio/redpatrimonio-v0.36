'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { ReporteData } from '@/types/reporte'
import type { MultimediaData } from '@/components/reportar/StepMultimedia'

const supabase = createClient()

interface ArchivoItem {
  file: File
  preview: string   // base64 para fotos, vacío para videos
  descripcion: string
  tipo: 'foto' | 'video'
}

interface StepFotosProps {
  reporteData: ReporteData
  multimediaData: MultimediaData
  onBack: () => void
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  try { return JSON.stringify(err) } catch { return 'Error desconocido' }
}

export function StepFotos({ reporteData, multimediaData, onBack }: StepFotosProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [archivos, setArchivos] = useState<ArchivoItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [progreso, setProgreso] = useState('')

  const fotos = archivos.filter(a => a.tipo === 'foto')
  const videos = archivos.filter(a => a.tipo === 'video')

  function handleFotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length + fotos.length > 5) {
      setError('Máximo 5 fotos permitidas')
      return
    }
    const invalidas = files.filter(f => f.size > 10 * 1024 * 1024)
    if (invalidas.length > 0) {
      setError('Algunas fotos superan los 10MB')
      return
    }
    setError('')
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setArchivos(prev => [...prev, {
          file,
          preview: reader.result as string,
          descripcion: '',
          tipo: 'foto',
        }])
      }
      reader.readAsDataURL(file)
    })
  }

  function handleVideoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length + videos.length > 3) {
      setError('Máximo 3 videos permitidos')
      return
    }
    const invalidos = files.filter(f => f.size > 50 * 1024 * 1024)
    if (invalidos.length > 0) {
      setError('Algunos videos superan los 50MB')
      return
    }
    setError('')
    files.forEach(file => {
      setArchivos(prev => [...prev, {
        file,
        preview: '',
        descripcion: '',
        tipo: 'video',
      }])
    })
  }

  function updateDescripcion(index: number, descripcion: string) {
    // index es global dentro de archivos[]
    setArchivos(prev => prev.map((a, i) => i === index ? { ...a, descripcion } : a))
  }

  function removeArchivo(index: number) {
    setArchivos(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit() {
    if (!user) { setError('No estás autenticado'); return }
    setLoading(true)
    setError('')

    try {
      // ── 1. INSERT reportes_nuevos ──
      setProgreso('Guardando reporte...')
      const { data: reporte, error: reporteError } = await supabase
        .from('reportes_nuevos')
        .insert({
          id_usuario: user.id,
          autor_reporte: user.email,
          latitud: reporteData.latitud,
          longitud: reporteData.longitud,
          region: reporteData.region,
          comuna: reporteData.comuna,
          nombre_sitio: reporteData.nombre,
          nombre_reporte: reporteData.nombre || 'Sin nombre',
          categoria_sitio: reporteData.clasificacionCMN ?? null,
          categoria_general: reporteData.categoria ?? null,
          tipologia_especifica: reporteData.tipologia ?? ['No determinado'],
          cultura_asociada: reporteData.cultura ?? null,
          periodo_cronologico: reporteData.periodo ?? null,
          cronologia_general: reporteData.periodo ?? null,
          estado_conservacion: reporteData.estadoconservacion ?? null,
          condicion_emplazamiento: reporteData.condicionEmplazamiento ?? null,
          descripcion_ubicacion: reporteData.descripcion ?? null,
          tipo_propiedad: reporteData.tipoPropiedad ?? null,
          nivel_acceso: reporteData.nivelacceso ?? 'Resguardado',
          uso_suelo_actual: reporteData.usoSuelo ?? null,
          uso_suelo_otro: reporteData.usoSueloOtro ?? null,
          amenazas: reporteData.amenazas ?? null,
          contacto_propietario_posible: reporteData.contactoPropietarioPosible ?? null,
          contacto_propietario_info: reporteData.contactoPropietarioInfo ?? null,
          telefono_usuario_contacto: reporteData.telefonoUsuarioContacto ?? null,
          recinto_privado: reporteData.recintoprivado ?? false,
          tipo_riesgo_principal: reporteData.tiporiesgo ?? null,
          nivel_proteccion: reporteData.nivelproteccion ?? null,
          estado_validacion: 'rojo',
        })
        .select()
        .single()

      if (reporteError) throw reporteError

      const idReporte = reporte.id_reporte

      // ── 2. Subir fotos ──
      let primeraFotoUrl: string | null = null
      const fotosArr = archivos.filter(a => a.tipo === 'foto')

      for (let i = 0; i < fotosArr.length; i++) {
        setProgreso(`Subiendo foto ${i + 1} de ${fotosArr.length}...`)
        const { file, descripcion } = fotosArr[i]
        const fileName = `reportes/${idReporte}/${Date.now()}-${file.name}`

        const { error: uploadError } = await supabase.storage
          .from('fotos')
          .upload(fileName, file)

        if (uploadError) { console.error('Error foto:', uploadError); continue }

        const { data: urlData } = supabase.storage.from('fotos').getPublicUrl(fileName)

        await supabase.from('reportes_medios').insert({
          id_reporte: idReporte,
          url_publica: urlData.publicUrl,
          tipo_medio: 'foto',
          descripcion_imagen: descripcion || `Foto ${i + 1}`,
          prioridad_visualizacion: i === 0 ? 1 : 0,
        })

        if (i === 0) primeraFotoUrl = urlData.publicUrl
      }

      // Actualizar imagen_url del reporte con la primera foto
      if (primeraFotoUrl) {
        await supabase
          .from('reportes_nuevos')
          .update({ imagen_url: primeraFotoUrl })
          .eq('id_reporte', idReporte)
      }

      // ── 3. Subir videos ──
      const videosArr = archivos.filter(a => a.tipo === 'video')

      for (let i = 0; i < videosArr.length; i++) {
        setProgreso(`Subiendo video ${i + 1} de ${videosArr.length}...`)
        const { file, descripcion } = videosArr[i]
        const fileName = `reportes/${idReporte}/${Date.now()}-${file.name}`

        const { error: uploadError } = await supabase.storage
          .from('videos')
          .upload(fileName, file)

        if (uploadError) { console.error('Error video:', uploadError); continue }

        const { data: urlData } = supabase.storage.from('videos').getPublicUrl(fileName)

        await supabase.from('reportes_medios').insert({
          id_reporte: idReporte,
          url_publica: urlData.publicUrl,
          tipo_medio: 'video',
          descripcion_imagen: descripcion || `Video ${i + 1}`,
          prioridad_visualizacion: 0,
        })
      }

      // ── 4. Subir PDFs y registrar publicaciones ──
      for (let i = 0; i < multimediaData.publicaciones.length; i++) {
        setProgreso(`Subiendo publicación ${i + 1} de ${multimediaData.publicaciones.length}...`)
        const pub = multimediaData.publicaciones[i]
        const fileName = `${user.id}/${Date.now()}-${pub.file.name}`

        const { error: uploadError } = await supabase.storage
          .from('publicaciones-pdf')
          .upload(fileName, pub.file)

        if (uploadError) { console.error('Error PDF:', uploadError); continue }

        const { data: urlData } = supabase.storage
          .from('publicaciones-pdf')
          .getPublicUrl(fileName)

        const { data: pubData, error: pubError } = await supabase
          .from('publicaciones')
          .insert({
            titulo: pub.titulo,
            autor: pub.autor || null,
            año: pub.año ? parseInt(pub.año) : null,
            referencia: pub.referencia || null,
            url_pdf: urlData.publicUrl,
            id_usuario_subida: user.id,
          })
          .select()
          .single()

        if (pubError) { console.error('Error publicacion:', pubError); continue }

        // Vincular publicación al reporte (id_sitio quedará null hasta aprobación)
        await supabase.from('sitios_publicaciones').insert({
          id_publicacion: pubData.id_publicacion,
          id_reporte: idReporte,
        })
      }

      // ── 5. Guardar links externos en reportes_medios ──
      setProgreso('Guardando links...')
      const links = [
        { url: multimediaData.link360, tipo: 'link_360', titulo: 'Tour 360°' },
        { url: multimediaData.linkVideo, tipo: 'link_video', titulo: 'Video externo' },
        { url: multimediaData.link3d, tipo: 'link_3d', titulo: 'Modelo 3D' },
      ].filter(l => l.url.trim() !== '')

      for (const link of links) {
        await supabase.from('reportes_medios').insert({
          id_reporte: idReporte,
          url_publica: link.url,
          tipo_medio: link.tipo,
          titulo: link.titulo,
          prioridad_visualizacion: 0,
        })
      }

      router.push('/reportar/confirmacion')

    } catch (err: unknown) {
      console.error('Error enviando reporte:', err)
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
      setProgreso('')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Paso 5: Fotos y Videos</h2>
        <p className="text-gray-600 text-sm mt-1">
          Agrega evidencia visual del sitio (todo opcional)
        </p>
      </div>

      {/* ── FOTOS ── */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
          📷 Fotos <span className="text-gray-400 font-normal normal-case">(máx. 5 · 10MB c/u)</span>
        </h3>

        {/* Previews con descripción */}
        {archivos.map((item, globalIndex) => {
          if (item.tipo !== 'foto') return null
          return (
            <div key={globalIndex} className="border border-gray-200 rounded-lg p-3 space-y-2">
              <div className="flex gap-3 items-start">
                <img
                  src={item.preview}
                  alt=""
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0 border border-gray-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 truncate mb-1">{item.file.name}</p>
                  <textarea
                    value={item.descripcion}
                    onChange={(e) => updateDescripcion(globalIndex, e.target.value)}
                    placeholder="Descripción u observación de la foto (opcional)"
                    rows={2}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B] resize-none"
                  />
                </div>
                <button
                  onClick={() => removeArchivo(globalIndex)}
                  className="text-red-400 hover:text-red-600 flex-shrink-0 mt-1"
                  type="button"
                >✕</button>
              </div>
            </div>
          )
        })}

        {fotos.length < 5 && (
          <label
            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition"
            style={{ borderColor: '#10454B', backgroundColor: '#f0f7f8' }}
          >
            <span className="text-2xl mb-1">📷</span>
            <p className="text-sm text-gray-600">Click para agregar fotos</p>
            <p className="text-xs text-gray-500">PNG, JPG (máx. 10MB)</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFotoSelect}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* ── VIDEOS ── */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
          🎥 Videos <span className="text-gray-400 font-normal normal-case">(máx. 3 · 50MB c/u)</span>
        </h3>

        {archivos.map((item, globalIndex) => {
          if (item.tipo !== 'video') return null
          return (
            <div key={globalIndex} className="border border-gray-200 rounded-lg p-3 space-y-2">
              <div className="flex gap-3 items-start">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200">
                  <span className="text-2xl">🎥</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 truncate mb-1">{item.file.name}</p>
                  <textarea
                    value={item.descripcion}
                    onChange={(e) => updateDescripcion(globalIndex, e.target.value)}
                    placeholder="Descripción del video (opcional)"
                    rows={2}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B] resize-none"
                  />
                </div>
                <button
                  onClick={() => removeArchivo(globalIndex)}
                  className="text-red-400 hover:text-red-600 flex-shrink-0 mt-1"
                  type="button"
                >✕</button>
              </div>
            </div>
          )
        })}

        {videos.length < 3 && (
          <label
            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition"
            style={{ borderColor: '#10454B', backgroundColor: '#f0f7f8' }}
          >
            <span className="text-2xl mb-1">🎥</span>
            <p className="text-sm text-gray-600">Click para agregar videos</p>
            <p className="text-xs text-gray-500">MP4, MOV (máx. 50MB)</p>
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={handleVideoSelect}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Resumen de lo que viene del Step 4 */}
      {(multimediaData.publicaciones.length > 0 || multimediaData.link360 || multimediaData.linkVideo || multimediaData.link3d) && (
        <div className="border rounded-lg p-4 space-y-1" style={{ backgroundColor: '#f0f7f8', borderColor: '#10454B' }}>
          <p className="text-sm font-medium" style={{ color: '#10454B' }}>📎 Del paso anterior se enviarán:</p>
          {multimediaData.publicaciones.length > 0 && (
            <p className="text-sm" style={{ color: '#10454B' }}>
              · {multimediaData.publicaciones.length} publicación(es) PDF
            </p>
          )}
          {multimediaData.link360 && <p className="text-sm" style={{ color: '#10454B' }}>· Link 360°</p>}
          {multimediaData.linkVideo && <p className="text-sm" style={{ color: '#10454B' }}>· Link de video</p>}
          {multimediaData.link3d && <p className="text-sm" style={{ color: '#10454B' }}>· Link modelo 3D</p>}
        </div>
      )}

      {/* Info */}
      <div className="border rounded-lg p-4" style={{ backgroundColor: '#f0f7f8', borderColor: '#10454B' }}>
        <p className="text-sm" style={{ color: '#10454B' }}>
          💡 Puedes enviar el reporte sin archivos o agregar más contenido desde tu perfil.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-2">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
          type="button"
        >
          Atrás
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 py-3 rounded-lg font-medium text-white transition disabled:opacity-50"
          style={{ backgroundColor: loading ? '#9ca3af' : '#10454B' }}
          type="button"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              {progreso || 'Enviando...'}
            </span>
          ) : (
            'Enviar Reporte'
          )}
        </button>
      </div>
    </div>
  )
}

export default StepFotos
