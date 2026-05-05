import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import fs from 'fs'
import path from 'path'
import { latLonToUTM } from '@/lib/utm'

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

    if (error || !r) return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 })

    let coord_norte = '', coord_este = '', coord_datum = '', coord_huso = ''
    if (r.latitud && r.longitud) {
      const utm = latLonToUTM(r.latitud, r.longitud)
      coord_norte = utm.northing.toFixed(0)
      coord_este  = utm.easting.toFixed(0)
      coord_datum = 'WGS 84'
      coord_huso  = String(utm.zone)
    }

    const data = {
      inf_nombre:         r.infractor_nombre        || '',
      inf_rut:            r.infractor_rut           || '',
      inf_domicilio:      r.infractor_domicilio     || '',
      inf_telefono:       r.infractor_contacto      || '',
      inf_correo:         '',
      tipo_proyecto:      TIPO_RIESGO_A_CMN[r.tipo_riesgo_principal || ''] || '',
      nombre_proyecto:    r.nombre_proyecto         || '',
      obra_actividad:     r.obra_actividad          || '',
      region:             r.region                  || '',
      comuna:             r.comuna                  || '',
      ubicacion_detalle:  r.descripcion_ubicacion   || '',
      coord_norte,
      coord_este,
      coord_datum,
      coord_huso,
      nombre_propietario: r.nombre_propietario_predio || '',
      fecha_hecho:        r.fecha_observacion
                            ? r.fecha_observacion.split('T')[0].split('-').reverse().join('/')
                            : '',
      descripcion_hechos: r.amenazas                || '',
      observaciones:      r.observaciones_denuncia  || '',
      den_nombre:         r.autor_reporte           || '',
      den_correo:         r.correo_usuario_contacto  || '',
      den_telefono:       r.telefono_usuario_contacto || '',
      fecha_denuncia:     new Date().toLocaleDateString('es-CL'),
      reporte_id:         r.id_reporte,
    }

    const templatePath = path.join(
      process.cwd(),
      'template',
      'formulario_de_denuncia_monumento_arqueologico.docx'
    )
    const content = fs.readFileSync(templatePath, 'binary')
    const doc = new Docxtemplater(new PizZip(content), {
      paragraphLoop: true,
      linebreaks: true,
    })
    doc.render(data)

    const buffer: Buffer = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' })
    const filename = `denuncia_CMN_${r.id_reporte.slice(0, 8)}.docx`

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (e: unknown) {
    console.error('generar-denuncia error:', e)
    return NextResponse.json({ error: 'Error generando documento' }, { status: 500 })
  }
}
