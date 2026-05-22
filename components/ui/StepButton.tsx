'use client'

/**
 * StepButton
 * Botón reutilizable para navegación entre pasos de formulario.
 *
 * Estados:
 *  - idle:     activo, listo para presionar
 *  - disabled: condición no cumplida, no interactuable
 *  - loading:  enviando/procesando, muestra spinner + texto
 *  - success:  operación completada (checkmark breve antes de avanzar)
 *
 * Feedback táctil: active:scale-[0.97] vía className.
 * El spinner es SVG inline (sin dependencias).
 */

import { CSSProperties } from 'react'
import * as S from '@/lib/ui/stepStyles'

type Variant = 'primary' | 'secondary' | 'action'

interface StepButtonProps {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  success?: boolean
  variant?: Variant
  fullWidth?: boolean
  children: React.ReactNode
  loadingText?: string
  type?: 'button' | 'submit'
}

const spinnerSVG = (
  <svg
    width="15" height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}
  >
    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
)

const checkSVG = (
  <svg
    width="15" height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    style={{ flexShrink: 0 }}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export function StepButton({
  onClick,
  disabled = false,
  loading = false,
  success = false,
  variant = 'primary',
  fullWidth = false,
  children,
  loadingText = 'Procesando...',
  type = 'button',
}: StepButtonProps) {
  const isInert = disabled || loading || success

  // Construir el estilo base según variante y estado
  let baseStyle: CSSProperties
  if (variant === 'secondary') {
    baseStyle = { ...S.btnSecondary }
  } else if (variant === 'action') {
    baseStyle = { ...S.btnAction }
  } else {
    // primary
    baseStyle = disabled ? { ...S.btnPrimaryDisabled } : { ...S.btnPrimary }
  }

  if (fullWidth) baseStyle = { ...baseStyle, width: '100%', flex: 'none' }

  // Estado success: tinte musgo
  if (success && variant === 'primary') {
    baseStyle = {
      ...baseStyle,
      background: 'rgba(78,138,96,0.15)',
      color: 'var(--musgo)',
      border: '1px solid rgba(78,138,96,0.3)',
      cursor: 'default',
    }
  }

  return (
    <button
      type={type}
      onClick={isInert ? undefined : onClick}
      disabled={isInert}
      style={baseStyle}
      // Feedback táctil via Tailwind — scale al presionar
      className="active:scale-[0.97] transition-transform select-none"
      aria-busy={loading}
    >
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {loading && spinnerSVG}
        {success && checkSVG}
        <span>{loading ? loadingText : children}</span>
      </span>
    </button>
  )
}

export default StepButton
