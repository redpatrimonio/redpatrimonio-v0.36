'use client'

import { useState, useRef } from 'react'
import LotePreview from './LotePreview'

// Cabecera oficial — fuente de verdad
export const COLUMNAS_OFICIALES = [
  'tipo_de_registro',
  'nombre',
  'latitud',
  'longitud',
  'descripcion',
  'region',
  'comuna',
  'codigo_accesibilidad',
  'categoria_cmn',
  'tipologias',
  'cultura_asociada',
  'periodo_cronologico',
  'subcategoria',
  'que_lo_cubre',
  'acceso_publico_privado',
]

/**
 * Tras la migración del 07/06/2026:
 * - sitios_memoria tiene region, comuna, codigo_accesibilidad
 * - lugares_capas  tiene acceso_publico_privado
 * Todos los tipos aceptan todas las columnas.
 * Solo se ocultan las que semánticamente no aplican.
 */
export const COLUMNAS_SIN_CAMPO: Record<string, string[]> = {
  arqueologico: ['subcategoria', 'que_lo_cubre'],
  memoria:      ['categoria_cmn', 'tipologias', 'cultura_asociada', 'periodo_cronologico', 'subcategoria'],
  geografico:   ['categoria_cmn', 'tipologias', 'cultura_asociada', 'periodo_cronologico', 'que_lo_cubre'],
  turistico:    ['categoria_cmn', 'tipologias', 'cultura_asociada', 'periodo_cronologico', 'que_lo_cubre'],
  comercial:    ['categoria_cmn', 'tipologias', 'cultura_asociada', 'periodo_cronologico', 'que_lo_cubre'],
}

export type FilaCSV = Record<string, string>

export interface LoteInfo {
  filas: FilaCSV[]
  columnasCsv: string[]
  erroresCabecera: string[]
}

function parsearCSV(texto: string): { columnas: string[]; filas: FilaCSV[] } {
  const lineas = texto.trim().split('\n').filter(l => l.trim())
  if (lineas.length < 2) return { columnas: [], filas: [] }

  const columnas = lineas[0].split(',').map(c => c.trim().toLowerCase())
  const filas: FilaCSV[] = lineas.slice(1).map(linea => {
    const valores = linea.split(',')
    const fila: FilaCSV = {}
    columnas.forEach((col, i) => {
      fila[col] = (valores[i] ?? '').trim()
    })
    return fila
  })

  return { columnas, filas }
}

function validarCabecera(columnasCsv: string[]): string[] {
  const errores: string[] = []
  const faltantes = COLUMNAS_OFICIALES.filter(c => !columnasCsv.includes(c))
  const extras    = columnasCsv.filter(c => !COLUMNAS_OFICIALES.includes(c))
  if (faltantes.length > 0) errores.push(`Columnas faltantes: ${faltantes.join(', ')}`)
  if (extras.length > 0)    errores.push(`Columnas no reconocidas: ${extras.join(', ')}`)
  return errores
}

export { COLUMNAS_SIN_CAMPO as default_COLUMNAS_SIN_CAMPO }

export default function CsvUploader() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [lote, setLote] = useState<LoteInfo | null>(null)
  const [nombreArchivo, setNombreArchivo] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [arrastrando, setArrastrando] = useState(false)

  function procesarArchivo(file: File) {
    if (!file.name.endsWith('.csv')) {
      setError('Solo se aceptan archivos .csv')
      return
    }
    setNombreArchivo(file.name)
    setError('')

    const reader = new FileReader()
    reader.onload = (e) => {
      const texto = e.target?.result as string
      const { columnas, filas } = parsearCSV(texto)
      const erroresCabecera = validarCabecera(columnas)
      setLote({ filas, columnasCsv: columnas, erroresCabecera })
    }
    reader.readAsText(file, 'UTF-8')
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) procesarArchivo(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setArrastrando(false)
    const file = e.dataTransfer.files?.[0]
    if (file) procesarArchivo(file)
  }

  function resetear() {
    setLote(null)
    setNombreArchivo('')
    setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  if (lote) {
    return <LotePreview lote={lote} nombreArchivo={nombreArchivo} onReset={resetear} />
  }

  return (
    <div
      onDrop={onDrop}
      onDragOver={(e) => { e.preventDefault(); setArrastrando(true) }}
      onDragLeave={() => setArrastrando(false)}
      onClick={() => inputRef.current?.click()}
      className={`
        border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
        ${
          arrastrando
            ? 'border-[var(--accent)] bg-[var(--accent)]/5'
            : 'border-[var(--border-m)] hover:border-[var(--accent)] hover:bg-[var(--surface-2)]'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={onFileChange}
      />
      <p className="text-3xl mb-3">📂</p>
      <p className="text-sm font-medium text-[var(--text)]">
        Arrastra un archivo .csv aquí o haz clic para seleccionar
      </p>
      <p className="text-xs text-[var(--muted)] mt-1">
        Codificación UTF-8 · separador coma · 15 columnas
      </p>
      {error && (
        <p className="mt-3 text-xs text-[var(--ladrillo)] font-medium">{error}</p>
      )}
    </div>
  )
}
