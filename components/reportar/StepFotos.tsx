'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { ReporteData } from '@/types/reporte'
import type { MultimediaData } from '@/components/reportar/StepMultimedia'
import { StepWrapper } from '@/components/ui/StepWrapper'
import { StepButton } from '@/components/ui/StepButton'
import * as S from '@/lib/ui/stepStyles'

const supabase = createClient()

interface ArchivoItem {
  file: File
  preview: string
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
  const [focusField, setFocusField] = useState<string | null>(null)

  const fotos = archivos.filter(a => a.tipo === 'foto')
  const videos = archivos.filter(a => a.tipo === 'video')

  function handleFotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length + fotos.length > 5) { setError('Máximo 5 fotos permitidas'); return }
    if (files.some(f => f.size > 10 * 1024 * 1024)) { setError('Algunas fotos superan los 10MB'); return }
    setError('')
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setArchivos(prev => [...prev, { file, preview: reader.result as string, descripcion: '', tipo: 'foto' }])
      }
      reader.readAsDataURL(file)
    })
  }

  function handleVideoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length + videos.length > 3) { setError('Máximo 3 videos permitidos'); return }
    if (files.some(f => f.size > 50 * 1024 * 1024)) { setError('Algunos videos superan los 50MB'); return }
    setError('')
    files.forEach(file => {
      setArchivos(prev => [...prev, { file, preview: '', descripcion: '', tipo: 'video' }])
    })
  }

  function updateDescripcion(index: number, descripcion: string) {
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

      // ── 2. Fotos ──
      let primeraFotoUrl: string | null = null
      const fotosArr = archivos.filter(a => a.tipo === 'foto')
      for (let i = 0; i < fotosArr.length; i++) {
        setProgreso(`Subiendo foto ${i + 1} de ${fotosArr.length}...`)
        const { file, descripcion } = fotosArr[i]
        const fileName = `reportes/${idReporte}/${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage.from('fotos').upload(fileName, file)
        if (uploadError) { console.error('Error foto:', uploadError); continue }
        const { data: urlData } = supabase.storage.from('fotos').getPublicUrl(fileName)
        await supabase.from('reportes_medios').insert({
          id_reporte: idReporte, url_publica: urlData.publicUrl,
          tipo_medio: 'foto', descripcion_imagen: descripcion || `Foto ${i + 1}`,
          prioridad_visualizacion: i === 0 ? 1 : 0,
        })
        if (i === 0) primeraFotoUrl = urlData.publicUrl
      }
      if (primeraFotoUrl) {
        await supabase.from('reportes_nuevos').update({ imagen_url: primeraFotoUrl }).eq('id_reporte', idReporte)
      }

      // ── 3. Videos ──
      const videosArr = archivos.filter(a => a.tipo === 'video')
      for (let i = 0; i < videosArr.length; i++) {
        setProgreso(`Subiendo video ${i + 1} de ${videosArr.length}...`)
        const { file, descripcion } = videosArr[i]
        const fileName = `reportes/${idReporte}/${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage.from('videos').upload(fileName, file)
        if (uploadError) { console.error('Error video:', uploadError); continue }
        const { data: urlData } = supabase.storage.from('videos').getPublicUrl(fileName)
        await supabase.from('reportes_medios').insert({
          id_reporte: idReporte, url_publica: urlData.publicUrl,
          tipo_medio: 'video', descripcion_imagen: descripcion || `Video ${i + 1}`,
          prioridad_visualizacion: 0,
        })
      }

      // ── 4. PDFs ──
      for (let i = 0; i < multimediaData.publicaciones.length; i++) {
        setProgreso(`Subiendo publicación ${i + 1} de ${multimediaData.publicaciones.length}...`)
        const pub = multimediaData.publicaciones[i]
        const fileName = `${user.id}/${Date.now()}-${pub.file.name}`
        const { error: uploadError } = await supabase.storage.from('publicaciones-pdf').upload(fileName, pub.file)
        if (uploadError) { console.error('Error PDF:', uploadError); continue }
        const { data: urlData } = supabase.storage.from('publicaciones-pdf').getPublicUrl(fileName)
        const { data: pubData, error: pubError } = await supabase.from('publicaciones').insert({
          titulo: pub.titulo, autor: pub.autor || null,
          año: pub.año ? parseInt(pub.año) : null,
          referencia: pub.referencia || null,
          url_pdf: urlData.publicUrl, id_usuario_subida: user.id,
        }).select().single()
        if (pubError) { console.error('Error publicacion:', pubError); continue }
        await supabase.from('sitios_publicaciones').insert({
          id_publicacion: pubData.id_publicacion, id_reporte: idReporte,
        })
      }

      // ── 5. Links externos ──
      setProgreso('Guardando links...')
      const links = [
        { url: multimediaData.link360, tipo: 'link_360', titulo: 'Tour 360°' },
        { url: multimediaData.linkVideo, tipo: 'link_video', titulo: 'Video externo' },
        { url: multimediaData.link3d, tipo: 'link_3d', titulo: 'Modelo 3D' },
      ].filter(l => l.url.trim() !== '')
      for (const link of links) {
        await supabase.from('reportes_medios').insert({
          id_reporte: idReporte, url_publica: link.url,
          tipo_medio: link.tipo, titulo: link.titulo, prioridad_visualizacion: 0,
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
    <StepWrapper
      step={5}
      totalSteps={5}
      stepLabel="Fotos y Videos"
      title="Evidencia visual"
      subtitle="Agrega fotos o videos del sitio. Todo es opcional."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ─ Fotos ─ */}
        <div>
          <p style={{ ...S.fieldLabel, marginBottom: 10 }}>Fotos <span style={S.fieldHint as React.CSSProperties}>(máx. 5 · 10MB c/u)</span></p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {archivos.map((item, globalIndex) => {
              if (item.tipo !== 'foto') return null
              return (
                <div key={globalIndex} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 10 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <img src={item.preview} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ ...S.fieldHint, marginBottom: 4 }}>{item.file.name}</p>
                      <textarea value={item.descripcion} onChange={(e) => updateDescripcion(globalIndex, e.target.value)}
                        placeholder="Descripción u observación (opcional)" rows={2}
                        style={{ ...S.textarea, fontSize: 12, minHeight: 54,
                          ...(focusField === `f${globalIndex}` ? S.inputFocus : S.inputBlur) }}
                        onFocus={() => setFocusField(`f${globalIndex}`)} onBlur={() => setFocusField(null)} />
                    </div>
                    <button onClick={() => removeArchivo(globalIndex)} style={S.btnRemove} type="button">✕</button>
                  </div>
                </div>
              )
            })}
          </div>
          {fotos.length < 5 && (
            <label style={{ ...S.dropZone, marginTop: fotos.length > 0 ? 8 : 0, cursor: 'pointer' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <p style={{ ...S.fieldHint, marginTop: 6 }}>Click para agregar fotos</p>
              <p style={S.fieldHint}>PNG, JPG (máx. 10MB)</p>
              <input type="file" accept="image/*" multiple onChange={handleFotoSelect} style={{ display: 'none' }} />
            </label>
          )}
        </div>

        {/* ─ Videos ─ */}
        <div>
          <p style={{ ...S.fieldLabel, marginBottom: 10 }}>Videos <span style={S.fieldHint as React.CSSProperties}>(máx. 3 · 50MB c/u)</span></p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {archivos.map((item, globalIndex) => {
              if (item.tipo !== 'video') return null
              return (
                <div key={globalIndex} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 10 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 72, height: 72, background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ ...S.fieldHint, marginBottom: 4 }}>{item.file.name}</p>
                      <textarea value={item.descripcion} onChange={(e) => updateDescripcion(globalIndex, e.target.value)}
                        placeholder="Descripción del video (opcional)" rows={2}
                        style={{ ...S.textarea, fontSize: 12, minHeight: 54,
                          ...(focusField === `v${globalIndex}` ? S.inputFocus : S.inputBlur) }}
                        onFocus={() => setFocusField(`v${globalIndex}`)} onBlur={() => setFocusField(null)} />
                    </div>
                    <button onClick={() => removeArchivo(globalIndex)} style={S.btnRemove} type="button">✕</button>
                  </div>
                </div>
              )
            })}
          </div>
          {videos.length < 3 && (
            <label style={{ ...S.dropZone, marginTop: videos.length > 0 ? 8 : 0, cursor: 'pointer' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <p style={{ ...S.fieldHint, marginTop: 6 }}>Click para agregar videos</p>
              <p style={S.fieldHint}>MP4, MOV (máx. 50MB)</p>
              <input type="file" accept="video/*" multiple onChange={handleVideoSelect} style={{ display: 'none' }} />
            </label>
          )}
        </div>

        {/* Resumen multimedia paso anterior */}
        {(multimediaData.publicaciones.length > 0 || multimediaData.link360 || multimediaData.linkVideo || multimediaData.link3d) && (
          <div style={S.summaryBox}>
            <p style={S.summaryTitle}>Del paso anterior se enviarán:</p>
            {multimediaData.publicaciones.length > 0 && <p>· {multimediaData.publicaciones.length} publicación(es) PDF</p>}
            {multimediaData.link360 && <p>· Link 360°</p>}
            {multimediaData.linkVideo && <p>· Link de video</p>}
            {multimediaData.link3d && <p>· Link modelo 3D</p>}
          </div>
        )}

        <div style={S.infoBox}>
          Puedes enviar sin archivos y agregar más contenido desde tu perfil.
        </div>

        {error && <div style={S.errorBox}>{error}</div>}

        <div style={{ display: 'flex', gap: 10 }}>
          <StepButton onClick={onBack} variant="secondary" disabled={loading}>Atrás</StepButton>
          <StepButton
            onClick={handleSubmit}
            loading={loading}
            loadingText={progreso || 'Enviando...'}
          >
            Enviar Reporte
          </StepButton>
        </div>

      </div>
    </StepWrapper>
  )
}

export default StepFotos
