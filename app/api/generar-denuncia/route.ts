import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import fs from 'fs'
import path from 'path'
import { latLonToUTM } from '@/lib/utm'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Word rompe {{variable}} en múltiples <w:r> con <w:t> separados.
 * Estrategia: operar sobre el XML crudo con regex.
 * 
 * Paso 1: extraer texto puro de cada <w:t> y concatenarlos dentro de cada párrafo.
 * Paso 2: si el texto concatenado contiene {{...}}, reemplazar el bloque de runs
 *         que forman el placeholder por un único run limpio.
 * 
 * Alternativa más robusta: reemplazar en el XML crudo cualquier secuencia
 * de <w:t>...</w:t> separados por tags XML (que no sean otro <w:t>) que juntos
 * formen un {{...}}, colapsándolos en un solo <w:t>.
 */
function fixBrokenTags(zip: PizZip): PizZip {
  const xmlFiles = [
    'word/document.xml',
    'word/header1.xml',
    'word/header2.xml',
    'word/footer1.xml',
    'word/footer2.xml',
  ]

  for (const filename of xmlFiles) {
    if (!zip.files[filename]) continue
    let xml = zip.files[filename].asText()
    xml = collapseTagsInXml(xml)
    zip.file(filename, xml)
  }

  return zip
}

/**
 * Estrategia directa sobre XML crudo:
 * Busca secuencias donde el texto visible (contenido de <w:t>) forma un placeholder
 * partido entre múltiples tags, y los colapsa en un solo <w:t>.
 * 
 * Funciona en dos pasadas:
 * 1. Dentro de cada párrafo <w:p>, extrae todos los <w:t> en orden
 * 2. Detecta si alguna subsecuencia de <w:t> forma un {{...}} al concatenarse
 * 3. Reemplaza esa subsecuencia por un único <w:t> con el texto completo
 */
function collapseTagsInXml(xml: string): string {
  // Procesar párrafo a párrafo para no mezclar texto de párrafos distintos
  return xml.replace(/(<w:p[ >][\s\S]*?<\/w:p>)/g, (para) => {
    return fixParaTags(para)
  })
}

function fixParaTags(para: string): string {
  // Extraer todas las posiciones de <w:t>...</w:t> con su índice en la string
  const tRegex = /<w:t(?:[^>]*)>([\s\S]*?)<\/w:t>/g
  interface TMatch { full: string; text: string; index: number }
  const matches: TMatch[] = []
  let m: RegExpExecArray | null

  while ((m = tRegex.exec(para)) !== null) {
    matches.push({ full: m[0], text: m[1], index: m.index })
  }

  if (matches.length === 0) return para

  // Concatenar todos los textos para ver si hay un placeholder roto
  const allText = matches.map(x => x.text).join('')
  if (!allText.includes('{{') || !allText.includes('}}')) return para

  // Encontrar subsecuencias que formen placeholders rotos ({{ sin cerrar en un solo <w:t>)
  // Estrategia: ventana deslizante sobre matches
  let result = para
  let offset = 0 // ajuste de índices por reemplazos anteriores

  for (let i = 0; i < matches.length; i++) {
    const t = matches[i]
    // Si este <w:t> contiene {{ pero no }}, es el inicio de un placeholder roto
    if (t.text.includes('{{') && !t.text.includes('}}')) {
      // Acumular texto de los siguientes <w:t> hasta encontrar el }}
      let accumulated = t.text
      let j = i + 1
      while (j < matches.length) {
        accumulated += matches[j].text
        if (accumulated.includes('}}')) break
        j++
      }

      if (!accumulated.includes('}}')) continue // no se cerró, no tocar

      // Construir el bloque en el XML que va desde el inicio de matches[i] hasta el final de matches[j]
      const startIdx = matches[i].index + offset
      const endIdx   = matches[j].index + offset + matches[j].full.length

      // Texto del bloque original en el resultado actual
      const originalBlock = result.slice(startIdx, endIdx)

      // Reemplazar todos los <w:t>...</w:t> dentro de ese bloque por uno solo con el texto limpio
      // Preservar el primer <w:t> con sus atributos y agregar xml:space="preserve"
      const firstTOpen = originalBlock.match(/<w:t(?:[^>]*)>/)
      const cleanT = `<w:t xml:space="preserve">${accumulated}</w:t>`

      // Nuevo bloque: todo lo que hay antes del primer <w:t>, luego el cleanT,
      // luego todo lo que hay después del último </w:t> en ese bloque
      const firstTIdx  = originalBlock.indexOf(firstTOpen![0])
      const lastTClose = originalBlock.lastIndexOf('</w:t>') + '</w:t>'.length
      const newBlock   = originalBlock.slice(0, firstTIdx) + cleanT + originalBlock.slice(lastTClose)

      result = result.slice(0, startIdx) + newBlock + result.slice(endIdx)
      offset += newBlock.length - originalBlock.length

      // Avanzar i hasta j para no reprocesar los matches ya fusionados
      i = j
    }
  }

  return result
}

