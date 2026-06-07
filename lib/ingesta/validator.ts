/**
 * validator.ts
 * Valida campos obligatorios y formatos antes de mapear.
 * Se ejecuta por fila, devuelve lista de errores (vacía = válido).
 */

import { type FilaCSV } from './mapper'

export interface ErrorValidacion {
  campo:   string
  mensaje: string
}

// Campos obligatorios para todo tipo
const OBLIGATORIOS_BASE: (keyof FilaCSV)[] = ['tipo_de_registro', 'nombre', 'latitud', 'longitud']

// Campos obligatorios adicionales por tipo
const OBLIGATORIOS_TIPO: Record<string, (keyof FilaCSV)[]> = {
  arqueologico: ['codigo_accesibilidad'],
  memoria:      ['que_lo_cubre'],
  geografico:   [],
  turistico:    [],
  comercial:    [],
}

const TIPOS_VALIDOS = ['arqueologico', 'memoria', 'geografico', 'turistico', 'comercial']
const CODIGOS_ACC  = ['A', 'B', 'C']
const ACCESO_VALS  = ['publico', 'privado']

export function validarFila(fila: FilaCSV): ErrorValidacion[] {
  const errores: ErrorValidacion[] = []

  // Campos base obligatorios
  for (const campo of OBLIGATORIOS_BASE) {
    if (!fila[campo]?.trim()) {
      errores.push({ campo, mensaje: `Campo obligatorio vacío` })
    }
  }

  // tipo_de_registro válido
  const tipo = fila.tipo_de_registro?.trim().toLowerCase()
  if (tipo && !TIPOS_VALIDOS.includes(tipo)) {
    errores.push({
      campo:   'tipo_de_registro',
      mensaje: `Valor "${tipo}" no reconocido. Valores válidos: ${TIPOS_VALIDOS.join(', ')}`,
    })
  }

  // Latitud / longitud numéricas
  if (fila.latitud && isNaN(parseFloat(fila.latitud))) {
    errores.push({ campo: 'latitud', mensaje: 'Debe ser un número decimal' })
  }
  if (fila.longitud && isNaN(parseFloat(fila.longitud))) {
    errores.push({ campo: 'longitud', mensaje: 'Debe ser un número decimal' })
  }

  // Rango coordenadas Chile (aproximado)
  const lat = parseFloat(fila.latitud)
  const lon = parseFloat(fila.longitud)
  if (!isNaN(lat) && (lat < -56 || lat > -17)) {
    errores.push({ campo: 'latitud', mensaje: `Fuera del rango Chile (-56 a -17): ${lat}` })
  }
  if (!isNaN(lon) && (lon < -76 || lon > -66)) {
    errores.push({ campo: 'longitud', mensaje: `Fuera del rango Chile (-76 a -66): ${lon}` })
  }

  // codigo_accesibilidad
  if (fila.codigo_accesibilidad?.trim() &&
      !CODIGOS_ACC.includes(fila.codigo_accesibilidad.trim().toUpperCase())) {
    errores.push({
      campo:   'codigo_accesibilidad',
      mensaje: `Valor "${fila.codigo_accesibilidad}" inválido. Debe ser A, B o C`,
    })
  }

  // acceso_publico_privado
  if (fila.acceso_publico_privado?.trim() &&
      !ACCESO_VALS.includes(fila.acceso_publico_privado.trim().toLowerCase())) {
    errores.push({
      campo:   'acceso_publico_privado',
      mensaje: `Valor "${fila.acceso_publico_privado}" inválido. Debe ser publico o privado`,
    })
  }

  // Campos obligatorios adicionales por tipo
  if (TIPOS_VALIDOS.includes(tipo)) {
    for (const campo of (OBLIGATORIOS_TIPO[tipo] ?? [])) {
      if (!fila[campo]?.trim()) {
        errores.push({ campo, mensaje: `Obligatorio para tipo "${tipo}"` })
      }
    }
  }

  return errores
}

/**
 * Valida un lote completo.
 * Devuelve mapa { indice: ErrorValidacion[] } solo para filas con errores.
 */
export function validarLote(filas: FilaCSV[]): Record<number, ErrorValidacion[]> {
  const resultado: Record<number, ErrorValidacion[]> = {}
  filas.forEach((fila, i) => {
    const errores = validarFila(fila)
    if (errores.length > 0) resultado[i + 1] = errores
  })
  return resultado
}
