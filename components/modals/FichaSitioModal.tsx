'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { InfoContactoDisplay } from '@/components/sitio/InfoContactoDisplay'
import { SolicitarContactoModal } from './SolicitarContactoModal'
import { puedeVerCoordenadasExactas } from '@/lib/utils/accesibilidad'
import { esExpertoOMas } from '@/lib/utils/role'

const supabase = createClient()

interface Foto {
  id_medio: string
  url_publica: string
  descripcion_imagen: string | null
}

interface SitioCompleto {
  id_reporte: string
  nombre_sitio: string
  descripcion_ubicacion: string | null
  latitud: number
  longitud: number
  region: string
  comuna: string
  categoria_general: string | null
  tipologia_especifica: string[] | null
  cultura_asociada: string | null
  periodo_cronologico: string | null
  estado_conservacion: string | null
  codigo_accesibilidad: string
}

interface FichaSitioModalProps {
  idSitio: string
  onClose: () => void
}

export function FichaSitioModal({ idSitio, onClose }: FichaSitioModalProps) {
  const { usuario } = useAuth()
  const [sitio, setSitio] = useState<SitioCompleto | null>(null)
  const [fotos, setFotos] = useState<Foto[]>([])
  const [fotoActual, setFotoActual] = useState(0)
  const [loading, setLoading] = useState(true)
  const [mostrarSolicitud, setMostrarSolicitud] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [idSitio])

  async function cargarDatos() {
    try {
      // Cargar sitio
      const { data: sitioData, error: sitioError } = await supabase
        .from('reportes_nuevos')
        .select('*')
        .eq('id_reporte', idSitio)
        .single()

      if (sitioError) throw sitioError
      setSitio(sitioData)

      // Cargar fotos
      const { data: fotosData } = await supabase
        .from('reportes_medios')
        .select('id_medio, url_publica, descripcion_imagen')
        .eq('id_reporte', idSitio)
        .order('prioridad_visualizacion', { ascending: false })

      setFotos(fotosData || [])
    } catch (err) {
      console.error('Error cargando sitio:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleCompartir() {
    const url = `${window.location.origin}/mapa?sitio=${idSitio}`
    
    if (navigator.share) {
      navigator.share({
        title: sitio?.nombre_sitio,
        text: `${sitio?.nombre_sitio} - Red Patrimonio Chile`,
        url: url
      })
    } else {
      navigator.clipboard.writeText(url)
      alert('Link copiado al portapapeles')
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="text-white text-lg">Cargando...</div>
      </div>
    )
  }

  if (!sitio) return null

  const codigo = sitio.codigo_accesibilidad as 'A' | 'B' | 'C'
const rolUsuario = (usuario?.rol as 'publico' | 'experto' | 'partner' | 'founder') || null
const puedeVerCoordenadas = puedeVerCoordenadasExactas(codigo, rolUsuario)
const puedeVerInfoContacto = codigo === 'A' || (codigo === 'B' && puedeVerCoordenadas) || esExpertoOMas(rolUsuario)
  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-70 z-50 overflow-y-auto"
        onClick={onClose}
      >
        <div 
          className="min-h-screen flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {sitio.nombre_sitio}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-6">
              
              {/* Fotos */}
              {fotos.length > 0 && (
                <div className="space-y-2">
                  <img
                    src={fotos[fotoActual].url_publica}
                    alt={fotos[fotoActual].descripcion_imagen || 'Foto del sitio'}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  {fotos.length > 1 && (
                    <div className="flex gap-2 justify-center">
                      {fotos.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setFotoActual(idx)}
                          className={`w-2 h-2 rounded-full ${
                            idx === fotoActual ? 'bg-green-600' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Ubicación */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">📍 Ubicación</h3>
                <p className="text-gray-700">{sitio.region}, {sitio.comuna}</p>
                {sitio.descripcion_ubicacion && (
                  <p className="text-gray-600 text-sm mt-1">{sitio.descripcion_ubicacion}</p>
                )}
                {puedeVerCoordenadas && (
                  <p className="text-gray-500 text-sm mt-1">
                    {sitio.latitud.toFixed(6)}, {sitio.longitud.toFixed(6)}
                  </p>
                )}
              </div>

              {/* Caracterización */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">🏛️ Caracterización</h3>
                <div className="space-y-1 text-sm">
                  {sitio.categoria_general && (
                    <p><strong>Categoría:</strong> {sitio.categoria_general}</p>
                  )}
                  {sitio.tipologia_especifica && (
                    <p><strong>Tipología:</strong> {sitio.tipologia_especifica.join(', ')}</p>
                  )}
                  {sitio.cultura_asociada && (
                    <p><strong>Cultura:</strong> {sitio.cultura_asociada}</p>
                  )}
                  {sitio.periodo_cronologico && (
                    <p><strong>Periodo:</strong> {sitio.periodo_cronologico}</p>
                  )}
                  {sitio.estado_conservacion && (
                    <p><strong>Estado:</strong> {sitio.estado_conservacion}</p>
                  )}
                </div>
              </div>

              {/* Info Contacto o Solicitud */}
              {puedeVerInfoContacto ? (
                <InfoContactoDisplay idSitio={idSitio} />
              ) : (
                <button
                  onClick={() => setMostrarSolicitud(true)}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  📨 Solicitar información de contacto
                </button>
              )}

              {/* Botón Compartir (solo código A) */}
              {codigo === 'A' && (
                <button
                  onClick={handleCompartir}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  📤 Compartir sitio
                </button>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Modal solicitud */}
      {mostrarSolicitud && (
        <SolicitarContactoModal
          idSitio={idSitio}
          nombreSitio={sitio.nombre_sitio}
          onClose={() => setMostrarSolicitud(false)}
        />
      )}
    </>
  )
}
