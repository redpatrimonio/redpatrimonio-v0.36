'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { COLUMNAS_OFICIALES } from './CsvUploader'

interface PublicacionDraft {
  file: File
  titulo: string
  autor: string
  anio: string
  referencia: string
}

interface Props {
  onLoteSubido: () => void  // refresca la lista de lotes recientes
}

function parsearNFilas(texto: string): number {
  const lineas = texto.trim().split('\n').filter(l => l.trim())
  return Math.max(0, lineas.length - 1) // sin cabecera
}

function validarCabecera(texto: string): string[] {
  const primera = texto.trim().split('\n')[0] ?? ''
  const cols = primera.split(',').map(c => c.trim().toLowerCase())
  const faltantes = COLUMNAS_OFICIALES.filter(c => !cols.includes(c))
  const extras    = cols.filter(c => !COLUMNAS_OFICIALES.includes(c))
  const errores: string[] = []
  if (faltantes.length) errores.push(`Columnas faltantes: ${faltantes.join(', ')}`)
  if (extras.length)    errores.push(`Columnas no reconocidas: ${extras.join(', ')}`)
  return errores
}

const EMPTY_PDF = { titulo: '', autor: '', anio: '', referencia: '' }

export default function LoteUploader({ onLoteSubido }: Props) {
  const { user } = useAuth()
  const supabase = createClient()

  // Campos del formulario
  const [titulo, setTitulo]           = useState('')
  const [notas, setNotas]             = useState('')
  const [csvFile, setCsvFile]         = useState<File | null>(null)
  const [csvTexto, setCsvTexto]       = useState('')
  const [nFilas, setNFilas]           = useState<number | null>(null)
  const [erroresCsv, setErroresCsv]   = useState<string[]>([])
  const [arrastrando, setArrastrando] = useState(false)
  const [pdfs, setPdfs]               = useState<PublicacionDraft[]>([])
  const [pdfForm, setPdfForm]         = useState({ ...EMPTY_PDF })
  const [pdfFile, setPdfFile]         = useState<File | null>(null)
  const [mostrarPdfForm, setMostrarPdfForm] = useState(false)
  const [pdfError, setPdfError]       = useState('')

  // Estado de envío
  const [subiendo, setSubiendo]       = useState(false)
  const [errorEnvio, setErrorEnvio]   = useState('')

  const csvRef = useRef<HTMLInputElement>(null)
  const pdfRef = useRef<HTMLInputElement>(null)

  // ── CSV handlers ──────────────────────────────────
  function procesarCsv(file: File) {
    if (!file.name.endsWith('.csv')) { setErroresCsv(['Solo se aceptan archivos .csv']); return }
    const reader = new FileReader()
    reader.onload = (e) => {
      const texto = e.target?.result as string
      const errores = validarCabecera(texto)
      const filas   = parsearNFilas(texto)
      setCsvFile(file)
      setCsvTexto(texto)
      setNFilas(filas)
      setErroresCsv(errores)
    }
    reader.readAsText(file, 'UTF-8')
  }

  function onCsvDrop(e: React.DragEvent) {
    e.preventDefault(); setArrastrando(false)
    const f = e.dataTransfer.files?.[0]
    if (f) procesarCsv(f)
  }

  // ── PDF handlers ──────────────────────────────────
  function agregarPdf() {
    if (!pdfFile)              { setPdfError('Selecciona un PDF'); return }
    if (!pdfForm.titulo.trim()){ setPdfError('El título es obligatorio'); return }
    if (pdfFile.size > 15 * 1024 * 1024) { setPdfError('El PDF supera los 15 MB'); return }
    setPdfs([...pdfs, { file: pdfFile, ...pdfForm }])
    setPdfFile(null); setPdfForm({ ...EMPTY_PDF }); setPdfError('')
    setMostrarPdfForm(false)
    if (pdfRef.current) pdfRef.current.value = ''
  }

  function quitarPdf(i: number) { setPdfs(pdfs.filter((_, idx) => idx !== i)) }

  // ── Subir ─────────────────────────────────────────
  async function handleSubir() {
    if (!user || !csvFile || !titulo.trim()) return
    setSubiendo(true); setErrorEnvio('')

    try {
      // 1. Generar ID del lote anticipado
      const loteId = crypto.randomUUID()

      // 2. Subir CSV al bucket
      const csvPath = `csv/${loteId}.csv`
      const { error: csvError } = await supabase.storage
        .from('ingesta-lotes')
        .upload(csvPath, csvFile, { contentType: 'text/csv', upsert: false })
      if (csvError) throw new Error(`Error al subir CSV: ${csvError.message}`)

      // 3. Insertar registro en lotes_ingesta
      const { error: insertError } = await supabase
        .from('lotes_ingesta')
        .insert({
          id:             loteId,
          titulo:         titulo.trim(),
          notas_subida:   notas.trim() || null,
          nombre_archivo: csvFile.name,
          url_csv:        csvPath,
          subido_por:     user.id,
          n_filas:        nFilas,
          estado:         'pendiente',
        })
      if (insertError) throw new Error(`Error al registrar lote: ${insertError.message}`)

      // 4. Subir PDFs si hay
      for (const pub of pdfs) {
        const pdfPath = `pdfs/${loteId}/${Date.now()}_${pub.file.name}`
        const { error: pdfUpError } = await supabase.storage
          .from('ingesta-lotes')
          .upload(pdfPath, pub.file, { contentType: 'application/pdf', upsert: false })
        if (pdfUpError) throw new Error(`Error al subir PDF "${pub.titulo}": ${pdfUpError.message}`)

        const { error: pdfInsError } = await supabase
          .from('lotes_ingesta_pdfs')
          .insert({
            id_lote:    loteId,
            url_pdf:    pdfPath,
            titulo:     pub.titulo,
            autor:      pub.autor   || null,
            anio:       pub.anio    ? parseInt(pub.anio) : null,
            referencia: pub.referencia || null,
          })
        if (pdfInsError) throw new Error(`Error al registrar PDF: ${pdfInsError.message}`)
      }

      // 5. Reset formulario
      setTitulo(''); setNotas(''); setCsvFile(null); setCsvTexto('')
      setNFilas(null); setErroresCsv([]); setPdfs([])
      if (csvRef.current) csvRef.current.value = ''
      onLoteSubido()

    } catch (e: unknown) {
      setErrorEnvio(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setSubiendo(false)
    }
  }

  const puedeSubir = !!titulo.trim() && !!csvFile && erroresCsv.length === 0 && !subiendo

  return (
    <div className="space-y-5">

      {/* Título */}
      <div>
        <label className="block text-xs text-[var(--muted)] mb-1.5">
          Título del lote <span className="text-[var(--cobre)]">*</span>
        </label>
        <input
          type="text"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          placeholder="Ej: Sitios arqueológicos Región de Coquimbo — junio 2026"
          className="w-full bg-[var(--surface-2)] border border-[var(--border-m)] rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none focus:border-[var(--accent)]"
        />
      </div>

      {/* Nota */}
      <div>
        <label className="block text-xs text-[var(--muted)] mb-1.5">Nota (opcional)</label>
        <textarea
          value={notas}
          onChange={e => setNotas(e.target.value)}
          rows={2}
          placeholder="Contexto del lote, fuente, campaña de terreno, etc."
          className="w-full bg-[var(--surface-2)] border border-[var(--border-m)] rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none focus:border-[var(--accent)] resize-none"
        />
      </div>

      {/* Drop CSV */}
      <div>
        <label className="block text-xs text-[var(--muted)] mb-1.5">
          Archivo CSV <span className="text-[var(--cobre)]">*</span>
        </label>
        <div
          onDrop={onCsvDrop}
          onDragOver={e => { e.preventDefault(); setArrastrando(true) }}
          onDragLeave={() => setArrastrando(false)}
          onClick={() => csvRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-colors ${
            csvFile
              ? 'border-[var(--musgo)] bg-[var(--musgo)]/5'
              : arrastrando
                ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                : 'border-[var(--border-m)] hover:border-[var(--accent)] hover:bg-[var(--surface-2)]'
          }`}
        >
          <input ref={csvRef} type="file" accept=".csv" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) procesarCsv(f) }} />
          <p className="text-2xl mb-2">{csvFile ? '📂' : '📁'}</p>
          {csvFile ? (
            <>
              <p className="text-sm font-medium text-[var(--text)]">{csvFile.name}</p>
              <p className="text-xs text-[var(--musgo)] mt-1">✓ Archivo cargado</p>
              {nFilas !== null && (
                <span className="inline-block mt-2 text-xs px-3 py-0.5 rounded-full bg-[var(--musgo)]/15 text-[var(--musgo)]">
                  {nFilas} {nFilas === 1 ? 'fila' : 'filas'} detectadas
                </span>
              )}
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-[var(--text)]">Arrastra un CSV o haz clic</p>
              <p className="text-xs text-[var(--muted)] mt-1">UTF-8 · separador coma · 15 columnas</p>
            </>
          )}
        </div>

        {erroresCsv.length > 0 && (
          <div className="mt-2 space-y-1">
            {erroresCsv.map((e, i) => (
              <p key={i} className="text-xs text-[var(--ladrillo)]">⚠ {e}</p>
            ))}
          </div>
        )}
      </div>

      {/* PDFs */}
      <div>
        <label className="block text-xs text-[var(--muted)] mb-1.5">Publicaciones asociadas (opcional)</label>

        {pdfs.length > 0 && (
          <div className="space-y-2 mb-2">
            {pdfs.map((p, i) => (
              <div key={i} className="flex items-center justify-between bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[var(--text)] truncate">{p.titulo}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {[p.autor, p.anio].filter(Boolean).join(', ')}{p.referencia ? ` · ${p.referencia}` : ''}
                  </p>
                </div>
                <button onClick={() => quitarPdf(i)}
                  className="ml-3 text-[var(--faint)] hover:text-[var(--ladrillo)] text-sm transition-colors">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {mostrarPdfForm ? (
          <div className="border border-[var(--border-m)] rounded-xl p-4 space-y-3">
            <p className="text-xs font-medium text-[var(--text)]">Nueva publicación</p>

            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Archivo PDF <span className="text-[var(--cobre)]">*</span></label>
              <input ref={pdfRef} type="file" accept=".pdf"
                onChange={e => setPdfFile(e.target.files?.[0] ?? null)}
                className="text-xs text-[var(--muted)] w-full" />
              {pdfFile && <p className="text-xs text-[var(--musgo)] mt-1">✓ {pdfFile.name}</p>}
            </div>

            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Título <span className="text-[var(--cobre)]">*</span></label>
              <input type="text" value={pdfForm.titulo}
                onChange={e => setPdfForm({ ...pdfForm, titulo: e.target.value })}
                placeholder="Ej: Arqueología del Norte Chico"
                className="w-full bg-[var(--surface-2)] border border-[var(--border-m)] rounded-lg px-3 py-1.5 text-xs text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none focus:border-[var(--accent)]" />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-[var(--muted)] mb-1">Autor</label>
                <input type="text" value={pdfForm.autor}
                  onChange={e => setPdfForm({ ...pdfForm, autor: e.target.value })}
                  placeholder="González, R."
                  className="w-full bg-[var(--surface-2)] border border-[var(--border-m)] rounded-lg px-3 py-1.5 text-xs text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none focus:border-[var(--accent)]" />
              </div>
              <div className="w-20">
                <label className="block text-xs text-[var(--muted)] mb-1">Año</label>
                <input type="number" value={pdfForm.anio}
                  onChange={e => setPdfForm({ ...pdfForm, anio: e.target.value })}
                  placeholder="2024" min="1800" max="2099"
                  className="w-full bg-[var(--surface-2)] border border-[var(--border-m)] rounded-lg px-3 py-1.5 text-xs text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none focus:border-[var(--accent)]" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Referencia</label>
              <input type="text" value={pdfForm.referencia}
                onChange={e => setPdfForm({ ...pdfForm, referencia: e.target.value })}
                placeholder="Revista Chilena de Antropología, Vol. 12"
                className="w-full bg-[var(--surface-2)] border border-[var(--border-m)] rounded-lg px-3 py-1.5 text-xs text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none focus:border-[var(--accent)]" />
            </div>

            {pdfError && <p className="text-xs text-[var(--ladrillo)]">{pdfError}</p>}

            <div className="flex gap-2">
              <button onClick={() => { setMostrarPdfForm(false); setPdfError('') }}
                className="flex-1 text-xs text-[var(--muted)] border border-[var(--border-m)] rounded-lg py-1.5 hover:text-[var(--text)] transition-colors">
                Cancelar
              </button>
              <button onClick={agregarPdf}
                className="flex-1 text-xs bg-[var(--surface-2)] border border-[var(--border-m)] rounded-lg py-1.5 text-[var(--accent)] hover:border-[var(--accent)] transition-colors">
                + Agregar
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setMostrarPdfForm(true)}
            className="w-full text-xs text-[var(--muted)] border border-dashed border-[var(--border-m)] rounded-lg py-2.5 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors">
            + Agregar publicación PDF
          </button>
        )}
      </div>

      {errorEnvio && (
        <div className="bg-[var(--ladrillo)]/10 border border-[var(--ladrillo)]/30 rounded-lg px-4 py-3">
          <p className="text-xs text-[var(--ladrillo)]">⚠ {errorEnvio}</p>
        </div>
      )}

      {/* Acciones */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={handleSubir}
          disabled={!puedeSubir}
          className="flex-1 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:cursor-not-allowed"
          style={{
            background: puedeSubir ? 'var(--accent)' : 'var(--surface-2)',
            color:      puedeSubir ? '#111' : 'var(--faint)',
          }}
        >
          {subiendo ? 'Subiendo...' : 'Subir lote'}
        </button>
      </div>

      {!puedeSubir && !subiendo && (
        <p className="text-xs text-[var(--faint)] text-center -mt-2">
          {!titulo.trim() ? 'Escribe un título para continuar' : !csvFile ? 'Selecciona un archivo CSV' : 'Corrige los errores del CSV'}
        </p>
      )}
    </div>
  )
}
