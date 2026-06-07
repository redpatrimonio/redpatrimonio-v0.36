'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { useState } from 'react'
import LoteUploader from '@/components/ingesta/LoteUploader'
import LotesRecientes from '@/components/ingesta/LotesRecientes'

export default function IngestaPage() {
  const { usuario, loading } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[var(--muted)]">Cargando...</p>
      </div>
    )
  }

  if (!usuario || !['founder', 'partner', 'experto'].includes(usuario.rol)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[var(--muted)]">Acceso restringido.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

      {/* Encabezado */}
      <div className="border-b border-[var(--border-m)] pb-6">
        <h1 className="font-display text-3xl font-light text-[var(--text)] mb-1">
          Ingesta de sitios
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Recopilación, revisión y carga de datos al repositorio patrimonial.
        </p>
      </div>

      {/* Kit de descarga */}
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 space-y-4">
        <div>
          <h2 className="text-sm font-medium text-[var(--text)] mb-1">Kit de recopilación</h2>
          <p className="text-xs text-[var(--muted)]">
            Descarga los archivos necesarios para comenzar a recopilar datos según el canal que uses.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href="https://raw.githubusercontent.com/redpatrimonio/redpatrimonio-v0.36/main/_kit_ingesta/instrucciones_agente_extractor.md"
            download
            className="flex items-start gap-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg p-3 hover:border-[var(--accent)] transition-colors group"
          >
            <span className="text-lg mt-0.5">📄</span>
            <div>
              <p className="text-xs font-medium text-[var(--text)] group-hover:text-[var(--accent)] transition-colors leading-snug">
                instrucciones_agente_extractor.md
              </p>
              <p className="text-xs text-[var(--muted)] mt-0.5">Canal A</p>
            </div>
          </a>
          <a
            href="https://raw.githubusercontent.com/redpatrimonio/redpatrimonio-v0.36/main/_kit_ingesta/plantilla_ingesta_base.csv"
            download
            className="flex items-start gap-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg p-3 hover:border-[var(--accent)] transition-colors group"
          >
            <span className="text-lg mt-0.5">📊</span>
            <div>
              <p className="text-xs font-medium text-[var(--text)] group-hover:text-[var(--accent)] transition-colors leading-snug">
                plantilla_ingesta_base.csv
              </p>
              <p className="text-xs text-[var(--muted)] mt-0.5">Canal A</p>
            </div>
          </a>
          <div className="flex items-start gap-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg p-3 opacity-40 cursor-not-allowed">
            <span className="text-lg mt-0.5">📋</span>
            <div>
              <p className="text-xs font-medium text-[var(--text)] leading-snug">
                plantilla_ingesta_manual.xlsx
              </p>
              <p className="text-xs text-[var(--muted)] mt-0.5">Canal B — próximamente</p>
            </div>
          </div>
        </div>
      </section>

      {/* Formulario subida */}
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
        <div className="mb-5">
          <h2 className="text-sm font-medium text-[var(--text)] mb-1">Subir nuevo lote</h2>
          <p className="text-xs text-[var(--muted)]">
            El lote quedará en estado{' '}
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--cobre)]/15 text-[var(--cobre)]">pendiente</span>
            {' '}hasta que sea revisado y aprobado.
          </p>
        </div>
        <LoteUploader onLoteSubido={() => setRefreshKey(k => k + 1)} />
      </section>

      {/* Lotes recientes */}
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
        <div className="mb-4">
          <h2 className="text-sm font-medium text-[var(--text)] mb-1">Lotes recientes</h2>
          <p className="text-xs text-[var(--muted)]">Últimos 10 lotes subidos por el equipo.</p>
        </div>
        <LotesRecientes key={refreshKey} />
      </section>

      {/* Nota */}
      <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-4 py-3">
        <p className="text-xs text-[var(--muted)]">
          <span className="text-[var(--accent)] font-medium">Sin escritura automática.</span>
          {' '}Ningún dato se incorpora a la base de datos sin revisión y aprobación del bibliotecario.
        </p>
      </div>

    </div>
  )
}
