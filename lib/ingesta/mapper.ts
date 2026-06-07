/**
 * mapper.ts
 * Convierte una FilaCSV al objeto listo para insertar en Supabase
 * según su tipo_de_registro.
 *
 * No escribe nada — devuelve el objeto o lanza error de tipo desconocido.
 */

export type TipoRegistro = 'arqueologico' | 'memoria' | 'geografico' | 'turistico' | 'comercial'

export interface FilaCSV {
  tipo_de_registro:       string
  nombre:                 string
  latitud:                string
  longitud:               string
  descripcion:            string
  region:                 string
  comuna:                 string
  codigo_accesibilidad:   string
  categoria_cmn:          string
  tipologias:             string   // separadas por |
  cultura_asociada:       string
  periodo_cronologico:    string
  subcategoria:           string
  que_lo_cubre:           string
  acceso_publico_privado: string
}

// ---------- helpers ----------

function num(v: string): number | null {
  const n = parseFloat(v)
  return isNaN(n) ? null : n
}

function txt(v: string): string | null {
  return v?.trim() || null
}

function arr(v: string): string[] | null {
  if (!v?.trim()) return null
  return v.split('|').map(s => s.trim()).filter(Boolean)
}

function acceso(v: string): 'publico' | 'privado' | null {
  const n = v?.trim().toLowerCase()
  if (n === 'publico' || n === 'privado') return n
  return null
}

function codAcc(v: string): 'A' | 'B' | 'C' | null {
  const n = v?.trim().toUpperCase()
  if (n === 'A' || n === 'B' || n === 'C') return n
  return null
}

// ---------- mappers por tipo ----------

function mapArqueologico(f: FilaCSV) {
  return {
    nombre_sitio:           txt(f.nombre),
    latitud:                num(f.latitud),
    longitud:               num(f.longitud),
    descripcion_breve:      txt(f.descripcion),
    region:                 txt(f.region),
    comuna:                 txt(f.comuna),
    codigo_accesibilidad:   codAcc(f.codigo_accesibilidad),
    categoria_general:      txt(f.categoria_cmn),
    tipologias:             arr(f.tipologias),
    cultura_asociada:       txt(f.cultura_asociada),
    periodo_cronologico:    txt(f.periodo_cronologico),
    origen_acceso:          acceso(f.acceso_publico_privado),
    capa_destino:           'arqueologico',
    coleccion:              'ENCICLOPEDIA',
    estado_validacion:      'pendiente',
  }
}

function mapMemoria(f: FilaCSV) {
  return {
    nombre:                 txt(f.nombre),
    latitud:                num(f.latitud),
    longitud:               num(f.longitud),
    descripcion:            txt(f.descripcion),
    region:                 txt(f.region),
    comuna:                 txt(f.comuna),
    codigo_accesibilidad:   codAcc(f.codigo_accesibilidad),
    que_lo_cubre:           txt(f.que_lo_cubre),
    estado:                 'pendiente',
  }
}

function mapLugarCapa(f: FilaCSV, capa: string) {
  return {
    nombre:                  txt(f.nombre),
    latitud:                 num(f.latitud),
    longitud:                num(f.longitud),
    descripcion:             txt(f.descripcion),
    region:                  txt(f.region),
    comuna:                  txt(f.comuna),
    subcategoria:            txt(f.subcategoria),
    acceso_publico_privado:  acceso(f.acceso_publico_privado),
    capa:                    capa,
    estado:                  'pendiente',
  }
}

// ---------- export principal ----------

export type MappedRow =
  | { tabla: 'sitios_master';  datos: ReturnType<typeof mapArqueologico> }
  | { tabla: 'sitios_memoria'; datos: ReturnType<typeof mapMemoria> }
  | { tabla: 'lugares_capas';  datos: ReturnType<typeof mapLugarCapa> }

export function mapearFila(f: FilaCSV): MappedRow {
  const tipo = f.tipo_de_registro?.trim().toLowerCase() as TipoRegistro

  switch (tipo) {
    case 'arqueologico':
      return { tabla: 'sitios_master',  datos: mapArqueologico(f) }
    case 'memoria':
      return { tabla: 'sitios_memoria', datos: mapMemoria(f) }
    case 'geografico':
    case 'turistico':
    case 'comercial':
      return { tabla: 'lugares_capas',  datos: mapLugarCapa(f, tipo) }
    default:
      throw new Error(`tipo_de_registro desconocido: "${f.tipo_de_registro}"`)
  }
}

/**
 * Mapea un lote completo.
 * Devuelve:
 *   ok    — filas mapeadas correctamente
 *   error — filas que fallaron con su índice y mensaje
 */
export function mapearLote(filas: FilaCSV[]): {
  ok:    { indice: number; fila: FilaCSV; mapeado: MappedRow }[]
  error: { indice: number; fila: FilaCSV; mensaje: string }[]
} {
  const ok: { indice: number; fila: FilaCSV; mapeado: MappedRow }[] = []
  const error: { indice: number; fila: FilaCSV; mensaje: string }[] = []

  filas.forEach((fila, i) => {
    try {
      ok.push({ indice: i + 1, fila, mapeado: mapearFila(fila) })
    } catch (e: unknown) {
      error.push({ indice: i + 1, fila, mensaje: e instanceof Error ? e.message : 'Error desconocido' })
    }
  })

  return { ok, error }
}
