'use client'

import { useState } from 'react'
import {
  ESTADO_CONSERVACION,
  CONDICION_EMPLAZAMIENTO,
  TIPO_PROPIEDAD,
  NIVEL_ACCESO,
  USOS_SUELO,
} from '@/lib/constants/tipologias'

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
  const [nivelacceso, setNivelAcceso] = useState('Resguardado')
  const [usoSuelo, setUsoSuelo] = useState('')
  const [usoSueloOtro, setUsoSueloOtro] = useState('')
  const [amenazas, setAmenazas] = useState('')
  const [contactoPropietarioPosible, setContactoPropietarioPosible] = useState<boolean | undefined>(undefined)
  const [contactoPropietarioInfo, setContactoPropietarioInfo] = useState('')
  const [telefonoUsuarioContacto, setTelefonoUsuarioContacto] = useState('')
  const [error, setError] = useState('')

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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Paso 3: Condición y Acceso</h2>
      <p className="text-gray-600 text-sm">Describe el estado actual del sitio</p>

      {/* Estado Conservación */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Estado de conservación <span className="text-red-500">*</span>
        </label>
        <select
          value={estadoconservacion}
          onChange={(e) => setEstadoConservacion(e.target.value)}
          className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B]"
        >
          <option value="" className="text-gray-400">Selecciona</option>
          {ESTADO_CONSERVACION.map((est) => (
            <option key={est} value={est} className="text-gray-900">{est}</option>
          ))}
        </select>
      </div>

      {/* Condición Emplazamiento */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Condición emplazamiento <span className="text-red-500">*</span>
        </label>
        <select
          value={condicionEmplazamiento}
          onChange={(e) => setCondicionEmplazamiento(e.target.value)}
          className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B]"
        >
          <option value="" className="text-gray-400">Selecciona</option>
          {CONDICION_EMPLAZAMIENTO.map((cond) => (
            <option key={cond} value={cond} className="text-gray-900">{cond}</option>
          ))}
        </select>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción <span className="text-red-500">*</span>
        </label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          placeholder="Describe el sitio, cómo llegar, características, etc."
          className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B]"
        />
      </div>

      {/* Tipo Propiedad */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de propiedad <span className="text-red-500">*</span>
        </label>
        <select
          value={tipoPropiedad}
          onChange={(e) => setTipoPropiedad(e.target.value)}
          className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B]"
        >
          <option value="" className="text-gray-400">Selecciona</option>
          {TIPO_PROPIEDAD.map((prop) => (
            <option key={prop} value={prop} className="text-gray-900">{prop}</option>
          ))}
        </select>
      </div>

      {/* Nivel Acceso */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nivel de acceso <span className="text-red-500">*</span>
        </label>
        <select
          value={nivelacceso}
          onChange={(e) => setNivelAcceso(e.target.value)}
          className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B]"
        >
          {NIVEL_ACCESO.map((nivel) => (
            <option key={nivel} value={nivel} className="text-gray-900">{nivel}</option>
          ))}
        </select>
      </div>

      {/* Uso de Suelo (opcional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Uso de suelo actual (opcional)</label>
        <select
          value={usoSuelo}
          onChange={(e) => setUsoSuelo(e.target.value)}
          className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B]"
        >
          <option value="" className="text-gray-400">Selecciona</option>
          {USOS_SUELO.map((uso) => (
            <option key={uso} value={uso} className="text-gray-900">{uso}</option>
          ))}
        </select>
      </div>

      {/* Si eligió "Otro" */}
      {usoSuelo === 'Otro' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Especifica el uso de suelo</label>
          <input
            type="text"
            value={usoSueloOtro}
            onChange={(e) => setUsoSueloOtro(e.target.value)}
            placeholder="Ej: Mixto agrícola-industrial"
            className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B]"
          />
        </div>
      )}

      {/* Amenazas (opcional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Amenazas o riesgos (opcional)</label>
        <textarea
          value={amenazas}
          onChange={(e) => setAmenazas(e.target.value)}
          rows={2}
          placeholder="Ej: Erosión, construcción cercana, vandalismo..."
          className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B]"
        />
      </div>

      {/* Contacto Propietario */}
      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ¿Es posible contactar al propietario del lugar?
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="contactoPropietario"
              checked={contactoPropietarioPosible === true}
              onChange={() => setContactoPropietarioPosible(true)}
              className="w-4 h-4"
              style={{ accentColor: '#10454B' }}
            />
            <span className="text-sm text-gray-900">Sí</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="contactoPropietario"
              checked={contactoPropietarioPosible === false}
              onChange={() => setContactoPropietarioPosible(false)}
              className="w-4 h-4"
              style={{ accentColor: '#10454B' }}
            />
            <span className="text-sm text-gray-900">No</span>
          </label>
        </div>
      </div>

      {/* Si es posible contactar */}
      {contactoPropietarioPosible === true && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono, email o dirección del propietario
          </label>
          <textarea
            value={contactoPropietarioInfo}
            onChange={(e) => setContactoPropietarioInfo(e.target.value)}
            rows={2}
            placeholder="Ej: +56 9 1234 5678, juan@email.com"
            className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B]"
          />
        </div>
      )}

      {/* Teléfono Usuario (siempre visible) */}
      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Si quieres que te contactemos, déjanos tu teléfono (opcional)
        </label>
        <input
          type="tel"
          value={telefonoUsuarioContacto}
          onChange={(e) => setTelefonoUsuarioContacto(e.target.value)}
          placeholder="+56 9 1234 5678"
          className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10454B]"
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
          Atrás
        </button>
        <button
          onClick={handleNext}
          disabled={!estadoconservacion || !condicionEmplazamiento || !descripcion || !tipoPropiedad}
          className="flex-1 py-3 rounded-lg font-medium transition disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
          style={{
            backgroundColor: (estadoconservacion && condicionEmplazamiento && descripcion && tipoPropiedad) ? '#10454B' : undefined,
            color: (estadoconservacion && condicionEmplazamiento && descripcion && tipoPropiedad) ? 'white' : undefined
          }}
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}

export default StepEstado
