## lib/utils/role.ts
```typescript
import { Rol } from '@/types'

// Jerarquía de roles (mayor a menor)
const rolesJerarquia: Record<Rol, number> = {
  founder: 4,
  partner: 3,
  experto: 2,
  publico: 1,
}

/**
 * Verifica si un rol tiene permiso para realizar una acción
 * @param rolUsuario - Rol del usuario actual
 * @param rolRequerido - Rol mínimo requerido
 * @returns true si tiene permiso
 */
export function tienePermiso(rolUsuario: Rol | string, rolRequerido: Rol): boolean {
  return rolesJerarquia[rolUsuario as Rol] >= rolesJerarquia[rolRequerido]
}

/**
 * Verifica si el rol es experto o superior
 */
export function esExpertoOMas(rol: Rol | string): boolean {
  return tienePermiso(rol, 'experto')
}

/**
 * Verifica si el rol es partner o superior
 */
export function esPartnerOMas(rol: Rol | string): boolean {
  return tienePermiso(rol, 'partner')
}

/**
 * Verifica si el rol es founder
 */
export function esFounder(rol: Rol | string): boolean {
  return rol === 'founder'
}
```
