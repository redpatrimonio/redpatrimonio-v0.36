'use client'

import { useState } from 'react'
import { StepWrapper } from '@/components/ui/StepWrapper'
import { StepButton } from '@/components/ui/StepButton'
import * as S from '@/lib/ui/stepStyles'

export interface PublicacionDraft {
  file: File
  titulo: string
  autor: string
  año: string
  referencia: string
}

export interface MultimediaData {
  publicaciones: PublicacionDraft[]
  link360: string
  linkVideo: string
  link3d: string
}

interface StepMultimediaProps {
  onNext: (data: MultimediaData) => void
  onBack: () => void
}

const EMPTY_PUB: Omit<PublicacionDraft, 'file'> = { titulo: '', autor: '', año: '', referencia: '' }

export function StepMultimedia({ onNext, onBack }: StepMultimediaProps) {
  const [publicaciones, setPublicaciones] = useState<PublicacionDraft[]>([])
  const [pubForm, setPubForm] = useState({ ...EMPTY_PUB })
  const [pubFile, setPubFile] = useState<File | null>(null)
  const [pubError, setPubError] = useState('')
  const [link360, setLink360] = useState('')
  const [linkVideo, setLinkVideo] = useState('')
  const [link3d, setLink3d] = useState('')
  const [focusField, setFocusField] = useState<string | null>(null)

  function handlePdfSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 15 * 1024 * 1024) { setPubError('El PDF supera los 15MB'); return }
    setPubError('')
    setPubFile(file)
  }

  function handleAddPublicacion() {
    if (!pubFile) { setPubError('Selecciona un archivo PDF'); return }
    if (!pubForm.titulo.trim()) { setPubError('El título es obligatorio'); return }
    setPubError('')
    setPublicaciones([...publicaciones, { file: pubFile, ...pubForm }])
    setPubFile(null)
    setPubForm({ ...EMPTY_PUB })
    const input = document.getElementById('pdf-input') as HTMLInputElement
    if (input) input.value = ''
  }

  function removePublicacion(index: number) {
    setPublicaciones(publicaciones.filter((_, i) => i !== index))
  }

  const focusStyle = (field: string) => focusField === field ? S.inputFocus : S.inputBlur

  return (
    <StepWrapper
      step={4}
      totalSteps={5}
      stepLabel="Documentación"
      title="Documentación asociada"
      subtitle="Publicaciones científicas y links externos. Todo es opcional."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ─ PDFs ─ */}
        <div>
          <p style={{ ...S.fieldLabel, marginBottom: 12 }}>Publicaciones PDF</p>

          {/* Lista agregada */}
          {publicaciones.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
              {publicaciones.map((pub, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '8px 12px',
                }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pub.titulo}</p>
                    <p style={S.fieldHint}>{[pub.autor, pub.año].filter(Boolean).join(', ')} — {pub.file.name}</p>
                  </div>
                  <button onClick={() => removePublicacion(i)} style={S.btnRemove} type="button">✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Formulario agregar */}
          <div style={{ border: '1.5px dashed var(--border-m)', borderRadius: 12, padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={S.fieldLabel}>Archivo PDF <span style={S.fieldHint as React.CSSProperties}>(máx. 15MB)</span></label>
              <input id="pdf-input" type="file" accept=".pdf" onChange={handlePdfSelect}
                style={{ fontSize: 12, color: 'var(--muted)', width: '100%' }} />
              {pubFile && <p style={{ ...S.fieldHint, color: 'var(--musgo)', marginTop: 4 }}>✓ {pubFile.name}</p>}
            </div>

            <div>
              <label style={S.fieldLabel}>Título <span style={S.required}>*</span></label>
              <input type="text" value={pubForm.titulo} onChange={(e) => setPubForm({ ...pubForm, titulo: e.target.value })}
                placeholder="Ej: Sitios arqueológicos del valle de Elqui"
                style={{ ...S.input, ...focusStyle('ptitulo') }}
                onFocus={() => setFocusField('ptitulo')} onBlur={() => setFocusField(null)} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={S.fieldLabel}>Autor</label>
                <input type="text" value={pubForm.autor} onChange={(e) => setPubForm({ ...pubForm, autor: e.target.value })}
                  placeholder="Ej: González, R."
                  style={{ ...S.input, ...focusStyle('pautor') }}
                  onFocus={() => setFocusField('pautor')} onBlur={() => setFocusField(null)} />
              </div>
              <div style={{ width: 90 }}>
                <label style={S.fieldLabel}>Año</label>
                <input type="number" value={pubForm.año} onChange={(e) => setPubForm({ ...pubForm, año: e.target.value })}
                  placeholder="2024" min="1800" max="2099"
                  style={{ ...S.input, ...focusStyle('paño') }}
                  onFocus={() => setFocusField('paño')} onBlur={() => setFocusField(null)} />
              </div>
            </div>

            <div>
              <label style={S.fieldLabel}>Referencia / Fuente</label>
              <input type="text" value={pubForm.referencia} onChange={(e) => setPubForm({ ...pubForm, referencia: e.target.value })}
                placeholder="Ej: Revista Chilena de Antropología, Vol. 12"
                style={{ ...S.input, ...focusStyle('pref') }}
                onFocus={() => setFocusField('pref')} onBlur={() => setFocusField(null)} />
            </div>

            {pubError && <p style={{ ...S.fieldHint, color: 'var(--ladrillo)' }}>{pubError}</p>}

            <StepButton onClick={handleAddPublicacion} variant="action" fullWidth>+ Agregar publicación</StepButton>
          </div>
        </div>

        {/* ─ Links externos ─ */}
        <div>
          <p style={{ ...S.fieldLabel, marginBottom: 12 }}>Links externos</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Tour / Foto 360°', key: 'l360', val: link360, set: setLink360, placeholder: 'https://3dvista.com/...' },
              { label: 'Video (YouTube / Vimeo)', key: 'lvideo', val: linkVideo, set: setLinkVideo, placeholder: 'https://youtube.com/watch?v=...' },
              { label: 'Modelo 3D (Sketchfab u otro)', key: 'l3d', val: link3d, set: setLink3d, placeholder: 'https://sketchfab.com/...' },
            ].map(({ label, key, val, set, placeholder }) => (
              <div key={key}>
                <label style={S.fieldLabel}>{label}</label>
                <input type="url" value={val} onChange={(e) => set(e.target.value)}
                  placeholder={placeholder}
                  style={{ ...S.input, ...focusStyle(key) }}
                  onFocus={() => setFocusField(key)} onBlur={() => setFocusField(null)} />
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        {publicaciones.length === 0 && !link360 && !linkVideo && !link3d && (
          <div style={S.infoBox}>
            Puedes agregar documentación más adelante desde el perfil del sitio.
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <StepButton onClick={onBack} variant="secondary">Atrás</StepButton>
          <StepButton onClick={() => onNext({ publicaciones, link360, linkVideo, link3d })}>Siguiente</StepButton>
        </div>

      </div>
    </StepWrapper>
  )
}

export default StepMultimedia
