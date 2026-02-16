'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { esExpertoOMas, esPartnerOMas, esFounder } from '@/lib/utils/role'
import { AgregarInfoContactoModal } from '@/components/modals/AgregarInfoContactoModal'


const supabase = createClient()

export const dynamic = 'force-dynamic'

interface SolicitudConDatos {
  id_solicitud: string
  id_sitio: string
  motivo_solicitud: string
  info_adicional_solicitante: string | null
  estado: string
  timestamp_solicitud: string
  timestamp_respuesta: string | null
  notas_rechazo: string | null
  sitio_nombre: string
  sitio_region: string
  sitio_comuna: string
  solicitante_nombre?: string
  solicitante_email?: string
}
const [modalAprobar, setModalAprobar] = useState<{ id_solicitud: string; id_sitio: string; nombre_sitio: string } | null>(null)

export default function PerfilPage() {
  const { user, usuario, loading, signOut } = useAuth()
  const router = useRouter()
  
  const [solicitudesPendientes, setSolicitudesPendientes] = useState<SolicitudConDatos[]>([])
  const [misSolicitudes, setMisSolicitudes] = useState<SolicitudConDatos[]>([])
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(true)

  useEffect(() => {
    if (user && usuario) {
      cargarSolicitudes()
    }
  }, [user, usuario])

  async function cargarSolicitudes() {
    if (!user || !usuario) return

    try {
      setLoadingSolicitudes(true)

      // Si es Partner o Founder, cargar solicitudes pendientes
      if (esPartnerOMas(usuario.rol)) {
        const { data, error } = await supabase
          .from('solicitudes_contacto')
          .select(`
            id_solicitud,
            id_sitio,
            motivo_solicitud,
            info_adicional_solicitante,
            estado,
            timestamp_solicitud,
            timestamp_respuesta,
            notas_rechazo,
            reportes_nuevos!inner(nombre_sitio, region, comuna),
            solicitante:usuarios_autorizados!id_usuario_solicitante(nombre_completo, email)
          `)
          .eq('estado', 'pendiente')
          .order('timestamp_solicitud', { ascending: false })

        if (!error && data) {
          const solicitudesFormateadas = data.map((sol: any) => ({
            id_solicitud: sol.id_solicitud,
            id_sitio: sol.id_sitio,
            motivo_solicitud: sol.motivo_solicitud,
            info_adicional_solicitante: sol.info_adicional_solicitante,
            estado: sol.estado,
            timestamp_solicitud: sol.timestamp_solicitud,
            timestamp_respuesta: sol.timestamp_respuesta,
            notas_rechazo: sol.notas_rechazo,
            sitio_nombre: sol.reportes_nuevos?.nombre_sitio || 'Sin nombre',
            sitio_region: sol.reportes_nuevos?.region || '',
            sitio_comuna: sol.reportes_nuevos?.comuna || '',
            solicitante_nombre: sol.solicitante?.nombre_completo || '',
            solicitante_email: sol.solicitante?.email || ''
          }))
          setSolicitudesPendientes(solicitudesFormateadas)
        }
      }

      // Todos: cargar mis propias solicitudes
      const { data: misSols, error: misError } = await supabase
        .from('solicitudes_contacto')
        .select(`
          id_solicitud,
          id_sitio,
          motivo_solicitud,
          info_adicional_solicitante,
          estado,
          timestamp_solicitud,
          timestamp_respuesta,
          notas_rechazo,
          reportes_nuevos!inner(nombre_sitio, region, comuna)
        `)
        .eq('id_usuario_solicitante', user.id)
        .order('timestamp_solicitud', { ascending: false })

      if (!misError && misSols) {
        const misSolicitudesFormateadas = misSols.map((sol: any) => ({
          id_solicitud: sol.id_solicitud,
          id_sitio: sol.id_sitio,
          motivo_solicitud: sol.motivo_solicitud,
          info_adicional_solicitante: sol.info_adicional_solicitante,
          estado: sol.estado,
          timestamp_solicitud: sol.timestamp_solicitud,
          timestamp_respuesta: sol.timestamp_respuesta,
          notas_rechazo: sol.notas_rechazo,
          sitio_nombre: sol.reportes_nuevos?.nombre_sitio || 'Sin nombre',
          sitio_region: sol.reportes_nuevos?.region || '',
          sitio_comuna: sol.reportes_nuevos?.comuna || ''
        }))
        setMisSolicitudes(misSolicitudesFormateadas)
      }
    } catch (err) {
      console.error('Error cargando solicitudes:', err)
    } finally {
      setLoadingSolicitudes(false)
    }
  }

  function handleAprobarSolicitud(idSolicitud: string, idSitio: string, nombreSitio: string) {
  setModalAprobar({ id_solicitud: idSolicitud, id_sitio: idSitio, nombre_sitio: nombreSitio })
}


  async function handleRechazarSolicitud(idSolicitud: string) {
    const motivo = prompt('Motivo del rechazo (opcional):')
    
    try {
      const { error } = await supabase
        .from('solicitudes_contacto')
        .update({
          estado: 'rechazada',
          timestamp_respuesta: new Date().toISOString(),
          id_usuario_revisor: user?.id,
          notas_rechazo: motivo || null
        })
        .eq('id_solicitud', idSolicitud)

      if (error) throw error

      alert('Solicitud rechazada')
      cargarSolicitudes()
    } catch (err) {
      console.error('Error rechazando:', err)
      alert('Error al rechazar solicitud')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando perfil...</p>
      </div>
    )
  }

  if (!user) {
    router.push('/auth/login')
    return null
  }

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando datos de usuario...</p>
      </div>
    )
  }

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Información del Usuario */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Mi Perfil</h1>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Nombre</p>
              <p className="text-lg text-gray-900">{usuario.nombre_completo || 'Sin nombre'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-lg text-gray-900">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Rol</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                usuario.rol === 'founder' ? 'bg-purple-100 text-purple-800' :
                usuario.rol === 'partner' ? 'bg-blue-100 text-blue-800' :
                usuario.rol === 'experto' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {usuario.rol?.toUpperCase() || 'PÚBLICO'}
              </span>
            </div>
            {usuario.telefono && (
              <div>
                <p className="text-sm font-medium text-gray-500">Teléfono</p>
                <p className="text-lg text-gray-900">{usuario.telefono}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className="mt-6 w-full px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 font-medium transition"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Panel de Control */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Panel de Control</h2>
          <div className="space-y-3">
            
            {/* EXPERTO: Revisar Reportes */}
            {esExpertoOMas(usuario.rol) && (
              <button
                onClick={() => router.push('/dashboard/revisar')}
                className="w-full flex items-center justify-between px-6 py-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg hover:bg-yellow-100 transition group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📋</span>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Revisar Reportes</p>
                    <p className="text-sm text-gray-600">Validar reportes nuevos (rojos)</p>
                  </div>
                </div>
                <span className="text-gray-400 group-hover:text-gray-600">→</span>
              </button>
            )}

            {/* PARTNER: Aprobar Reportes */}
            {esPartnerOMas(usuario.rol) && (
              <button
                onClick={() => router.push('/dashboard/aprobar')}
                className="w-full flex items-center justify-between px-6 py-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✅</span>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Aprobar Reportes</p>
                    <p className="text-sm text-gray-600">Publicar sitios revisados (amarillos)</p>
                  </div>
                </div>
                <span className="text-gray-400 group-hover:text-gray-600">→</span>
              </button>
            )}

            {/* FOUNDER: Gestionar Usuarios */}
            {esFounder(usuario.rol) && (
              <button
                onClick={() => router.push('/panel-usuarios')}
                className="w-full flex items-center justify-between px-6 py-4 bg-purple-50 border-2 border-purple-200 rounded-lg hover:bg-purple-100 transition group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👥</span>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Gestionar Usuarios</p>
                    <p className="text-sm text-gray-600">Asignar roles y permisos</p>
                  </div>
                </div>
                <span className="text-gray-400 group-hover:text-gray-600">→</span>
              </button>
            )}

            {/* TODOS: Mis Reportes */}
            <button
              onClick={() => router.push('/mis-reportes')}
              className="w-full flex items-center justify-between px-6 py-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📝</span>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Mis Reportes</p>
                  <p className="text-sm text-gray-600">Ver reportes que he creado</p>
                </div>
              </div>
              <span className="text-gray-400 group-hover:text-gray-600">→</span>
            </button>
          </div>
        </div>

        {/* PARTNER/FOUNDER: Solicitudes Recibidas */}
        {esPartnerOMas(usuario.rol) && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              📨 Solicitudes de Contacto Recibidas
            </h2>
            
            {loadingSolicitudes ? (
              <p className="text-gray-600 text-sm">Cargando...</p>
            ) : solicitudesPendientes.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay solicitudes pendientes</p>
            ) : (
              <div className="space-y-3">
                {solicitudesPendientes.map(sol => (
                  <div key={sol.id_solicitud} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{sol.sitio_nombre}</p>
                        <p className="text-xs text-gray-500">
                          {sol.sitio_region}, {sol.sitio_comuna}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                        Pendiente
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>Solicitante:</strong> {sol.solicitante_nombre}
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Email:</strong> {sol.solicitante_email}
                    </p>
                    <p className="text-sm text-gray-700 mb-3">
                      <strong>Motivo:</strong> {sol.motivo_solicitud}
                    </p>
                    
                    {sol.info_adicional_solicitante && (
                      <p className="text-xs text-gray-600 mb-3 italic">
                        {sol.info_adicional_solicitante}
                      </p>
                    )}
                    
                    <div className="flex gap-2">
                     <button
  onClick={() => handleAprobarSolicitud(sol.id_solicitud, sol.id_sitio, sol.sitio_nombre)}
  className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
>
  ✓ Aprobar
</button>

                      <button
                        onClick={() => handleRechazarSolicitud(sol.id_solicitud)}
                        className="flex-1 px-3 py-2 border border-red-300 text-red-700 rounded hover:bg-red-50 text-sm"
                      >
                        ✗ Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TODOS: Mis Solicitudes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            📬 Mis Solicitudes de Contacto
          </h2>
          
          {loadingSolicitudes ? (
            <p className="text-gray-600 text-sm">Cargando...</p>
          ) : misSolicitudes.length === 0 ? (
            <p className="text-gray-500 text-sm">No has realizado solicitudes aún</p>
          ) : (
            <div className="space-y-3">
              {misSolicitudes.map(sol => (
                <div key={sol.id_solicitud} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{sol.sitio_nombre}</p>
                      <p className="text-xs text-gray-500">
                        Solicitado: {new Date(sol.timestamp_solicitud).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      sol.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                      sol.estado === 'aprobada' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {sol.estado === 'pendiente' ? 'Pendiente' :
                       sol.estado === 'aprobada' ? 'Aprobada' : 'Rechazada'}
                    </span>
                  </div>
                  
                  {sol.estado === 'rechazada' && sol.notas_rechazo && (
                    <p className="text-sm text-red-600 mt-2">
                      <strong>Motivo:</strong> {sol.notas_rechazo}
                    </p>
                  )}
                  
                  {sol.estado === 'aprobada' && (
                    <p className="text-sm text-green-600 mt-2">
                      ✅ Info de contacto disponible en la ficha del sitio
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info según rol (solo si es público) */}
        {usuario.rol === 'publico' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Eres usuario público.</strong> Puedes reportar sitios arqueológicos. 
              Si eres investigador o arqueólogo, solicita acceso elevado a redpatrimonio.chile@gmail.com
            </p>
          </div>
        )}
      </div>
              {/* Modal Aprobar */}
      {modalAprobar && (
        <AgregarInfoContactoModal
          idSitio={modalAprobar.id_sitio}
          idSolicitud={modalAprobar.id_solicitud}
          nombreSitio={modalAprobar.nombre_sitio}
          onClose={() => setModalAprobar(null)}
          onSuccess={() => {
            setModalAprobar(null)
            cargarSolicitudes()
          }}
        />
      )}

    </div>
  )
}
