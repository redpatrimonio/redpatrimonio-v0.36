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
 * Word rompe {{variable}} en múltiples <w:t> dentro de distintos <w:r>.
 * Estrategia SEGURA:
 * 1. Leer el XML como string
 * 2. Con un solo regex global, encontrar cualquier secuencia donde
 *    los textos de <w:t> consecutivos (separados por cualquier XML intermedio)
 *    forman un placeholder {{...}} partido.
 * 3. Reemplazar SOLO el contenido de texto — el primer <w:t> recibe todo el texto,
 *    los demás <w:t> involucrados quedan vacíos (<w:t/>), sin tocar su estructura.
 * Esto preserva el XML válido al 100%.
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
    xml = repairPlaceholders(xml)
    zip.file(filename, xml)
  }
  return zip
}

/**
 * Encuentra grupos de <w:t> cuyo texto concatenado contiene un {{...}} roto
 * y los repara sin modificar la estructura XML circundante.
 */
function repairPlaceholders(xml: string): string {
  // Regex que captura un <w:t> con su contenido
  // Agrupa: (apertura del tag)(texto)(cierre del tag)
  const WT_REGEX = /(<w:t(?:[^>]*)>)([\ s\S]*?)(<\/w:t>)/g

  // Primero, recopilar todas las ocurrencias con sus posiciones
  interface WtOccurrence {
    fullMatch: string
    openTag: string
    text: string
    closeTag: string
    index: number
  }

  const occurrences: WtOccurrence[] = []
  let m: RegExpExecArray | null
  WT_REGEX.lastIndex = 0
  while ((m = WT_REGEX.exec(xml)) !== null) {
    occurrences.push({
      fullMatch: m[0],
      openTag:   m[1],
      text:      m[2],
      closeTag:  m[3],
      index:     m.index,
    })
  }

  if (occurrences.length === 0) return xml

  // Buscar secuencias que forman un placeholder roto
  // Un placeholder roto: algún w:t contiene {{ pero no }}, y los siguientes
  // contienen el resto hasta }}
  const replacements: Array<{ index: number; oldLen: number; newText: string }> = []

  for (let i = 0; i < occurrences.length; i++) {
    const occ = occurrences[i]

    // Caso 1: este w:t contiene {{ pero no }}
    if (occ.text.includes('{{') && !occ.text.includes('}}')) {
      let accumulated = occ.text
      let j = i + 1

      // Acumular w:t siguientes hasta cerrar el }}
      while (j < occurrences.length && !accumulated.includes('}}')) {
        // Solo acumular si el siguiente w:t es "cercano" en el XML
        // (no hay otro párrafo <w:p> entre medio)
        const between = xml.slice(
          occurrences[j - 1].index + occurrences[j - 1].fullMatch.length,
          occurrences[j].index
        )
        // Si hay un cierre de párrafo entre medio, no fusionar
        if (between.includes('</w:p>')) break
        accumulated += occurrences[j].text
        j++
      }

      if (!accumulated.includes('}}')) continue
      if (j - 1 === i) continue // estaba completo, no necesitaba fusionar

      // Construir los reemplazos:
      // - occurrences[i]: cambiar su texto por `accumulated`
      // - occurrences[i+1..j-1]: vaciar su texto
      // Hacemos los reemplazos de atrás para adelante para no desplazar índices

      // Vaciar w:t intermedios (de j-1 hasta i+1, en orden inverso)
      for (let k = j - 1; k > i; k--) {
        const o = occurrences[k]
        if (o.text.trim() !== '') {
          replacements.push({
            index:   o.index,
            oldLen:  o.fullMatch.length,
            newText: `${o.openTag}${o.closeTag}`,
          })
        }
      }

      // Poner el texto completo en el primer w:t
      const firstOcc = occurrences[i]
      replacements.push({
        index:   firstOcc.index,
        oldLen:  firstOcc.fullMatch.length,
        newText: `${firstOcc.openTag}${accumulated}${firstOcc.closeTag}`,
      })

      // Saltar los índices ya procesados
      i = j - 1
    }

    // Caso 2: este w:t NO contiene {{ pero sí contiene }}
    // (el {{ estaba en un w:t anterior que ya fue procesado — no hacer nada)
  }

  if (replacements.length === 0) return xml

  // Aplicar reemplazos de mayor a menor índice para no desplazar posiciones
  replacements.sort((a, b) => b.index - a.index)

  let result = xml
  for (const rep of replacements) {
    result =
      result.slice(0, rep.index) +
      rep.newText +
      result.slice(rep.index + rep.oldLen)
  }

  return result
}

const TIPO_RIESGO_A_CMN: Record<string, string> = {
  inmobiliario:     'Inmobiliario',
  transporte:       'Transporte',
  agropecuario:     'Agropecuario',
  mineria:          'Minería',
  extraccion_aridos:'Otro',
  forestal:         'Forestal',
  portuario:        'Portuario',
  sin_obra:         'Otro',
  indeterminado:    'Otro',
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

    if (error || !r)
      return NextResponse.json({ error: 'Reporte no encontrado', detail: error?.message }, { status: 404 })

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
        error:             'Error en docxtemplater tras fix',
        detail:            (errObj?.message as string) || String(docErr),
        errores_template:  detalle,
      }, { status: 500 })
    }

    const filename = `denuncia_CMN_${r.id_reporte.slice(0, 8)}.docx`

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type':        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('generar-denuncia error:', e)
    return NextResponse.json({ error: 'Error inesperado', detail: msg }, { status: 500 })
  }
}
