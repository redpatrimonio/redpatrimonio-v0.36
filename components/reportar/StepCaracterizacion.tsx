'use client'

import { useState, useEffect } from 'react'
import { CATEGORIAS, TIPOLOGIAS, CULTURAS, PERIODOS } from '@/lib/constants/tipologias'

interface StepCaracterizacionProps {
  onNext: (data: {
    categoria: string
    tipologia: string
    cultura?: string
    periodo?: string
  }) => void
  onBack: () => void
}

type CaracterizacionData = {
  categoria: string
  tipologia: string
  cultura?: string
  periodo?: string
}

export function StepCaracterizacion({ onNext, onBack }: StepCaracterizacionProps) {
  const [categoria, setCategoria] = useState('')
  const [tipologia, setTipologia] = useState('')
  const [cultura, setCultura] = useState('')
  const [periodo, setPeriodo] = useState('')
  const [tipologiasDisponibles, setTipologiasDisponibles] = useState<string[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (categoria) {
      const tipologias = TIPOLOGIAS[categoria as keyof typeof TIPOLOGIAS] || []
      setTipologiasDisponibles(tipologias)
      setTipologia('')
    } else {
      setTipologiasDisponibles([])
    }
  }, [categoria])

  function handleNext() {
    if (!categoria || !tipologia) {
      setError('Debes seleccionar categoría y tipología')
      return
    }

    const data: CaracterizacionData = {
      categoria,
      tipologia,
      ...(cultura ? { cultura } : {}),
      ...(periodo ? { periodo } : {}),
    }

    onNext(data)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Paso 2: Caracterización</h2>
      <p className="text-gray-600 text-sm">Describe el tipo de sitio arqueológico</p>

      {/* Categoría */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categoría <span className="text-red-500">*</span>
        </label>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="" className="text-gray-400">Selecciona una categoría</option>
          {CATEGORIAS.map((cat) => (
            <option key={cat} value={cat} className="text-gray-900">
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Tipología */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipología <span className="text-red-500">*</span>
        </label>
        <select
          value={tipologia}
          onChange={(e) => setTipologia(e.target.value)}
          disabled={!categoria}
          className={`w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
            !categoria ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
          }`}
        >
          <option value="" className="text-gray-400">
            {categoria ? 'Selecciona una tipología' : 'Primero selecciona categoría'}
          </option>
          {tipologiasDisponibles.map((tip) => (
            <option key={tip} value={tip} className="text-gray-900">
              {tip}
            </option>
          ))}
        </select>
        {categoria && (
          <p className="text-xs text-gray-500 mt-1">{tipologiasDisponibles.length} tipologías disponibles</p>
        )}
      </div>

      {/* Cultura (opcional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Cultura (opcional)</label>
        <select
          value={cultura}
          onChange={(e) => setCultura(e.target.value)}
          className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="" className="text-gray-400">Sin especificar</option>
          {CULTURAS.map((cul) => (
            <option key={cul} value={cul} className="text-gray-900">
              {cul}
            </option>
          ))}
        </select>
      </div>

      {/* Periodo (opcional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Periodo (opcional)</label>
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="" className="text-gray-400">Sin especificar</option>
          {PERIODOS.map((per) => (
            <option key={per} value={per} className="text-gray-900">
              {per}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Resumen */}
      {categoria && tipologia && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 mb-1">Resumen:</p>
          <p className="text-xs text-blue-700">
            <strong>Categoría:</strong> {categoria}
            <br />
            <strong>Tipología:</strong> {tipologia}
            {cultura && (
              <>
                <br />
                <strong>Cultura:</strong> {cultura}
              </>
            )}
            {periodo && (
              <>
                <br />
                <strong>Periodo:</strong> {periodo}
              </>
            )}
          </p>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 font-medium"
        >
          ← Atrás
        </button>
        <button
          onClick={handleNext}
          disabled={!categoria || !tipologia}
          className={`flex-1 py-3 rounded-lg font-medium transition ${
            categoria && tipologia
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Siguiente →
        </button>
      </div>
    </div>
  )
}
export default StepCaracterizacion
