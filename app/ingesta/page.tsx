'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import CsvUploader from '@/components/ingesta/CsvUploader'

export default function IngestaPage() {
  const { usuario, loading } = useAuth()

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
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

      {/* Encabezado */}
      <div className="border-b border-[var(--border-m)] pb-6">
        <h1 className="font-display text-3xl font-light text-[var(--text)] mb-1">
          Ingesta de sitios
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Recopilación, revisión y carga de datos al repositorio patrimonial.
        </p>
      </div>

      {/* Kit de ingesta */}
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 space-y-4">
        <div>
          <h2 className="text-base font-medium text-[var(--text)] mb-1">Kit de recopilación</h2>
          <p className="text-sm text-[var(--muted)]">
            Descarga los archivos necesarios para comenzar a recopilar datos según el canal que uses.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href="https://raw.githubusercontent.com/redpatrimonio/redpatrimonio-v0.36/main/_kit_ingesta/instrucciones_agente_extractor.md"
            download
            className="flex items-start gap-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg p-4 hover:border-[var(--accent)] transition-colors group"
          >
            <span className="text-xl mt-0.5">📄</span>
            <div>
              <p className="text-sm font-medium text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                instrucciones_agente_extractor.md
              </p>
              <p className="text-xs text-[var(--muted)] mt-0.5">Canal A — extracción con agente IA</p>
            </div>
          </a>

          <a
            href="https://raw.githubusercontent.com/redpatrimonio/redpatrimonio-v0.36/main/_kit_ingesta/plantilla_ingesta_base.csv"
            download
            className="flex items-start gap-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg p-4 hover:border-[var(--accent)] transition-colors group"
          >
            <span className="text-xl mt-0.5">📊</span>
            <div>
              <p className="text-sm font-medium text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                plantilla_ingesta_base.csv
              </p>
              <p className="text-xs text-[var(--muted)] mt-0.5">Canal A — cabecera oficial con 15 columnas</p>
            </div>
          </a>

          <div className="flex items-start gap-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg p-4 opacity-50 cursor-not-allowed">
            <span className="text-xl mt-0.5">📋</span>
            <div>
              <p className="text-sm font-medium text-[var(--text)]">
                plantilla_ingesta_manual.xlsx
              </p>
              <p className="text-xs text-[var(--muted)] mt-0.5">Canal B — ingreso manual (próximamente)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Uploader CSV */}
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 space-y-4">
        <div>
          <h2 className="text-base font-medium text-[var(--text)] mb-1">Cargar lote CSV</h2>
          <p className="text-sm text-[var(--muted)]">
            Selecciona un archivo CSV generado por el agente o completado manualmente.
            Los datos se muestran para revisión antes de cualquier escritura en la base de datos.
          </p>
        </div>
        <CsvUploader />
      </section>

    </div>
  )
}
