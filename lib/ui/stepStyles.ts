/**
 * stepStyles.ts
 * Tokens de estilo para formularios de reporte (hallazgo, riesgo y futuros).
 * Todos los valores referencian las variables CSS del sistema (globals.css).
 * Usar como: style={stepStyles.input} en cualquier Step o formulario.
 */

import type { CSSProperties } from 'react'

// ─── Contenedor de cada paso ────────────────────────────────────────────────

export const stepCard: CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 16,
  padding: '28px 24px',
}

// ─── Tipografía ─────────────────────────────────────────────────────────────

/** Título del paso — Cormorant Garamond display */
export const stepTitle: CSSProperties = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontWeight: 300,
  fontSize: 'clamp(24px, 5vw, 30px)',
  lineHeight: 1.15,
  color: 'var(--text)',
  marginBottom: 4,
}

/** Subtítulo / descripción del paso */
export const stepSubtitle: CSSProperties = {
  fontSize: 13,
  color: 'var(--muted)',
  lineHeight: 1.6,
  marginBottom: 20,
}

/** Label de campo */
export const fieldLabel: CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: 'var(--muted)',
  marginBottom: 6,
}

/** Texto hint / ayuda debajo del campo */
export const fieldHint: CSSProperties = {
  fontSize: 11,
  color: 'var(--faint)',
  marginTop: 4,
  lineHeight: 1.5,
}

/** Asterisco campo obligatorio */
export const required: CSSProperties = {
  color: 'var(--ladrillo)',
  marginLeft: 2,
}

// ─── Inputs y selects ───────────────────────────────────────────────────────

const baseInput: CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  fontSize: 13,
  color: 'var(--text)',
  background: 'var(--surface-2)',
  border: '1px solid var(--border-m)',
  borderRadius: 10,
  outline: 'none',
  lineHeight: 1.5,
  transition: 'border-color 140ms',
  // El focus ring se maneja con onFocus/onBlur en el componente
  // porque CSS variables no funcionan directamente en :focus inline
}

export const input: CSSProperties = { ...baseInput }
export const textarea: CSSProperties = { ...baseInput, resize: 'vertical' as const, minHeight: 80 }
export const select: CSSProperties = { ...baseInput, cursor: 'pointer' }

/** Estado focus — aplicar con onFocus/onBlur */
export const inputFocus: CSSProperties = {
  borderColor: 'var(--accent)',
}
export const inputBlur: CSSProperties = {
  borderColor: 'var(--border-m)',
}

// ─── Checkboxes y radios ─────────────────────────────────────────────────────

export const checkboxRow: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '6px 8px',
  borderRadius: 8,
  cursor: 'pointer',
}

export const checkboxLabel: CSSProperties = {
  fontSize: 13,
  color: 'var(--text)',
  cursor: 'pointer',
}

export const checkboxContainer: CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: 10,
  padding: '6px 4px',
  maxHeight: 200,
  overflowY: 'auto',
  background: 'var(--surface-2)',
}

// ─── Botones ─────────────────────────────────────────────────────────────────

/** Botón primario — Siguiente / Enviar */
export const btnPrimary: CSSProperties = {
  flex: 1,
  padding: '12px 20px',
  borderRadius: 10,
  fontSize: 13,
  fontWeight: 500,
  background: 'var(--accent)',
  color: '#111110',
  border: 'none',
  cursor: 'pointer',
  transition: 'opacity 120ms, transform 80ms',
}

/** Botón primario deshabilitado */
export const btnPrimaryDisabled: CSSProperties = {
  ...btnPrimary,
  background: 'var(--surface-2)',
  color: 'var(--faint)',
  cursor: 'not-allowed',
  opacity: 0.5,
}

/** Botón secundario — Atrás */
export const btnSecondary: CSSProperties = {
  flex: 1,
  padding: '12px 20px',
  borderRadius: 10,
  fontSize: 13,
  fontWeight: 400,
  background: 'transparent',
  color: 'var(--muted)',
  border: '1px solid var(--border-m)',
  cursor: 'pointer',
  transition: 'border-color 120ms, color 120ms',
}

/** Botón de acción especial (GPS, Aplicar coords, etc.) */
export const btnAction: CSSProperties = {
  width: '100%',
  padding: '11px 16px',
  borderRadius: 10,
  fontSize: 13,
  fontWeight: 500,
  background: 'var(--surface-2)',
  color: 'var(--accent)',
  border: '1px solid var(--border-m)',
  cursor: 'pointer',
  transition: 'border-color 120ms',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
}

/** Botón destructivo pequeño (eliminar foto/archivo) */
export const btnRemove: CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'var(--faint)',
  cursor: 'pointer',
  padding: 4,
  borderRadius: 6,
  transition: 'color 120ms',
  flexShrink: 0,
}

// ─── Zona de drop de archivos ────────────────────────────────────────────────

export const dropZone: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minHeight: 96,
  border: '1.5px dashed var(--border-m)',
  borderRadius: 12,
  cursor: 'pointer',
  transition: 'border-color 140ms',
  background: 'var(--surface-2)',
}

// ─── Mensajes ────────────────────────────────────────────────────────────────

export const errorBox: CSSProperties = {
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid rgba(168,80,64,0.3)',
  background: 'rgba(168,80,64,0.08)',
  fontSize: 12,
  color: 'var(--ladrillo)',
  lineHeight: 1.5,
}

export const infoBox: CSSProperties = {
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: 'var(--surface-2)',
  fontSize: 12,
  color: 'var(--muted)',
  lineHeight: 1.5,
}

export const successBox: CSSProperties = {
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid rgba(78,138,96,0.3)',
  background: 'rgba(78,138,96,0.08)',
  fontSize: 12,
  color: 'var(--musgo)',
  lineHeight: 1.5,
}

export const loadingBox: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: 'var(--surface-2)',
  fontSize: 12,
  color: 'var(--accent)',
}

// ─── Separador ───────────────────────────────────────────────────────────────

export const divider: CSSProperties = {
  borderTop: '1px solid var(--border)',
  margin: '4px 0',
}

// ─── Resumen previo a envío ───────────────────────────────────────────────────

export const summaryBox: CSSProperties = {
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid rgba(143,181,164,0.2)',
  background: 'rgba(143,181,164,0.05)',
  fontSize: 12,
  color: 'var(--muted)',
  lineHeight: 1.7,
}

export const summaryTitle: CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--accent)',
  marginBottom: 6,
}
