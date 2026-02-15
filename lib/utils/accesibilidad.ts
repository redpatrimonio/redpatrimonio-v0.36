// lib/utils/accesibilidad.ts
// Funciones helper para el sistema de accesibilidad v0.4

import type { OrigenAcceso, NivelAccesibilidad, CodigoAccesibilidad } from '@/lib/constants/accesibilidad';

/**
 * Calcula el código de accesibilidad (A/B/C) basado en origen y nivel
 * 
 * @param origen_acceso - 'publico' | 'privado'
 * @param nivel_accesibilidad - 'abierto' | 'controlado' | 'protegido' | 'restringido'
 * @returns 'A' | 'B' | 'C'
 */
export function calcularCodigoAccesibilidad(
  origen_acceso: OrigenAcceso,
  nivel_accesibilidad: NivelAccesibilidad
): CodigoAccesibilidad {
  // A: Abierto o Controlado (independiente del origen)
  if (nivel_accesibilidad === 'abierto' || nivel_accesibilidad === 'controlado') {
    return 'A';
  }
  
  // B: Protegido (requiere mostrar área difusa a público)
  if (nivel_accesibilidad === 'protegido') {
    return 'B';
  }
  
  // C: Restringido (solo experto+)
  return 'C';
}

/**
 * Determina si un usuario puede ver un sitio según su rol y el código de accesibilidad
 * 
 * @param codigo_accesibilidad - 'A' | 'B' | 'C'
 * @param rol_usuario - 'publico' | 'experto' | 'partner' | 'founder' | null (sin login)
 * @returns true si puede ver el sitio, false si no
 */
export function puedeVerSitio(
  codigo_accesibilidad: CodigoAccesibilidad,
  rol_usuario: 'publico' | 'experto' | 'partner' | 'founder' | null
): boolean {
  // Sin login: solo código A
  if (!rol_usuario) {
    return codigo_accesibilidad === 'A';
  }
  
  // Usuario público logueado: A y B
  if (rol_usuario === 'publico') {
    return codigo_accesibilidad === 'A' || codigo_accesibilidad === 'B';
  }
  
  // Experto, Partner, Founder: todos (A, B, C)
  return true;
}

/**
 * Determina si un usuario puede ver coordenadas exactas de un sitio
 * 
 * @param codigo_accesibilidad - 'A' | 'B' | 'C'
 * @param rol_usuario - 'publico' | 'experto' | 'partner' | 'founder' | null
 * @returns true si puede ver coordenadas exactas, false si solo área aproximada
 */
export function puedeVerCoordenadasExactas(
  codigo_accesibilidad: CodigoAccesibilidad,
  rol_usuario: 'publico' | 'experto' | 'partner' | 'founder' | null
): boolean {
  // Código A: todos ven coordenadas exactas
  if (codigo_accesibilidad === 'A') {
    return true;
  }
  
  // Código B o C: solo experto+
  if (rol_usuario && ['experto', 'partner', 'founder'].includes(rol_usuario)) {
    return true;
  }
  
  return false;
}
