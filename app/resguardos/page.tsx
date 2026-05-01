import Link from 'next/link'

const resguardos = [
  {
    icono: '📍',
    titulo: 'Coordenadas difusas hasta aprobación',
    texto: 'Los hallazgos arqueológicos se publican con un área difusa de 300m de radio hasta que un experto los aprueba. Esto protege el sitio de visitas no autorizadas o saqueo antes de ser evaluado.',
  },
  {
    icono: '🔒',
    titulo: 'Código A / B / C de accesibilidad',
    texto: 'Cada sitio tiene un código de acceso: A (público, coordenadas exactas), B (restringido, solo equipo), C (sensible, coordenadas nunca publicadas). Los usuarios solo ven lo que corresponde a su nivel.',
  },
  {
    icono: '👁',
    titulo: 'Revisión experta antes de publicar',
    texto: 'Ningún reporte aparece en el mapa público automáticamente. Un arqueólogo o partner autorizado revisa y aprueba cada ingreso antes de que sea visible.',
  },
  {
    icono: '🕵️',
    titulo: 'Reportes anónimos disponibles',
    texto: 'Puedes enviar un aviso de riesgo sin crear cuenta ni dejar datos. Tu identidad no quedará vinculada al reporte en ningún caso.',
  },
  {
    icono: '📋',
    titulo: 'Estándar REGMON del CMN',
    texto: 'Los hallazgos arqueológicos se registran con el estándar del Consejo de Monumentos Nacionales de Chile (REGMON), garantizando que la información sea útil para la institucionalidad patrimonial.',
  },
  {
    icono: '🚫',
    titulo: 'Datos de contacto nunca publicados',
    texto: 'Si dejas datos de contacto (nombre, correo, teléfono), estos son exclusivamente internos. Nunca se muestran en el mapa ni se comparten con terceros.',
  },
  {
    icono: '🗂',
    titulo: 'Trazabilidad de cada reporte',
    texto: 'Cada aviso queda registrado con fecha, estado de validación y código único. Si hay derivación al CMN, existe respaldo de que la alerta fue generada y gestionada.',
  },
]

export default function ResguardosPage() {
  return (
    <div className="min-h-screen py-8 px-4" style={{ background: '#f2f5f6' }}>
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="mb-6">
          <Link href="/reportar-inicio"
            className="text-xs font-semibold flex items-center gap-1 mb-4"
            style={{ color: '#10454B' }}>
            ← Volver
          </Link>
          <h1 className="text-2xl font-extrabold leading-tight mb-1.5" style={{ color: '#111827' }}>
            Cómo protegemos los sitios
          </h1>
          <p className="text-sm" style={{ color: '#6b7280' }}>
            Pensamos cada detalle para que reportar no ponga en riesgo lo que queremos proteger.
          </p>
        </div>

        {/* Lista de resguardos */}
        <div className="flex flex-col gap-3">
          {resguardos.map((r, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border" style={{ borderColor: '#dde4e6' }}>
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0 mt-0.5">{r.icono}</span>
                <div>
                  <p className="text-sm font-bold mb-1" style={{ color: '#111827' }}>{r.titulo}</p>
                  <p className="text-xs leading-relaxed" style={{ color: '#6b7280' }}>{r.texto}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 rounded-xl p-4 text-center" style={{ background: '#e8f4f5', border: '1px solid #b2dde1' }}>
          <p className="text-xs" style={{ color: '#10454B' }}>
            RedPatrimonio trabaja en colaboración con arqueólogos y el
            Consejo de Monumentos Nacionales de Chile.
          </p>
        </div>

      </div>
    </div>
  )
}
