'use client'

import { useState, useEffect } from 'react'
import {
  CLASIFICACION_CMN,
  CATEGORIAS,
  TIPOLOGIAS,
  CULTURAS,
  PERIODOS
} from '@/lib/constants/tipologias'

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

  useEffect(() => {
    if (categoria) {
      const tipologias = TIPOLOGIAS[categoria as keyof typeof TIPOLOGIAS]
      setTipologiasDisponibles(tipologias)
    } else {
      setTipologiasDisponibles([])
    }
  }, [categoria])

  function handleTipologiaToggle(tip: string) {
    if (tipologiasSeleccionadas.includes(tip)) {
      setTipologiasSeleccionadas(tipologiasSeleccionadas.filter(t => t !== tip))
    } else {
      setTipologiasSeleccionadas([...tipologiasSeleccionadas, tip])
    }
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Paso 2: Identificación</h2>
      <p className="text-gray-600 text-sm">Describe el tipo de sitio</p>

      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Pucará de Quitor"
          className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B]"
        />
      </div>

      {/* Clasificación CMN */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Clasificación <span className="text-red-500">*</span>
        </label>
        <select
          value={clasificacionCMN}
          onChange={(e) => setClasificacionCMN(e.target.value)}
          className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B]"
        >
          <option value="" className="text-gray-400">Selecciona una clasificación</option>
          {CLASIFICACION_CMN.map((c) => (
            <option key={c} value={c} className="text-gray-900">{c}</option>
          ))}
        </select>
      </div>

      {/* Categoría temática */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categoría <span className="text-red-500">*</span>
        </label>
        <select
          value={categoria}
          onChange={(e) => {
            setCategoria(e.target.value)
            setTipologiasSeleccionadas([])
          }}
          className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B]"
        >
          <option value="" className="text-gray-400">Selecciona una categoría</option>
          {CATEGORIAS.map((cat) => (
            <option key={cat} value={cat} className="text-gray-900">{cat}</option>
          ))}
        </select>
      </div>

      {/* Tipologías (múltiples, opcional) */}
      {categoria && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipología (opcional, puedes elegir varias)
          </label>
          <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-white">
            {tipologiasDisponibles.map((tip) => (
              <label key={tip} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 px-2 rounded">
                <input
                  type="checkbox"
                  checked={tipologiasSeleccionadas.includes(tip)}
                  onChange={() => handleTipologiaToggle(tip)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: '#10454B' }}
                />
                <span className="text-sm text-gray-900">{tip}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {tipologiasSeleccionadas.length > 0
              ? `${tipologiasSeleccionadas.length} seleccionada(s)`
              : 'Si no seleccionas, se marcará como "No determinado"'}
          </p>
        </div>
      )}

      {/* Cultura (opcional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Cultura asociada (opcional)</label>
        <select
          value={cultura}
          onChange={(e) => setCultura(e.target.value)}
          className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B]"
        >
          <option value="" className="text-gray-400">Sin especificar</option>
          {CULTURAS.map((cul) => (
            <option key={cul} value={cul} className="text-gray-900">{cul}</option>
          ))}
        </select>
      </div>

      {/* Periodo (opcional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Periodo Cultural (opcional)</label>
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B]"
        >
          <option value="" className="text-gray-400">Sin especificar</option>
          {PERIODOS.map((per) => (
            <option key={per} value={per} className="text-gray-900">{per}</option>
          ))}
        </select>
      </div>

      {/* Declarado por CMN (opcional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Declarado por CMN (opcional)</label>
        <select
          value={declaradoCMN}
          onChange={(e) => setDeclaradoCMN(e.target.value)}
          className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B]"
        >
          <option value="" className="text-gray-400">Sin información</option>
          <option value="Sí" className="text-gray-900">Sí</option>
          <option value="No" className="text-gray-900">No</option>
          <option value="En proceso" className="text-gray-900">En proceso</option>
          <option value="Sin información" className="text-gray-900">Sin información</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Resumen */}
      {nombre && clasificacionCMN && categoria && (
        <div className="border rounded-lg p-4" style={{ backgroundColor: '#f0f7f8', borderColor: '#10454B' }}>
          <p className="text-sm font-medium mb-1" style={{ color: '#10454B' }}>Resumen</p>
          <p className="text-xs text-gray-700">
            <strong>Título:</strong> {nombre}<br />
            <strong>Clasificación:</strong> {clasificacionCMN}<br />
            <strong>Categoría:</strong> {categoria}<br />
            <strong>Tipologías:</strong> {tipologiasSeleccionadas.length > 0 ? tipologiasSeleccionadas.join(', ') : 'No determinado'}
            {cultura && <><br /><strong>Cultura asociada:</strong> {cultura}</>}
            {periodo && <><br /><strong>Periodo Cultural:</strong> {periodo}</>}
            {declaradoCMN && <><br /><strong>Declarado por CMN:</strong> {declaradoCMN}</>}
          </p>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 font-medium"
        >
          Atrás
        </button>
        <button
          onClick={handleNext}
          disabled={!nombre || !clasificacionCMN || !categoria}
          className="flex-1 py-3 rounded-lg font-medium transition disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
          style={{
            backgroundColor: (nombre && clasificacionCMN && categoria) ? '#10454B' : undefined,
            color: (nombre && clasificacionCMN && categoria) ? 'white' : undefined
          }}
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}

export default StepCaracterizacion