const TIPO_RIESGO_A_CMN: Record<string, string> = {
  inmobiliario: 'Inmobiliario',
  transporte: 'Transporte',
  agropecuario: 'Agropecuario',
  mineria: 'Minería',
  extraccion_aridos: 'Otro',
  forestal: 'Forestal',
  portuario: 'Portuario',
  sin_obra: 'Otro',
  indeterminado: 'Otro',
}

export async function GET(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 })

    const supabase = await createClient()
    const { data: r, error } = await supabase
      .from('reportes_nuevos')
      .select('*')
      .eq('id_reporte', id)
      .single()

    if (error || !r) return NextResponse.json({ error: 'Reporte no encontrado', detail: error?.message }, { status: 404 })

    let coord_norte = '', coord_este = '', coord_datum = '', coord_huso = ''
    if (r.latitud && r.longitud) {
      const utm = latLonToUTM(r.latitud, r.longitud)
      coord_norte = utm.northing.toFixed(0)
      coord_este  = utm.easting.toFixed(0)
      coord_datum = 'WGS 84'
      coord_huso  = String(utm.zone)
    }

    const data = {
      inf_nombre:         r.infractor_nombre          || '',
      inf_rut:            r.infractor_rut             || '',
      inf_domicilio:      r.infractor_domicilio       || '',
      inf_telefono:       r.infractor_contacto        || '',
      inf_correo:         '',
      tipo_proyecto:      TIPO_RIESGO_A_CMN[r.tipo_riesgo_principal || ''] || '',
      nombre_proyecto:    r.nombre_proyecto           || '',
      obra_actividad:     r.obra_actividad            || '',
      region:             r.region                    || '',
      comuna:             r.comuna                    || '',
      ubicacion_detalle:  r.descripcion_ubicacion     || '',
      coord_norte,
      coord_este,
      coord_datum,
      coord_huso,
      nombre_propietario: r.nombre_propietario_predio || '',
      fecha_hecho:        r.fecha_observacion
                            ? r.fecha_observacion.split('T')[0].split('-').reverse().join('/')
                            : '',
      descripcion_hechos: r.amenazas                  || '',
      observaciones:      r.observaciones_denuncia    || '',
      den_nombre:         r.autor_reporte             || '',
      den_correo:         r.correo_usuario_contacto   || '',
      den_telefono:       r.telefono_usuario_contacto || '',
      fecha_denuncia:     new Date().toLocaleDateString('es-CL'),
      reporte_id:         r.id_reporte,
    }

    const templatePath = path.join(
      process.cwd(),
      'public',
      'template',
      'formulario_de_denuncia_monumento_arqueologico.docx'
    )

    let content: string
    try {
      content = fs.readFileSync(templatePath, 'binary')
    } catch (fsErr: unknown) {
      const msg = fsErr instanceof Error ? fsErr.message : String(fsErr)
      return NextResponse.json({ error: 'No se pudo leer el template', detail: msg }, { status: 500 })
    }

    let buffer: Buffer
    try {
      const zip = fixBrokenTags(new PizZip(content))
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      })
      doc.render(data)
      buffer = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' })
    } catch (docErr: unknown) {
      const errObj = docErr as Record<string, unknown>
      const props = errObj?.properties as Record<string, unknown> | undefined
      const subErrors = props?.errors as Array<Record<string, unknown>> | undefined
      const detalle = subErrors?.map(e => ({
        message: e?.message,
        tag:  (e?.properties as Record<string, unknown>)?.tag,
        xtag: (e?.properties as Record<string, unknown>)?.xtag,
      }))
      return NextResponse.json({
        error: 'Error en docxtemplater tras fix',
        detail: errObj?.message,
        errores_template: detalle,
      }, { status: 500 })
    }

    const filename = `denuncia_CMN_${r.id_reporte.slice(0, 8)}.docx`

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('generar-denuncia error:', e)
    return NextResponse.json({ error: 'Error inesperado', detail: msg }, { status: 500 })
  }
}
