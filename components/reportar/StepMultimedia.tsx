'use client'

import { useState } from 'react'

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

const EMPTY_PUB: Omit<PublicacionDraft, 'file'> = {
  titulo: '',
  autor: '',
  año: '',
  referencia: '',
}

export function StepMultimedia({ onNext, onBack }: StepMultimediaProps) {
  const [publicaciones, setPublicaciones] = useState<PublicacionDraft[]>([])
  const [pubForm, setPubForm] = useState({ ...EMPTY_PUB })
  const [pubFile, setPubFile] = useState<File | null>(null)
  const [pubError, setPubError] = useState('')

  const [link360, setLink360] = useState('')
  const [linkVideo, setLinkVideo] = useState('')
  const [link3d, setLink3d] = useState('')

  function handlePdfSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 15 * 1024 * 1024) {
      setPubError('El PDF supera los 15MB')
      return
    }
    setPubError('')
    setPubFile(file)
  }

  function handleAddPublicacion() {
    if (!pubFile) {
      setPubError('Selecciona un archivo PDF')
      return
    }
    if (!pubForm.titulo.trim()) {
      setPubError('El título es obligatorio')
      return
    }
    setPubError('')
    setPublicaciones([...publicaciones, { file: pubFile, ...pubForm }])
    setPubFile(null)
    setPubForm({ ...EMPTY_PUB })
    // Limpiar input file
    const input = document.getElementById('pdf-input') as HTMLInputElement
    if (input) input.value = ''
  }

  function removePublicacion(index: number) {
    setPublicaciones(publicaciones.filter((_, i) => i !== index))
  }

  function handleNext() {
    onNext({ publicaciones, link360, linkVideo, link3d })
  }

  const tieneContenido =
    publicaciones.length > 0 || link360 || linkVideo || link3d

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Paso 4: Documentación</h2>
        <p className="text-gray-600 text-sm mt-1">
          Agrega publicaciones científicas y links externos (todo opcional)
        </p>
      </div>

      {/* ── SECCIÓN PDF ── */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
          📄 Publicaciones PDF
        </h3>

        {/* Lista de PDFs agregados */}
        {publicaciones.length > 0 && (
          <div className="space-y-2">
            {publicaciones.map((pub, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{pub.titulo}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {[pub.autor, pub.año].filter(Boolean).join(', ')} — {pub.file.name}
                  </p>
                </div>
                <button
                  onClick={() => removePublicacion(i)}
                  className="ml-3 text-red-400 hover:text-red-600 flex-shrink-0"
                  type="button"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Formulario agregar PDF */}
        <div className="border border-dashed border-gray-300 rounded-lg p-4 space-y-3">
          {/* Selector de archivo */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Archivo PDF (máx. 15MB)</label>
            <input
              id="pdf-input"
              type="file"
              accept=".pdf"
              onChange={handlePdfSelect}
              className="w-full text-sm text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:cursor-pointer"
              style={{ '--file-bg': '#10454B' } as React.CSSProperties}
            />
            {pubFile && (
              <p className="text-xs text-green-700 mt-1">✓ {pubFile.name}</p>
            )}
          </div>

          {/* Título */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={pubForm.titulo}
              onChange={(e) => setPubForm({ ...pubForm, titulo: e.target.value })}
              placeholder="Ej: Sitios arqueológicos del valle de Elqui"
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B]"
            />
          </div>

          {/* Autor + Año en fila */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Autor</label>
              <input
                type="text"
                value={pubForm.autor}
                onChange={(e) => setPubForm({ ...pubForm, autor: e.target.value })}
                placeholder="Ej: González, R."
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B]"
              />
            </div>
            <div className="w-24">
              <label className="block text-xs text-gray-500 mb-1">Año</label>
              <input
                type="number"
                value={pubForm.año}
                onChange={(e) => setPubForm({ ...pubForm, año: e.target.value })}
                placeholder="2024"
                min="1800"
                max="2099"
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B]"
              />
            </div>
          </div>

          {/* Referencia */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Referencia / Fuente</label>
            <input
              type="text"
              value={pubForm.referencia}
              onChange={(e) => setPubForm({ ...pubForm, referencia: e.target.value })}
              placeholder="Ej: Revista Chilena de Antropología, Vol. 12"
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B]"
            />
          </div>

          {pubError && (
            <p className="text-xs text-red-600">{pubError}</p>
          )}

          <button
            type="button"
            onClick={handleAddPublicacion}
            className="w-full py-2 text-sm rounded-lg font-medium border-2 transition"
            style={{ borderColor: '#10454B', color: '#10454B' }}
          >
            + Agregar publicación
          </button>
        </div>
      </div>

      {/* ── SECCIÓN LINKS EXTERNOS ── */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
          🔗 Links Externos
        </h3>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Tour / Foto 360°</label>
          <input
            type="url"
            value={link360}
            onChange={(e) => setLink360(e.target.value)}
            placeholder="https://3dvista.com/..."
            className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B]"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Video (YouTube / Vimeo)</label>
          <input
            type="url"
            value={linkVideo}
            onChange={(e) => setLinkVideo(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B]"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Modelo 3D (Sketchfab u otro)</label>
          <input
            type="url"
            value={link3d}
            onChange={(e) => setLink3d(e.target.value)}
            placeholder="https://sketchfab.com/..."
            className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B]"
          />
        </div>
      </div>

      {/* Info */}
      {!tieneContenido && (
        <div className="border rounded-lg p-4" style={{ backgroundColor: '#f0f7f8', borderColor: '#10454B' }}>
          <p className="text-sm" style={{ color: '#10454B' }}>
            💡 Todo este paso es opcional. Puedes agregar documentación más tarde desde el perfil del sitio.
          </p>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 font-medium"
          type="button"
        >
          Atrás
        </button>
        <button
          onClick={handleNext}
          className="flex-1 py-3 rounded-lg font-medium text-white transition"
          style={{ backgroundColor: '#10454B' }}
          type="button"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}

export default StepMultimedia
