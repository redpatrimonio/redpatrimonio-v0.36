## app/api/reportes/[id]/route.ts
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

type EstadoValidacion = 'rojo' | 'amarillo' | 'verde'

function isEstadoValidacion(value: unknown): value is EstadoValidacion {
  return value === 'rojo' || value === 'amarillo' || value === 'verde'
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  try {
    return JSON.stringify(err)
  } catch {
    return 'Error desconocido'
  }
}

type UpdateData = {
  estado_validacion: EstadoValidacion
  timestamp_aprobado?: string
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

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

    // Obtener body
    const body: unknown = await request.json()
    const estado_validacion = (body as { estado_validacion?: unknown })?.estado_validacion

    // Validar estado
    if (!isEstadoValidacion(estado_validacion)) {
      return NextResponse.json(
        { error: 'Estado inválido. Debe ser: rojo, amarillo o verde' },
        { status: 400 }
      )
    }

    // Verificar permisos según estado destino
    if (estado_validacion === 'amarillo') {
      // Experto+ puede cambiar a amarillo
      const rolesPermitidos = ['experto', 'partner', 'founder']
      if (!rolesPermitidos.includes(usuario.rol)) {
        return NextResponse.json(
          { error: 'Requiere rol experto o superior para revisar reportes' },
          { status: 403 }
        )
      }
    }

    if (estado_validacion === 'verde') {
      // Solo Partner+ puede aprobar (verde)
      const rolesPermitidos = ['partner', 'founder']
      if (!rolesPermitidos.includes(usuario.rol)) {
        return NextResponse.json(
          { error: 'Requiere rol partner o founder para aprobar reportes' },
          { status: 403 }
        )
      }
    }

    // Preparar datos de actualización
    const updateData: UpdateData = { estado_validacion }

    // Si pasa a verde, actualizar timestamp_aprobado
    if (estado_validacion === 'verde') {
      updateData.timestamp_aprobado = new Date().toISOString()
    }

    // Actualizar reporte
    const { data: reporte, error } = await supabase
      .from('reportes_nuevos')
      .update(updateData)
      .eq('id_reporte', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      mensaje: `Reporte actualizado a ${estado_validacion}`,
      reporte,
    })
  } catch (error: unknown) {
    console.error('Error en PATCH /api/reportes/[id]:', error)
    return NextResponse.json(
      { error: getErrorMessage(error) || 'Error del servidor' },
      { status: 500 }
    )
  }
}
```
