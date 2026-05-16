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
 * Word parte los placeholders {{variable}} en múltiples XML runs.
 * Esta función fusiona esos runs rotos antes de pasarlos a docxtemplater.
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

    // Paso 1: extraer todo el texto de cada <w:r> y fusionar runs contiguos
    // que juntos forman un placeholder {{...}}
    // Estrategia: colapsar el contenido de <w:t> eliminando los tags de run intermedios
    // dentro de un mismo párrafo cuando forman parte de un placeholder abierto.

    // Regex: une el contenido de <w:t> tags consecutivos que estén dentro de runs
    // cuando el texto acumulado contiene {{ sin cerrar }}
    xml = fuseRunsInParagraphs(xml)

    zip.file(filename, xml)
  }

  return zip
}

function fuseRunsInParagraphs(xml: string): string {
  // Procesar párrafo por párrafo
  return xml.replace(/<w:p[ >][\s\S]*?<\/w:p>/g, (paragraph) => {
    return fixParagraph(paragraph)
  })
}

function fixParagraph(paragraph: string): string {
  // Extraer todos los runs del párrafo
  const runRegex = /(<w:r[ >][\s\S]*?<\/w:r>)/g
  const runs: string[] = []
  let match
  while ((match = runRegex.exec(paragraph)) !== null) {
    runs.push(match[1])
  }

  if (runs.length === 0) return paragraph

  // Obtener el texto de cada run
  const texts = runs.map(run => {
    const m = run.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/)
    return m ? m[1] : ''
  })

  const combined = texts.join('')

  // Si no hay placeholders en este párrafo, no tocar nada
  if (!combined.includes('{{') && !combined.includes('}}')) return paragraph

  // Fusionar: reconstruir runs colapsando los que forman un placeholder roto
  const fusedRuns: string[] = []
  let buffer = ''
  let bufferRun = ''
  let inTag = false

  for (let i = 0; i < runs.length; i++) {
    const text = texts[i]
    const run = runs[i]

    if (!inTag) {
      if (text.includes('{{') && !text.includes('}}')) {
        // Empieza un tag roto
        inTag = true
        buffer = text
        bufferRun = run
      } else {
        fusedRuns.push(run)
      }
    } else {
      buffer += text
      if (buffer.includes('}}')) {
        // Tag completo: crear un run limpio con el texto fusionado
        // Usar el primer run como base (mantiene el formato)
        const cleanRun = bufferRun.replace(
          /<w:t[^>]*>[\s\S]*?<\/w:t>/,
          `<w:t xml:space="preserve">${buffer}</w:t>`
        )
        fusedRuns.push(cleanRun)
        buffer = ''
        bufferRun = ''
        inTag = false
      }
      // Si aún no cierra, seguir acumulando
    }
  }

  // Si quedó algo en buffer sin cerrar, agregar tal cual
  if (buffer) {
    fusedRuns.push(bufferRun)
  }

  // Reemplazar los runs en el párrafo original
  let result = paragraph
  let searchFrom = 0
  const allRunMatches: Array<{index: number, length: number}> = []
  const runRegex2 = /(<w:r[ >][\s\S]*?<\/w:r>)/g
  let m2
  while ((m2 = runRegex2.exec(paragraph)) !== null) {
    allRunMatches.push({ index: m2.index, length: m2[0].length })
  }

  if (allRunMatches.length !== runs.length) return paragraph

  // Reconstruir el párrafo reemplazando los runs originales por los fusionados
  let output = ''
  let lastIndex = 0
  let fusedIdx = 0

  for (let i = 0; i < allRunMatches.length; i++) {
    const { index, length } = allRunMatches[i]
    output += paragraph.slice(lastIndex, index)

    if (fusedIdx < fusedRuns.length) {
      // ¿Este run original corresponde al inicio de un run fusionado?
      if (fusedRuns[fusedIdx] !== runs[i]) {
        // Este run fue absorbido en el fusionado anterior, saltarlo
        // (ya fue incluido cuando procesamos el run fusionado)
      } else {
        output += fusedRuns[fusedIdx]
        fusedIdx++
      }
    }

    lastIndex = index + length
  }
  output += paragraph.slice(lastIndex)

  // Fallback: si la lógica falla, retornar el original
  if (!output.includes('<w:r')) return paragraph

  return output
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
      inf_nombre:         r.infractor_nombre         || '',
      inf_rut:            r.infractor_rut            || '',
      inf_domicilio:      r.infractor_domicilio      || '',
      inf_telefono:       r.infractor_contacto       || '',
      inf_correo:         '',
      tipo_proyecto:      TIPO_RIESGO_A_CMN[r.tipo_riesgo_principal || ''] || '',
      nombre_proyecto:    r.nombre_proyecto          || '',
      obra_actividad:     r.obra_actividad           || '',
      region:             r.region                   || '',
      comuna:             r.comuna                   || '',
      ubicacion_detalle:  r.descripcion_ubicacion    || '',
      coord_norte,
      coord_este,
      coord_datum,
      coord_huso,
      nombre_propietario: r.nombre_propietario_predio || '',
      fecha_hecho:        r.fecha_observacion
                            ? r.fecha_observacion.split('T')[0].split('-').reverse().join('/')
                            : '',
      descripcion_hechos: r.amenazas                 || '',
      observaciones:      r.observaciones_denuncia   || '',
      den_nombre:         r.autor_reporte            || '',
      den_correo:         r.correo_usuario_contacto  || '',
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
        tag: (e?.properties as Record<string, unknown>)?.tag,
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
