'use client'

/**
 * StepWrapper
 * Contenedor visual para cada paso de formulario.
 *
 * Incluye:
 *  - Barra de progreso (pasos completados vs total)
 *  - Eyebrow con número y nombre del paso
 *  - Título en Cormorant Garamond
 *  - Subtítulo en DM Sans
 *  - Slot para el contenido del paso (children)
 *
 * La lógica de datos y navegación queda en el Step, no aquí.
 */

import * as S from '@/lib/ui/stepStyles'

interface StepWrapperProps {
  /** Paso actual (1-based) */
  step: number
  /** Total de pasos del flujo */
  totalSteps: number
  /** Etiqueta corta del paso actual (ej: "Ubicación") */
  stepLabel: string
  /** Título principal del paso */
  title: string
  /** Subtítulo / instrucción breve */
  subtitle?: string
  children: React.ReactNode
}

export function StepWrapper({
  step,
  totalSteps,
  stepLabel,
  title,
  subtitle,
  children,
}: StepWrapperProps) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '24px 20px 80px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>

        {/* Barra de progreso */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 99,
                  background: i < step
                    ? 'var(--accent)'
                    : 'var(--surface-2)',
                  transition: 'background 300ms',
                }}
              />
            ))}
          </div>

          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              display: 'block', width: 16, height: 1,
              background: 'var(--accent)', opacity: 0.6,
            }} />
            <span style={{
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              opacity: 0.8,
            }}>
              Paso {step} de {totalSteps} — {stepLabel}
            </span>
          </div>
        </div>

        {/* Título */}
        <h1 style={S.stepTitle}>{title}</h1>

        {/* Subtítulo */}
        {subtitle && (
          <p style={S.stepSubtitle}>{subtitle}</p>
        )}

        {/* Contenido del paso */}
        <div style={S.stepCard}>
          {children}
        </div>

      </div>
    </div>
  )
}

export default StepWrapper
