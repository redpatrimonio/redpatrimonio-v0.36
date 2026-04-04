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
  descripcion_detallada: string | null
  categoria_general: string | null
  tipologia_especifica: string[] | null
  cultura_asociada: string | null
  periodo_cronologico: string | null
  estado_conservacion: string | null
  declarado_cmn: boolean | null
  decreto_cmn: string | null
  fuente_principal: string | null
  codigo_accesibilidad: string | null
  condicion_visita: string | null
  timestamp_publicacion: string | null
}

interface Medio {
  id_medio: string
  url_publica: string
  titulo: string | null
  descripcion_imagen: string | null
  prioridad_visualizacion: number
  tipo_medio: string
}

export default function SitioDetallePage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [sitio, setSitio] = useState<SitioCompleto | null>(null)
  const [medios, setMedios] = useState<Medio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null)

  useEffect(() => {
    if (id) cargarSitio()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function cargarSitio() {
    try {
      setLoading(true)

      const { data: sitioData, error: sitioError } = await supabase
        .from('sitios_master')
        .select('*')
        .eq('id_sitio', id)
        .single()

      if (sitioError) throw sitioError
      setSitio(sitioData)

      // Imágenes desde tabla medios via id_sitio
      const { data: mediosData } = await supabase
        .from('medios')
        .select('id_medio, url_publica, titulo, descripcion_imagen, prioridad_visualizacion, tipo_medio')
        .eq('id_sitio', id)
        .eq('tipo_medio', 'foto')
        .order('prioridad_visualizacion', { ascending: true })

      setMedios(mediosData || [])

    } catch (err) {
      console.error('Error cargando sitio:', err)
      setError('No se pudo cargar el sitio')
    } finally {
      setLoading(false)
    }
  }

  function goToSlide(index: number) {
    setCurrentIndex(index)
    setTranslateX(0)
  }
  function nextSlide() { setCurrentIndex((prev) => (prev + 1) % medios.length) }
  function prevSlide() { setCurrentIndex((prev) => (prev - 1 + medios.length) % medios.length) }

  function handleDragStart(e: React.MouseEvent | React.TouchEvent) {
    setIsDragging(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    setStartX(clientX)
  }
  function handleDragMove(e: React.MouseEvent | React.TouchEvent) {
    if (!isDragging) return
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    setTranslateX(clientX - startX)
  }
  function handleDragEnd() {
    if (!isDragging) return
    setIsDragging(false)
    if (translateX > 50) prevSlide()
    else if (translateX < -50) nextSlide()
    setTranslateX(0)
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
          <button onClick={() => router.push('/mapa')} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
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
          <button onClick={() => router.push('/mapa')} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-1">
            ← Volver al mapa
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{sitio.nombre_sitio}</h1>
          {sitio.alias_local && (
            <p className="text-xl text-gray-600 italic mb-4">"{sitio.alias_local}"</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">📍 {sitio.region}, {sitio.comuna}</span>
            {sitio.categoria_general && <span className="flex items-center gap-1">🏛️ {sitio.categoria_general}</span>}
            {sitio.cultura_asociada && <span className="flex items-center gap-1">🗿 {sitio.cultura_asociada}</span>}
            {sitio.periodo_cronologico && <span className="flex items-center gap-1">📅 {sitio.periodo_cronologico}</span>}
          </div>
        </div>

        {/* Slideshow */}
        {medios.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="relative">
              <div
                className="relative w-full overflow-hidden bg-black"
                style={{ maxHeight: '50vh' }}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
              >
                <div
                  className="flex transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(calc(-${currentIndex * 100}% + ${translateX}px))` }}
                >
                  {medios.map((medio) => (
                    <div key={medio.id_medio} className="w-full flex-shrink-0" style={{ maxHeight: '50vh' }}>
                      <img
                        src={medio.url_publica}
                        alt={medio.descripcion_imagen || sitio.nombre_sitio}
                        className="w-full h-full object-cover"
                        style={{ maxHeight: '50vh' }}
                        draggable={false}
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setFullscreenIndex(currentIndex)}
                  className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition backdrop-blur-sm"
                  title="Ver en pantalla completa"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                  </svg>
                </button>
              </div>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                {medios.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition ${index === currentIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'}`}
                    aria-label={`Ir a foto ${index + 1}`}
                  />
                ))}
              </div>
            </div>
            {medios[currentIndex]?.descripcion_imagen && (
              <div className="p-4 bg-gray-50">
                <p className="text-sm text-gray-700">{medios[currentIndex].descripcion_imagen}</p>
              </div>
            )}
          </div>
        )}

        {/* Modal Fullscreen */}
        {fullscreenIndex !== null && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setFullscreenIndex(null)}>
            <button onClick={() => setFullscreenIndex(null)} className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition backdrop-blur-sm" aria-label="Cerrar">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={medios[fullscreenIndex].url_publica}
              alt={medios[fullscreenIndex].descripcion_imagen || sitio.nombre_sitio}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Descripción */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Descripción</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {sitio.descripcion_detallada || sitio.descripcion_breve}
          </p>
        </div>

        {/* Información Técnica */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">Información Técnica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Ubicación</h3>
              <div className="space-y-1 text-sm text-gray-700">
                <p><strong>Región:</strong> {sitio.region}</p>
                <p><strong>Comuna:</strong> {sitio.comuna}</p>
                <p><strong>Coordenadas:</strong> {sitio.latitud.toFixed(6)}, {sitio.longitud.toFixed(6)}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Caracterización</h3>
              <div className="space-y-1 text-sm text-gray-700">
                {sitio.categoria_general && <p><strong>Categoría:</strong> {sitio.categoria_general}</p>}
                {sitio.tipologia_especifica && sitio.tipologia_especifica.length > 0 && (
                  <p><strong>Tipología:</strong> {sitio.tipologia_especifica.join(', ')}</p>
                )}
                {sitio.cultura_asociada && <p><strong>Cultura:</strong> {sitio.cultura_asociada}</p>}
                {sitio.periodo_cronologico && <p><strong>Período:</strong> {sitio.periodo_cronologico}</p>}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Estado y Protección</h3>
              <div className="space-y-1 text-sm text-gray-700">
                {sitio.estado_conservacion && <p><strong>Conservación:</strong> {sitio.estado_conservacion}</p>}
                {sitio.declarado_cmn !== null && (
                  <p><strong>Monumento Nacional:</strong> {sitio.declarado_cmn ? 'Sí' : 'No'}</p>
                )}
                {sitio.decreto_cmn && <p><strong>Decreto:</strong> {sitio.decreto_cmn}</p>}
                {sitio.codigo_accesibilidad && (
                  <p><strong>Acceso:</strong> Código {sitio.codigo_accesibilidad}</p>
                )}
              </div>
            </div>

            {(sitio.condicion_visita || sitio.fuente_principal) && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Visita y Fuentes</h3>
                <div className="space-y-1 text-sm text-gray-700">
                  {sitio.condicion_visita && <p><strong>Condición de visita:</strong> {sitio.condicion_visita}</p>}
                  {sitio.fuente_principal && <p><strong>Fuente:</strong> {sitio.fuente_principal}</p>}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t text-xs text-gray-500">
            {sitio.timestamp_publicacion && (
              <p>Publicado: {new Date(sitio.timestamp_publicacion).toLocaleDateString('es-CL')}</p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
