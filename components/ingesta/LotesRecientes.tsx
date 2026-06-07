'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Lote {
  id:             string
  titulo:         string
  nombre_archivo: string
  fecha_subida:   string
  n_filas:        number | null
  estado:         string
  subido_por:     string
  _email?:        string
  _n_pdfs?:       number
}

const ESTADO_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  pendiente:   { bg: 'bg-[var(--cobre)]/15',     text: 'text-[var(--cobre)]',   label: 'pendiente' },
  en_revision: { bg: 'bg-[var(--antracita)]/30', text: 'text-[var(--text)]',    label: 'en revisión' },
  aprobado:    { bg: 'bg-[var(--musgo)]/15',      text: 'text-[var(--musgo)]',   label: 'aprobado' },
  rechazado:   { bg: 'bg-[var(--ladrillo)]/15',  text: 'text-[var(--ladrillo)]',label: 'rechazado' },
}

export default function LotesRecientes() {
  const supabase = createClient()
  const [lotes, setLotes]     = useState<Lote[]>([])
  const [loading, setLoading] = useState(true)

  const cargarLotes = useCallback(async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('lotes_ingesta')
      .select('id, titulo, nombre_archivo, fecha_subida, n_filas, estado, subido_por')
      .order('fecha_subida', { ascending: false })
      .limit(10)

    if (error || !data) { setLoading(false); return }

    // Enriquecer: email del usuario y conteo de PDFs
    const enriquecidos = await Promise.all(
      data.map(async (lote) => {
        const { data: ua } = await supabase
          .from('usuarios_autorizados')
          .select('email')
          .eq('id_usuario', lote.subido_por)
          .single()

        const { count } = await supabase
          .from('lotes_ingesta_pdfs')
          .select('id', { count: 'exact', head: true })
          .eq('id_lote', lote.id)

        return {
          ...lote,
          _email:  ua?.email ?? '—',
          _n_pdfs: count ?? 0,
        }
      })
    )

    setLotes(enriquecidos)
    setLoading(false)
  }, [supabase])

  useEffect(() => { cargarLotes() }, [cargarLotes])

  if (loading) {
    return (
      <div className="space-y-2">
        {[1,2,3].map(i => (
          <div key={i} className="h-14 rounded-xl bg-[var(--surface-2)] animate-pulse" />
        ))}
      </div>
    )
  }

  if (lotes.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)] text-center py-6">
        No hay lotes registrados aún.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {lotes.map(lote => {
        const est = ESTADO_STYLE[lote.estado] ?? ESTADO_STYLE['pendiente']
        return (
          <div
            key={lote.id}
            className="flex items-center justify-between bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-3 cursor-pointer hover:border-[var(--border-m)] transition-colors"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--text)] truncate">{lote.titulo}</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                {lote._email}
                {' · '}
                {new Date(lote.fecha_subida).toLocaleDateString('es-CL', { day:'numeric', month:'short', year:'numeric' })}
                {' · '}
                {lote.n_filas !== null ? `${lote.n_filas} filas` : 'filas desconocidas'}
                {lote._n_pdfs ? ` · ${lote._n_pdfs} PDF${lote._n_pdfs > 1 ? 's' : ''}` : ' · sin PDFs'}
              </p>
            </div>
            <div className="flex items-center gap-3 ml-4 flex-shrink-0">
              <span className={`text-xs px-2.5 py-0.5 rounded-full ${est.bg} ${est.text}`}>
                {est.label}
              </span>
              <span className="text-[var(--faint)] text-sm">→</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
