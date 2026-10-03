'use client'

import { useEffect, useState } from 'react'
import ResguardosPage from '@/app/resguardos/page'

const CONSENTIMIENTO_KEY = 'rp_mapa_consentimiento_v2'

export function BienvenidaMapaModal() {
  const [visible, setVisible] = useState(false)
  const [aceptaUsoResponsable, setAceptaUsoResponsable] = useState(false)
  const [verResguardos, setVerResguardos] = useState(false)

  useEffect(() => {
    const registrado = window.localStorage.getItem(CONSENTIMIENTO_KEY)
    setVisible(registrado !== 'accepted')
  }, [])

  useEffect(() => {
    if (!verResguardos) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVerResguardos(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [verResguardos])

  function handleAceptar() {
    if (!aceptaUsoResponsable) return
    window.localStorage.setItem(CONSENTIMIENTO_KEY, 'accepted')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <>
      <div
        className="fixed inset-0 z-[1200] flex items-end sm:items-center justify-center p-3 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bienvenida-mapa-titulo"
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />

        <section
          className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl border shadow-2xl"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-m)' }}
        >
          <header
            className="p-5 sm:p-6 border-b"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'rgba(143,181,164,0.14)', color: 'var(--accent)' }}
              >
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7.5L12 12l8-4.5M12 12v9" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: 'var(--accent)' }}>
                  Uso responsable del mapa
                </p>
                <h1 id="bienvenida-mapa-titulo" className="font-display text-2xl sm:text-3xl font-light mt-1" style={{ color: 'var(--text)' }}>
                  Explora y protege el patrimonio
                </h1>
              </div>
            </div>
          </header>

          <div className="p-5 sm:p-6 space-y-5">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
              Este mapa reúne información patrimonial para conocer y valorar nuestras culturas ancestrales. Para proteger lugares vulnerables, se ha difuminado la precisión de la ubicación y las funciones disponibles varían según el nivel de resguardo de cada lugar y las autorizaciones correspondientes del usuario.
            </p>

            <div className="space-y-2.5">
              <div className="flex gap-3 p-3 rounded-xl border" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                <span className="w-3 h-3 mt-1 rounded-full flex-shrink-0" style={{ backgroundColor: '#0E3A3D', boxShadow: '0 0 0 3px rgba(181,135,93,0.35)' }} />
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Sitios y lugares para explorar</p>
                  <p className="text-xs leading-relaxed mt-0.5" style={{ color: 'var(--muted)' }}>Los marcadores permiten conocer información disponible mediante sus fichas.</p>
                </div>
              </div>

              <div className="flex gap-3 p-3 rounded-xl border" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                <span className="w-3 h-3 mt-1 rounded-full flex-shrink-0" style={{ backgroundColor: '#2575BA', boxShadow: '0 0 0 3px rgba(37,117,186,0.2)' }} />
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Ubicaciones resguardadas</p>
                  <p className="text-xs leading-relaxed mt-0.5" style={{ color: 'var(--muted)' }}>Algunos puntos o áreas se muestran de forma aproximada para prevenir daño, saqueo o exposición innecesaria.</p>
                </div>
              </div>

              <div className="flex gap-3 p-3 rounded-xl border" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                <span className="w-3 h-3 mt-1 rounded-full flex-shrink-0" style={{ backgroundColor: '#1D1B19', boxShadow: '0 0 0 3px rgba(168,80,64,0.35)' }} />
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Información con acceso limitado</p>
                  <p className="text-xs leading-relaxed mt-0.5" style={{ color: 'var(--muted)' }}>Ciertos antecedentes solo se habilitan para personas autorizadas, en apoyo a la investigación, conservación y gestión patrimonial.</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl p-4 border space-y-3" style={{ backgroundColor: 'rgba(143,181,164,0.08)', borderColor: 'rgba(143,181,164,0.22)' }}>
              <div className="flex gap-2.5">
                <svg className="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
                </svg>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text)' }}>
                  Una ubicación en el mapa no constituye una invitación a intervenir ni excavar. Respeta el entorno, las comunidades, la normativa aplicable y los protocolos de conservación.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVerResguardos(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold underline underline-offset-2"
                style={{ color: 'var(--accent)' }}
              >
                Leer buenas prácticas y resguardos
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6l6 6-6 6" />
                </svg>
              </button>
            </div>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={aceptaUsoResponsable}
                onChange={(e) => setAceptaUsoResponsable(e.target.checked)}
                className="mt-0.5 w-4 h-4 flex-shrink-0"
                style={{ accentColor: 'var(--cobre)' }}
              />
              <span className="text-xs leading-relaxed" style={{ color: 'var(--text)' }}>
                He leído y acepto usar responsablemente la información del mapa. Me comprometo a respetar el patrimonio, no excavar ni alterar sitios, y no divulgar ubicaciones sensibles sin la autorización correspondiente.
              </span>
            </label>
          </div>

          <footer className="p-5 sm:p-6 pt-0">
            <button
              type="button"
              onClick={handleAceptar}
              disabled={!aceptaUsoResponsable}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition"
              style={{
                backgroundColor: aceptaUsoResponsable ? 'var(--cobre)' : 'var(--surface-2)',
                color: aceptaUsoResponsable ? '#FFFFFF' : 'var(--faint)',
                border: aceptaUsoResponsable ? '1px solid var(--cobre)' : '1px solid var(--border)',
                cursor: aceptaUsoResponsable ? 'pointer' : 'not-allowed',
              }}
            >
              <span>Acepto y deseo explorar el mapa</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6l6 6-6 6" />
              </svg>
            </button>
          </footer>
        </section>
      </div>

      {verResguardos && (
        <div
          className="fixed inset-0 z-[1300] flex items-center justify-center p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Buenas prácticas y resguardos"
        >
          <div className="absolute inset-0 bg-black/80" onClick={() => setVerResguardos(false)} />
          <div
            className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-m)' }}
          >
            <div
              className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
            >
              <p className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: 'var(--accent)' }}>
                Buenas prácticas y resguardos
              </p>
              <button
                type="button"
                onClick={() => setVerResguardos(false)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
                style={{ color: 'var(--text)', borderColor: 'var(--border-m)' }}
              >
                Volver al aviso
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <ResguardosPage />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
