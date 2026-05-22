'use client'

import { useState, useEffect } from 'react'
import {
  CLASIFICACION_CMN,
  CATEGORIAS,
  TIPOLOGIAS,
  CULTURAS,
  PERIODOS
} from '@/lib/constants/tipologias'
import { StepWrapper } from '@/components/ui/StepWrapper'
import { StepButton } from '@/components/ui/StepButton'
import * as S from '@/lib/ui/stepStyles'

interface StepCaracterizacionProps {
  onNext: (data: {
    nombre: string
    clasificacionCMN: string
    categoria: string
    tipologia: string[]
    cultura?: string
    periodo?: string
    declarado_cmn?: string
  }) => void
  onBack: () => void
}

export function StepCaracterizacion({ onNext, onBack }: StepCaracterizacionProps) {
  const [nombre, setNombre] = useState('')
  const [clasificacionCMN, setClasificacionCMN] = useState('')
  const [categoria, setCategoria] = useState('')
  const [tipologiasSeleccionadas, setTipologiasSeleccionadas] = useState<string[]>([])
  const [tipologiasDisponibles, setTipologiasDisponibles] = useState<string[]>([])
  const [cultura, setCultura] = useState('')
  const [periodo, setPeriodo] = useState('')
  const [declaradoCMN, setDeclaradoCMN] = useState('')
  const [error, setError] = useState('')
  const [focusField, setFocusField] = useState<string | null>(null)

  useEffect(() => {
    if (categoria) {
      setTipologiasDisponibles(TIPOLOGIAS[categoria as keyof typeof TIPOLOGIAS])
    } else {
      setTipologiasDisponibles([])
    }
  }, [categoria])

  function handleTipologiaToggle(tip: string) {
    setTipologiasSeleccionadas(prev =>
      prev.includes(tip) ? prev.filter(t => t !== tip) : [...prev, tip]
    )
  }

  function handleNext() {
    if (!nombre || !clasificacionCMN || !categoria) {
      setError('Completa los campos obligatorios')
      return
    }
    const tipologiaFinal = tipologiasSeleccionadas.length > 0
      ? tipologiasSeleccionadas
      : ['No determinado']
    onNext({
      nombre,
      clasificacionCMN,
      categoria,
      tipologia: tipologiaFinal,
      ...(cultura ? { cultura } : {}),
      ...(periodo ? { periodo } : {}),
      ...(declaradoCMN ? { declarado_cmn: declaradoCMN } : {}),
    })
  }

  const canAdvance = !!(nombre && clasificacionCMN && categoria)

  const focusStyle = (field: string) => focusField === field ? S.inputFocus : S.inputBlur

  return (
    <StepWrapper
      step={2}
      totalSteps={5}
      stepLabel="Identificación"
      title="¿Qué tipo de sitio es?"
      subtitle="Caracteriza el hallazgo según la clasificación del CMN."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Nombre */}
        <div>
          <label style={S.fieldLabel}>
            Título <span style={S.required}>*</span>
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Pucará de Quitor"
            style={{ ...S.input, ...focusStyle('nombre') }}
            onFocus={() => setFocusField('nombre')}
            onBlur={() => setFocusField(null)}
          />
        </div>

        {/* Clasificación CMN */}
        <div>
          <label style={S.fieldLabel}>
            Clasificación CMN <span style={S.required}>*</span>
          </label>
          <select
            value={clasificacionCMN}
            onChange={(e) => setClasificacionCMN(e.target.value)}
            style={{ ...S.select, ...focusStyle('clasif') }}
            onFocus={() => setFocusField('clasif')}
            onBlur={() => setFocusField(null)}
          >
            <option value="">Selecciona una clasificación</option>
            {CLASIFICACION_CMN.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Categoría */}
        <div>
          <label style={S.fieldLabel}>
            Categoría <span style={S.required}>*</span>
          </label>
          <select
            value={categoria}
            onChange={(e) => { setCategoria(e.target.value); setTipologiasSeleccionadas([]) }}
            style={{ ...S.select, ...focusStyle('cat') }}
            onFocus={() => setFocusField('cat')}
            onBlur={() => setFocusField(null)}
          >
            <option value="">Selecciona una categoría</option>
            {CATEGORIAS.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {/* Tipologías (múltiples, opcional) */}
        {categoria && (
          <div>
            <label style={S.fieldLabel}>Tipología <span style={{ ...S.fieldHint, textTransform: 'none', letterSpacing: 0 }}>(opcional, puedes elegir varias)</span></label>
            <div style={S.checkboxContainer}>
              {tipologiasDisponibles.map((tip) => (
                <label key={tip} style={S.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={tipologiasSeleccionadas.includes(tip)}
                    onChange={() => handleTipologiaToggle(tip)}
                    style={{ width: 15, height: 15, accentColor: 'var(--accent)', cursor: 'pointer' }}
                  />
                  <span style={S.checkboxLabel}>{tip}</span>
                </label>
              ))}
            </div>
            <p style={S.fieldHint}>
              {tipologiasSeleccionadas.length > 0
                ? `${tipologiasSeleccionadas.length} seleccionada(s)`
                : 'Si no seleccionas, se marcará como “No determinado”'}
            </p>
          </div>
        )}

        {/* Cultura (opcional) */}
        <div>
          <label style={S.fieldLabel}>Cultura asociada <span style={{ ...S.fieldHint, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span></label>
          <select
            value={cultura}
            onChange={(e) => setCultura(e.target.value)}
            style={{ ...S.select, ...focusStyle('cultura') }}
            onFocus={() => setFocusField('cultura')}
            onBlur={() => setFocusField(null)}
          >
            <option value="">Sin especificar</option>
            {CULTURAS.map((cul) => <option key={cul} value={cul}>{cul}</option>)}
          </select>
        </div>

        {/* Periodo (opcional) */}
        <div>
          <label style={S.fieldLabel}>Periodo cultural <span style={{ ...S.fieldHint, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span></label>
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            style={{ ...S.select, ...focusStyle('periodo') }}
            onFocus={() => setFocusField('periodo')}
            onBlur={() => setFocusField(null)}
          >
            <option value="">Sin especificar</option>
            {PERIODOS.map((per) => <option key={per} value={per}>{per}</option>)}
          </select>
        </div>

        {/* Declarado CMN (opcional) */}
        <div>
          <label style={S.fieldLabel}>Declarado por CMN <span style={{ ...S.fieldHint, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span></label>
          <select
            value={declaradoCMN}
            onChange={(e) => setDeclaradoCMN(e.target.value)}
            style={{ ...S.select, ...focusStyle('cmn') }}
            onFocus={() => setFocusField('cmn')}
            onBlur={() => setFocusField(null)}
          >
            <option value="">Sin información</option>
            <option value="Sí">Sí</option>
            <option value="No">No</option>
            <option value="En proceso">En proceso</option>
            <option value="Sin información">Sin información</option>
          </select>
        </div>

        {/* Error */}
        {error && <div style={S.errorBox}>{error}</div>}

        {/* Resumen */}
        {canAdvance && (
          <div style={S.summaryBox}>
            <p style={S.summaryTitle}>Resumen</p>
            <p>
              <strong>Título:</strong> {nombre}<br />
              <strong>Clasificación:</strong> {clasificacionCMN}<br />
              <strong>Categoría:</strong> {categoria}<br />
              <strong>Tipologías:</strong> {tipologiasSeleccionadas.length > 0 ? tipologiasSeleccionadas.join(', ') : 'No determinado'}
              {cultura && <><br /><strong>Cultura:</strong> {cultura}</>}
              {periodo && <><br /><strong>Periodo:</strong> {periodo}</>}
              {declaradoCMN && <><br /><strong>Declarado CMN:</strong> {declaradoCMN}</>}
            </p>
          </div>
        )}

        {/* Botones */}
        <div style={{ display: 'flex', gap: 10 }}>
          <StepButton onClick={onBack} variant="secondary">Atrás</StepButton>
          <StepButton onClick={handleNext} disabled={!canAdvance}>Siguiente</StepButton>
        </div>

      </div>
    </StepWrapper>
  )
}

export default StepCaracterizacion
