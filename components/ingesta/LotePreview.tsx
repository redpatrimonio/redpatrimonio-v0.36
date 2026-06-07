'use client'

import { useState } from 'react'
import { type LoteInfo, type FilaCSV, COLUMNAS_OFICIALES, COLUMNAS_SIN_CAMPO } from './CsvUploader'

interface Props {
  lote: LoteInfo
  nombreArchivo: string
  onReset: () => void
}

const ETIQUETAS: Record<string, string> = {
  tipo_de_registro:      'Tipo',
  nombre:                'Nombre',
  latitud:               'Lat.',
  longitud:              'Lon.',
  descripcion:           'Descripción',
  region:                'Región',
  comuna:                'Comuna',
  codigo_accesibilidad:  'Acceso',
  categoria_cmn:         'Categoría CMN',
  tipologias:            'Tipologías',
  cultura_asociada:      'Cultura',
  periodo_cronologico:   'Período',
  subcategoria:          'Subcategoría',
  que_lo_cubre:          'Qué lo cubre',
  acceso_publico_privado:'Pub/Priv',
}

const BADGE_TIPO: Record<string, string> = {
  arqueologico: 'bg-[var(--tierra)]/20 text-[var(--tierra)]',
  memoria:      'bg-[var(--antracita)]/30 text-[var(--text)]',
  geografico:   'bg-[var(--musgo)]/20 text-[var(--musgo)]',
  turistico:    'bg-[var(--accent)]/20 text-[var(--accent)]',
  comercial:    'bg-[var(--cobre)]/20 text-[var(--cobre)]',
}

function columnasMostrar(tipo: string): string[] {
  const ocultas = COLUMNAS_SIN_CAMPO[tipo] ?? []
  return COLUMNAS_OFICIALES.filter(c => !ocultas.includes(c))
}

function getResumen(filas: FilaCSV[]) {
  const conteo: Record<string, number> = {}
  filas.forEach(f => {
    const t = f['tipo_de_registro']?.toLowerCase() || 'sin_tipo'
    conteo[t] = (conteo[t] ?? 0) + 1
  })
  return conteo
}

export default function LotePreview({ lote, nombreArchivo, onReset }: Props) {
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const resumen = getResumen(lote.filas)

  const filasFiltradas = filtroTipo === 'todos'
    ? lote.filas
    : lote.filas.filter(f => f['tipo_de_registro']?.toLowerCase() === filtroTipo)

  // Columnas a mostrar: intersección de la cabecera del CSV y las aplicables al filtro activo
  const columnasVer = filtroTipo === 'todos'
    ? COLUMNAS_OFICIALES
    : columnasMostrar(filtroTipo)

  const tiposPresentes = Object.keys(resumen)

  return (
    <div className="space-y-4">

      {/* Barra superior */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--text)]">{nombreArchivo}</p>
          <p className="text-xs text-[var(--muted)]">
            {lote.filas.length} {lote.filas.length === 1 ? 'fila' : 'filas'} · {lote.columnasCsv.length} columnas
          </p>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)] rounded-lg px-3 py-1.5 transition-colors"
        >
          ✕ Cargar otro archivo
        </button>
      </div>

      {/* Alertas de cabecera */}
      {lote.erroresCabecera.length > 0 && (
        <div className="bg-[var(--ladrillo)]/10 border border-[var(--ladrillo)]/30 rounded-lg p-4 space-y-1">
          <p className="text-xs font-medium text-[var(--ladrillo)]">⚠ Problemas en la cabecera del CSV</p>
          {lote.erroresCabecera.map((e, i) => (
            <p key={i} className="text-xs text-[var(--muted)]">{e}</p>
          ))}
        </div>
      )}

      {/* Resumen por tipo */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFiltroTipo('todos')}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            filtroTipo === 'todos'
              ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10'
              : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]'
          }`}
        >
          Todos ({lote.filas.length})
        </button>
        {tiposPresentes.map(tipo => (
          <button
            key={tipo}
            onClick={() => setFiltroTipo(tipo)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              filtroTipo === tipo
                ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10'
                : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]'
            }`}
          >
            {tipo} ({resumen[tipo]})
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full text-xs min-w-max">
          <thead className="bg-[var(--surface-2)] border-b border-[var(--border-m)]">
            <tr>
              <th className="px-3 py-2 text-left text-[var(--muted)] font-medium w-8">#</th>
              {columnasVer.map(col => (
                <th key={col} className="px-3 py-2 text-left text-[var(--muted)] font-medium whitespace-nowrap">
                  {ETIQUETAS[col] ?? col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filasFiltradas.map((fila, i) => {
              const tipo = fila['tipo_de_registro']?.toLowerCase() || ''
              const badgeClass = BADGE_TIPO[tipo] ?? 'bg-[var(--surface-2)] text-[var(--muted)]'
              return (
                <tr key={i} className="hover:bg-[var(--surface-2)] transition-colors">
                  <td className="px-3 py-2 text-[var(--faint)]">{i + 1}</td>
                  {columnasVer.map(col => (
                    <td key={col} className="px-3 py-2 text-[var(--text)] whitespace-nowrap max-w-[220px] truncate">
                      {col === 'tipo_de_registro' && fila[col] ? (
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
                          {fila[col]}
                        </span>
                      ) : (
                        <span className={!fila[col] ? 'text-[var(--faint)]' : ''}>
                          {fila[col] || '—'}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>

        {filasFiltradas.length === 0 && (
          <div className="text-center py-10 text-[var(--muted)] text-sm">
            No hay filas para este tipo.
          </div>
        )}
      </div>

      {/* Nota estado */}
      <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-4 py-3">
        <p className="text-xs text-[var(--muted)]">
          <span className="text-[var(--accent)] font-medium">Vista previa solamente.</span>
          {' '}Ningún dato ha sido escrito en la base de datos. La función de importar estará disponible una vez revisados los campos con el equipo.
        </p>
      </div>

    </div>
  )
}
