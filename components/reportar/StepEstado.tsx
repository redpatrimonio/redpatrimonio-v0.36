'use client'

import { useState } from 'react'
import { ESTADO_CONSERVACION, NIVEL_ACCESO } from '@/lib/constants/tipologias'

interface StepEstadoProps {
  onNext: (data: {
    estado_conservacion: string
    nivel_acceso: string
    descripcion: string
    amenazas?: string
  }) => void
  onBack: () => void
}

export function StepEstado({ onNext, onBack }: StepEstadoProps) {
  const [estadoConservacion, setEstadoConservacion] = useState('')
  const [nivelAcceso, setNivelAcceso] = useState('resguardado') // Default
  const [descripcion, setDescripcion] = useState('')
  const [amenazas, setAmenazas] = useState('')
  const [error, setError] = useState('')

  function handleNext() {
    if (!estadoConservacion) {
      setError('Debes seleccionar el estado de conservación')
      return
    }

    if (!descripcion.trim() || descripcion.trim().length < 20) {
      setError('La descripción debe tener al menos 20 caracteres')
      return
    }

    const data: any = {
      estado_conservacion: estadoConservacion,
      nivel_acceso: nivelAcceso,
      descripcion: descripcion.trim(),
    }

    if (amenazas.trim()) {
      data.amenazas = amenazas.trim()
    }

    onNext(data)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Paso 3: Estado y Descripción</h2>
      <p className="text-gray-600 text-sm">
        Describe el estado actual del sitio
      </p>

      {/* Estado de Conservación */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Estado de Conservación <span className="text-red-500">*</span>
        </label>
        <select
          value={estadoConservacion}
          onChange={(e) => setEstadoConservacion(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Selecciona el estado</option>
          {ESTADO_CONSERVACION.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>
      </div>

      {/* Nivel de Acceso */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nivel de Acceso <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {NIVEL_ACCESO.map((nivel) => (
            <label
              key={nivel.value}
              className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition ${
                nivelAcceso === nivel.value
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="nivel_acceso"
                value={nivel.value}
                checked={nivelAcceso === nivel.value}
                onChange={(e) => setNivelAcceso(e.target.value)}
                className="mt-1"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {nivel.value === 'publico' && '🟢 '}
                  {nivel.value === 'restringido' && '🔴 '}
                  {nivel.value === 'resguardado' && '🟡 '}
                  {nivel.label.split(' - ')[0]}
                </p>
                <p className="text-sm text-gray-600">
                  {nivel.label.split(' - ')[1]}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción del Sitio <span className="text-red-500">*</span>
        </label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={4}
          placeholder="Describe el sitio: características visibles, estructuras, materiales, contexto, etc."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          {descripcion.length} / mínimo 20 caracteres
        </p>
      </div>

      {/* Amenazas (opcional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amenazas o Riesgos (opcional)
        </label>
        <textarea
          value={amenazas}
          onChange={(e) => setAmenazas(e.target.value)}
          rows={3}
          placeholder="Ej: Construcción cercana, saqueo, erosión, vandalismo, etc."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
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
          className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium"
        >
          Siguiente →
        </button>
      </div>
    </div>
  )
}
