'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'

interface Usuario {
  id_usuario: string
  email: string
  nombre_completo: string | null
  telefono: string | null
  rol: string
  activo: boolean
  creado_por_email: string | null
  fecha_creacion: string
}

export default function PanelUsuariosPage() {
  const { usuario, loading } = useAuth()
  const supabase = createClient()

  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([])
  const [searchEmail, setSearchEmail] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const loadUsuarios = useCallback(async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('usuarios_autorizados')
      .select('*')
      .order('fecha_creacion', { ascending: false })

    if (error) {
      console.error('Error loading usuarios:', error)
    } else {
      setUsuarios(data || [])
      setFilteredUsuarios(data || [])
    }
    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    if (!loading && usuario?.rol === 'founder') {
      loadUsuarios()
    }
  }, [loading, usuario, loadUsuarios])

  useEffect(() => {
    if (searchEmail.trim() === '') {
      setFilteredUsuarios(usuarios)
    } else {
      setFilteredUsuarios(
        usuarios.filter(u => 
          u.email.toLowerCase().includes(searchEmail.toLowerCase())
        )
      )
    }
  }, [searchEmail, usuarios])

  async function handleChangeRol(usuarioId: string, email: string, currentRol: string, newRol: string) {
    if (currentRol === newRol) return

    const confirmMsg = `¿Cambiar rol de ${email} de &quot;${currentRol}&quot; a &quot;${newRol}&quot;?`
    if (!confirm(confirmMsg)) return

    if (usuario?.email === email) {
      alert('No puedes cambiar tu propio rol')
      return
    }

    const { error } = await supabase
      .from('usuarios_autorizados')
      .update({
        rol: newRol,
        creado_por_email: usuario?.email,
        fecha_ultima_actualizacion: new Date().toISOString(),
      })
      .eq('id_usuario', usuarioId)

    if (error) {
      alert('Error al cambiar rol: ' + error.message)
    } else {
      alert(`Rol actualizado: ${email} ahora es &quot;${newRol}&quot;`)
      loadUsuarios()
    }
  }

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando...</p>
      </div>
    )
  }

  if (usuario?.rol !== 'founder') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Acceso denegado. Solo para Founder.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Panel de Usuarios</h1>
          <p className="text-gray-600">Gestión de roles y permisos</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total usuarios</p>
          <p className="text-2xl font-bold">{usuarios.length}</p>
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <input
          type="text"
          placeholder="Buscar por email..."
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Autorizado por</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsuarios.map((u) => (
                <tr key={u.id_usuario} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{u.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {u.nombre_completo || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <select
                      value={u.rol}
                      onChange={(e) => handleChangeRol(u.id_usuario, u.email, u.rol, e.target.value)}
                      disabled={u.email === usuario?.email}
                      className={`px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        u.email === usuario?.email ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                      }`}
                    >
                      <option value="publico">Público</option>
                      <option value="experto">Experto</option>
                      <option value="partner">Partner</option>
                      <option value="founder">Founder</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {u.activo ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ✗ Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {u.creado_por_email || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(u.fecha_creacion).toLocaleDateString('es-CL')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsuarios.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No se encontraron usuarios
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Al cambiar el rol de un usuario, se actualizará automáticamente el campo Autorizado por con tu email.
        </p>
      </div>
    </div>
  )
}
