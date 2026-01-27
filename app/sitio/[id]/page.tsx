'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

interface SitioCompleto {
  id_sitio: string
  nombre_sitio: string
  alias_local: string | null
  latitud: number
  longitud: number
  region: string
  comuna: string
  descripcion_breve: string
  descripcion_completa: string | null
  categoria_general: string
  tipologia_especifica: string[] | null
  cultura_asociada: string | null
  periodo_cronologico: string | null
  estado_conservacion: string | null
  nivel_proteccion: string | null
  nivel_acceso: string
  fuente_informacion: string | null
  timestamp_creado: string
  timestamp_actualizado: string | null
}

interface Medio {
  id_medio: string
  url_publica: string
  tipo_medio: string
  descripcion_imagen: string | null
  credito_autor: string | null
  prioridad_visualizacion: number
}

export default function SitioDetallePage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [sitio, setSitio] = useState<SitioCompleto | null>(null)
  const [medios, setMedios] = useState<Medio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      cargarSitio()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function cargarSitio() {
    try {
      setLoading(true)

      // Cargar sitio
      const { data: sitioData, error: sitioError } = await supabase
        .from('sitios_master')
        .select('*')
        .eq('id_sitio', id)
        .single()

      if (sitioError) throw sitioError

      // Verificar nivel de acceso
      if (sitioData.nivel_acceso !== 'resguardado') {
        setError('Este sitio tiene acceso restringido')
        return
      }

      setSitio(sitioData)

      // Cargar medios
      const { data: mediosData } = await supabase
        .from('sitios_medios')
        .select('*')
        .eq('id_sitio', id)
        .order('prioridad_visualizacion', { ascending: false })

      setMedios(mediosData || [])
    } catch (err) {
      console.error('Error cargando sitio:', err)
      setError('No se pudo cargar el sitio')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando sitio...</p>
        </div>
      </div>
    )
  }

  if (error || !sitio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <p className="text-red-600 text-lg mb-4">{error || 'Sitio no encontrado'}</p>
          <button
            onClick={() => router.push('/mapa')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            ← Volver al mapa
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 pb-20">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <button
            onClick={() => router.push('/mapa')}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-1"
          >
            ← Volver al mapa
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {sitio.nombre_sitio}
          </h1>
          
          {sitio.alias_local && (
            <p className="text-xl text-gray-600 italic mb-4">
              "{sitio.alias_local}"
            </p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              📍 {sitio.region}, {sitio.comuna}
            </span>
            <span className="flex items-center gap-1">
              🏛️ {sitio.categoria_general}
            </span>
            {sitio.cultura_asociada && (
              <span className="flex items-center gap-1">
                🗿 {sitio.cultura_asociada}
              </span>
            )}
            {sitio.periodo_cronologico && (
              <span className="flex items-center gap-1">
                📅 {sitio.periodo_cronologico}
              </span>
            )}
          </div>
        </div>

        {/* Galería de Imágenes */}
        {medios.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Galería ({medios.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {medios.map((medio) => (
                <div key={medio.id_medio} className="relative group">
                  <img
                    src={medio.url_publica}
                    alt={medio.descripcion_imagen || sitio.nombre_sitio}
                    className="w-full h-64 object-cover rounded-lg border border-gray-300"
                  />
                  {medio.descripcion_imagen && (
                    <p className="text-xs text-gray-600 mt-2">
                      {medio.descripcion_imagen}
                    </p>
                  )}
                  {medio.credito_autor && (
                    <p className="text-xs text-gray-500 italic">
                      Foto: {medio.credito_autor}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Descripción */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Descripción</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {sitio.descripcion_completa || sitio.descripcion_breve}
          </p>
        </div>

        {/* Información Técnica */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
            Información Técnica
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Ubicación */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Ubicación</h3>
              <div className="space-y-1 text-sm text-gray-700">
                <p><strong>Región:</strong> {sitio.region}</p>
                <p><strong>Comuna:</strong> {sitio.comuna}</p>
                <p><strong>Coordenadas:</strong> {sitio.latitud.toFixed(6)}, {sitio.longitud.toFixed(6)}</p>
              </div>
            </div>

            {/* Caracterización */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Caracterización</h3>
              <div className="space-y-1 text-sm text-gray-700">
                <p><strong>Categoría:</strong> {sitio.categoria_general}</p>
                {sitio.tipologia_especifica && sitio.tipologia_especifica.length > 0 && (
                  <p><strong>Tipología:</strong> {sitio.tipologia_especifica.join(', ')}</p>
                )}
                {sitio.cultura_asociada && (
                  <p><strong>Cultura:</strong> {sitio.cultura_asociada}</p>
                )}
                {sitio.periodo_cronologico && (
                  <p><strong>Período:</strong> {sitio.periodo_cronologico}</p>
                )}
              </div>
            </div>

            {/* Estado */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Estado y Conservación</h3>
              <div className="space-y-1 text-sm text-gray-700">
                {sitio.estado_conservacion && (
                  <p><strong>Estado:</strong> {sitio.estado_conservacion}</p>
                )}
                {sitio.nivel_proteccion && (
                  <p><strong>Protección:</strong> {sitio.nivel_proteccion}</p>
                )}
                <p>
                  <strong>Acceso:</strong>{' '}
                  {sitio.nivel_acceso === 'resguardado' && '🟡 Resguardado'}
                  {sitio.nivel_acceso === 'restringido' && '🔴 Restringido'}
                  {sitio.nivel_acceso === 'publico' && '🟢 Público'}
                </p>
              </div>
            </div>

            {/* Fuentes */}
            {sitio.fuente_informacion && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Fuentes</h3>
                <p className="text-sm text-gray-700">{sitio.fuente_informacion}</p>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="mt-6 pt-4 border-t text-xs text-gray-500">
            <p>Creado: {new Date(sitio.timestamp_creado).toLocaleDateString('es-CL')}</p>
            {sitio.timestamp_actualizado && (
              <p>Actualizado: {new Date(sitio.timestamp_actualizado).toLocaleDateString('es-CL')}</p>
            )}
          </div>
        </div>

        {/* Mapa de ubicación */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ubicación</h2>
          <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
            <p className="text-gray-600">
              Mapa interactivo: {sitio.latitud.toFixed(6)}, {sitio.longitud.toFixed(6)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              (Puedes integrar aquí un mapa estático o Leaflet centrado en el sitio)
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
