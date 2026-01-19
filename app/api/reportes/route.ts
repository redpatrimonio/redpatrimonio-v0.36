import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Obtener rol del usuario
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios_autorizados')
      .select('rol')
      .eq('id_usuario', user.id)
      .single()

    if (usuarioError || !usuario) {
      return NextResponse.json({ error: 'Usuario no autorizado' }, { status: 403 })
    }

    // Obtener parámetros de query
    const searchParams = request.nextUrl.searchParams
    const estado = searchParams.get('estado') // 'rojo' | 'amarillo' | 'verde'
    const limit = parseInt(searchParams.get('limit') || '50')

    // Verificar permisos por estado
    if (estado === 'rojo' || estado === 'amarillo') {
      const rolesPermitidos = ['experto', 'partner', 'founder']
      if (!rolesPermitidos.includes(usuario.rol)) {
        return NextResponse.json({ 
          error: 'Requiere rol experto o superior' 
        }, { status: 403 })
      }
    }

    // Construir query
    let query = supabase
      .from('reportes_nuevos')
      .select('*')
      .order('timestamp_creado', { ascending: false })
      .limit(limit)

    // Filtrar por estado si se especifica
    if (estado) {
      query = query.eq('estado_validacion', estado)
    }

    const { data: reportes, error } = await query

    if (error) throw error

    return NextResponse.json({ reportes })

  } catch (error: any) {
    console.error('Error en GET /api/reportes:', error)
    return NextResponse.json({ 
      error: error.message || 'Error del servidor' 
    }, { status: 500 })
  }
}
