'use client'

import { useState } from 'react'
import {
  ESTADO_CONSERVACION,
  CONDICION_EMPLAZAMIENTO,
  TIPO_PROPIEDAD,
  NIVEL_ACCESO,
  USOS_SUELO,
} from '@/lib/constants/tipologias'
import { StepWrapper } from '@/components/ui/StepWrapper'
import { StepButton } from '@/components/ui/StepButton'
import * as S from '@/lib/ui/stepStyles'

interface StepEstadoProps {
  onNext: (data: {
    estadoconservacion: string
    condicionEmplazamiento: string
    descripcion: string
    tipoPropiedad: string
    nivelacceso: string
    usoSuelo?: string
    usoSueloOtro?: string
    amenazas?: string
    contactoPropietarioPosible?: boolean
    contactoPropietarioInfo?: string
    telefonoUsuarioContacto?: string
  }) => void
  onBack: () => void
}

export function StepEstado({ onNext, onBack }: StepEstadoProps) {
  const [estadoconservacion, setEstadoConservacion] = useState('')
  const [condicionEmplazamiento, setCondicionEmplazamiento] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [tipoPropiedad, setTipoPropiedad] = useState('')
  const [nivelacceso, setNivelAcceso] = useState('Espacio Publico')
  const [descripcionNivelAcceso, setDescripcionNivelAcceso] = useState(NIVEL_ACCESO[0].descripcion)
  const [usoSuelo, setUsoSuelo] = useState('')
  const [usoSueloOtro, setUsoSueloOtro] = useState('')
  const [amenazas, setAmenazas] = useState('')
  const [contactoPropietarioPosible, setContactoPropietarioPosible] = useState<boolean | undefined>(undefined)
  const [contactoPropietarioInfo, setContactoPropietarioInfo] = useState('')
  const [telefonoUsuarioContacto, setTelefonoUsuarioContacto] = useState('')
  const [error, setError] = useState('')
  const [focusField, setFocusField] = useState<string | null>(null)

  function handleNext() {
    if (!estadoconservacion || !condicionEmplazamiento || !descripcion || !tipoPropiedad) {
      setError('Completa los campos obligatorios')
      return
    }
    onNext({
      estadoconservacion,
      condicionEmplazamiento,
      descripcion,
      tipoPropiedad,
      nivelacceso,
      ...(usoSuelo ? { usoSuelo } : {}),
      ...(usoSueloOtro ? { usoSueloOtro } : {}),
      ...(amenazas ? { amenazas } : {}),
      ...(contactoPropietarioPosible !== undefined ? { contactoPropietarioPosible } : {}),
      ...(contactoPropietarioInfo ? { contactoPropietarioInfo } : {}),
      ...(telefonoUsuarioContacto ? { telefonoUsuarioContacto } : {}),
    })
  }

  const canAdvance = !!(estadoconservacion && condicionEmplazamiento && descripcion && tipoPropiedad)
  const focusStyle = (field: string) => focusField === field ? S.inputFocus : S.inputBlur

  return (
    <StepWrapper
      step={3}
      totalSteps={5}
      stepLabel="Condición y Acceso"
      title="¿Cómo está el sitio?"
      subtitle="Describe el estado actual, el acceso y el entorno del sitio."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Estado conservación */}
        <div>
          <label style={S.fieldLabel}>Estado de conservación <span style={S.required}>*</span></label>
          <select value={estadoconservacion} onChange={(e) => setEstadoConservacion(e.target.value)}
            style={{ ...S.select, ...focusStyle('estado') }}
            onFocus={() => setFocusField('estado')} onBlur={() => setFocusField(null)}>
            <option value="">Selecciona</option>
            {ESTADO_CONSERVACION.map((est) => <option key={est} value={est}>{est}</option>)}
          </select>
        </div>

        {/* Condición emplazamiento */}
        <div>
          <label style={S.fieldLabel}>Condición de emplazamiento <span style={S.required}>*</span></label>
          <select value={condicionEmplazamiento} onChange={(e) => setCondicionEmplazamiento(e.target.value)}
            style={{ ...S.select, ...focusStyle('cond') }}
            onFocus={() => setFocusField('cond')} onBlur={() => setFocusField(null)}>
            <option value="">Selecciona</option>
            {CONDICION_EMPLAZAMIENTO.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Descripción */}
        <div>
          <label style={S.fieldLabel}>Descripción <span style={S.required}>*</span></label>
          <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
            rows={3} placeholder="Describe el sitio, cómo llegar, características, etc."
            style={{ ...S.textarea, ...focusStyle('desc') }}
            onFocus={() => setFocusField('desc')} onBlur={() => setFocusField(null)} />
        </div>

        {/* Tipo propiedad */}
        <div>
          <label style={S.fieldLabel}>Tipo de propiedad <span style={S.required}>*</span></label>
          <select value={tipoPropiedad} onChange={(e) => setTipoPropiedad(e.target.value)}
            style={{ ...S.select, ...focusStyle('prop') }}
            onFocus={() => setFocusField('prop')} onBlur={() => setFocusField(null)}>
            <option value="">Selecciona</option>
            {TIPO_PROPIEDAD.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Nivel acceso */}
        <div>
          <label style={S.fieldLabel}>Nivel de acceso <span style={S.required}>*</span></label>
          <select value={nivelacceso}
            onChange={(e) => {
              setNivelAcceso(e.target.value)
              const sel = NIVEL_ACCESO.find(n => n.valor === e.target.value)
              setDescripcionNivelAcceso(sel?.descripcion || '')
            }}
            style={{ ...S.select, ...focusStyle('acceso') }}
            onFocus={() => setFocusField('acceso')} onBlur={() => setFocusField(null)}>
            {NIVEL_ACCESO.map((n) => <option key={n.valor} value={n.valor}>{n.valor}</option>)}
          </select>
          {descripcionNivelAcceso && (
            <p style={{ ...S.fieldHint, fontStyle: 'italic', marginTop: 6 }}>{descripcionNivelAcceso}</p>
          )}
        </div>

        {/* Uso de suelo */}
        <div>
          <label style={S.fieldLabel}>Uso de suelo actual <span style={{ ...S.fieldHint, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span></label>
          <select value={usoSuelo} onChange={(e) => setUsoSuelo(e.target.value)}
            style={{ ...S.select, ...focusStyle('uso') }}
            onFocus={() => setFocusField('uso')} onBlur={() => setFocusField(null)}>
            <option value="">Selecciona</option>
            {USOS_SUELO.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        {usoSuelo === 'Otro' && (
          <div>
            <label style={S.fieldLabel}>Especifica el uso de suelo</label>
            <input type="text" value={usoSueloOtro} onChange={(e) => setUsoSueloOtro(e.target.value)}
              placeholder="Ej: Mixto agrícola-industrial"
              style={{ ...S.input, ...focusStyle('usoOtro') }}
              onFocus={() => setFocusField('usoOtro')} onBlur={() => setFocusField(null)} />
          </div>
        )}

        {/* Amenazas */}
        <div>
          <label style={S.fieldLabel}>Amenazas o riesgos <span style={{ ...S.fieldHint, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span></label>
          <textarea value={amenazas} onChange={(e) => setAmenazas(e.target.value)}
            rows={2} placeholder="Ej: Erosión, construcción cercana, vandalismo..."
            style={{ ...S.textarea, ...focusStyle('amenazas') }}
            onFocus={() => setFocusField('amenazas')} onBlur={() => setFocusField(null)} />
        </div>

        {/* Contacto propietario */}
        <div style={{ ...S.divider, paddingTop: 16 }}>
          <label style={S.fieldLabel}>¿Es posible contactar al propietario?</label>
          <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
            {[{ label: 'Sí', val: true }, { label: 'No', val: false }].map(({ label, val }) => (
              <label key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="radio" name="contactoPropietario"
                  checked={contactoPropietarioPosible === val}
                  onChange={() => setContactoPropietarioPosible(val)}
                  style={{ width: 15, height: 15, accentColor: 'var(--accent)', cursor: 'pointer' }} />
                <span style={S.checkboxLabel}>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {contactoPropietarioPosible === true && (
          <div>
            <label style={S.fieldLabel}>Teléfono, email o dirección del propietario</label>
            <textarea value={contactoPropietarioInfo} onChange={(e) => setContactoPropietarioInfo(e.target.value)}
              rows={2} placeholder="Ej: +56 9 1234 5678, juan@email.com"
              style={{ ...S.textarea, ...focusStyle('propInfo') }}
              onFocus={() => setFocusField('propInfo')} onBlur={() => setFocusField(null)} />
          </div>
        )}

        {/* Teléfono usuario */}
        <div style={{ ...S.divider, paddingTop: 16 }}>
          <label style={S.fieldLabel}>Tu teléfono de contacto <span style={{ ...S.fieldHint, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span></label>
          <input type="tel" value={telefonoUsuarioContacto} onChange={(e) => setTelefonoUsuarioContacto(e.target.value)}
            placeholder="+56 9 1234 5678"
            style={{ ...S.input, ...focusStyle('tel') }}
            onFocus={() => setFocusField('tel')} onBlur={() => setFocusField(null)} />
        </div>

        {error && <div style={S.errorBox}>{error}</div>}

        <div style={{ display: 'flex', gap: 10 }}>
          <StepButton onClick={onBack} variant="secondary">Atrás</StepButton>
          <StepButton onClick={handleNext} disabled={!canAdvance}>Siguiente</StepButton>
        </div>

      </div>
    </StepWrapper>
  )
}

export default StepEstado
