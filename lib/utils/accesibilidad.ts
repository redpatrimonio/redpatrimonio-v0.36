// Calcular código de accesibilidad A/B/C
export function calcularCodigoAccesibilidad(
  origenAcceso: 'publico' | 'privado',
  nivelAccesibilidad: 'abierto' | 'controlado' | 'protegido' | 'restringido'
): 'A' | 'B' | 'C' {
  if (nivelAccesibilidad === 'abierto' || nivelAccesibilidad === 'controlado') {
    return 'A'
  }
  if (nivelAccesibilidad === 'protegido') {
    return 'B'
  }
  return 'C' // restringido
}

// Determinar si un usuario puede ver un sitio según su código
export function puedeVerSitio(
  codigoAccesibilidad: 'A' | 'B' | 'C',
  rolUsuario: 'publico' | 'experto' | 'partner' | 'founder' | null
): boolean {
  // SIN LOGIN: Solo código A
  if (!rolUsuario) {
    return codigoAccesibilidad === 'A'
  }

  // PÚBLICO LOGUEADO: A y B
  if (rolUsuario === 'publico') {
    return codigoAccesibilidad === 'A' || codigoAccesibilidad === 'B'
  }

  // EXPERTO/PARTNER/FOUNDER: A, B y C
  return true
}

// Determinar si puede ver coordenadas exactas
export function puedeVerCoordenadasExactas(
  codigoAccesibilidad: 'A' | 'B' | 'C',
  rolUsuario: 'publico' | 'experto' | 'partner' | 'founder' | null
): boolean {
  // Solo expertos ven coordenadas de C
  if (codigoAccesibilidad === 'C') {
    return rolUsuario === 'experto' || rolUsuario === 'partner' || rolUsuario === 'founder'
  }

  // B: Expertos ven coordenadas exactas, públicos NO
  if (codigoAccesibilidad === 'B') {
    return rolUsuario === 'experto' || rolUsuario === 'partner' || rolUsuario === 'founder'
  }

  // A: Todos ven coordenadas exactas
  return true
}
