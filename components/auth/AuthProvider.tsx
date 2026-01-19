'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Usuario } from '@/types'

interface AuthContextType {
  user: User | null
  usuario: Usuario | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  usuario: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUsuario(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUsuario(session.user.id)
      } else {
        setUsuario(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchUsuario(userId: string) {
    try {
      const { data, error } = await supabase
        .from('usuarios_autorizados')
        .select('*')
        .eq('id_usuario', userId)
        .single()

      if (error) throw error
      setUsuario(data)
    } catch (error) {
      console.error('Error fetching usuario:', error)
      setUsuario(null)
    } finally {
      setLoading(false)
    }
  }

  async function refreshProfile() {
    if (!user?.id) return
    
    try {
      const { data, error } = await supabase
        .from('usuarios_autorizados')
        .select('*')
        .eq('id_usuario', user.id)
        .single()

      if (error) throw error
      setUsuario(data)
    } catch (error) {
      console.error('Error refreshing profile:', error)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ user, usuario, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
