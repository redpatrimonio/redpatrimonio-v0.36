## app/perfil/page.tsx
```tsx
'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { esExpertoOMas, esPartnerOMas, esFounder } from '@/lib/utils/role'

export default function PerfilPage() {
  const { user, usuario, loading, signOut } = useAuth()
  const router = useRouter()

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
              <p className="text-lg text-gray-900">
                {usuario?.nombre_completo || 'Sin nombre'}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-lg text-gray-900">{user.email}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Rol</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                usuario?.rol === 'founder' ? 'bg-purple-100 text-purple-800' :
                usuario?.rol === 'partner' ? 'bg-blue-100 text-blue-800' :
                usuario?.rol === 'experto' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {usuario?.rol?.toUpperCase() || 'PÚBLICO'}
              </span>
            </div>

            {usuario?.telefono && (
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

        {/* Acciones por Rol */}
        {usuario && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Panel de Control
            </h2>

            <div className="space-y-3">
              
              {/* EXPERTO+ → Revisar Reportes */}
              {esExpertoOMas(usuario.rol) && (
                <button
                  onClick={() => router.push('/dashboard/revisar')}
                  className="w-full flex items-center justify-between px-6 py-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg hover:bg-yellow-100 transition group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔍</span>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Revisar Reportes</p>
                      <p className="text-sm text-gray-600">Validar reportes nuevos (rojos)</p>
                    </div>
                  </div>
                  <span className="text-gray-400 group-hover:text-gray-600">→</span>
                </button>
              )}

              {/* PARTNER+ → Aprobar Reportes */}
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

              {/* FOUNDER → Gestionar Usuarios */}
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

              {/* TODOS → Mis Reportes */}
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
        )}

        {/* Info según rol (solo si es público) */}
        {usuario?.rol === 'publico' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              💡 <strong>Eres usuario público.</strong> Puedes reportar sitios arqueológicos. 
              Si eres investigador o arqueólogo, solicita acceso elevado a redpatrimonio.chile@gmail.com
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
```
