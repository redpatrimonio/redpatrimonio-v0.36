import Link from 'next/link'
import Image from 'next/image'

export default function MasPage() {
  const seccionesInternas = [
    {
      titulo: 'Buenas Prácticas',
      descripcion: 'Protocolo y recomendaciones para el registro responsable de sitios arqueológicos.',
      href: '/mas/buenas-practicas',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      titulo: 'Contacto y Soporte',
      descripcion: 'Canal directo para consultas técnicas, denuncias formales o contacto institucional.',
      href: '/mas/contacto',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ]

  const organizaciones = [
    {
      nombre: 'Rutas de Nuestra Geografía Sagrada',
      subtitulo: 'Investigación y Divulgación Patrimonial',
      descripcion: 'Iniciativa orientada a la documentación de rutas ancestrales, paisajes sagrados y sitios arqueológicos en Chile.',
      link: 'https://rutasgradas.cl',
      logo: '/LOGO-RUTAS.webp',
      linkLabel: 'rutasgradas.cl',
    },
    {
      nombre: 'Sociedad Chilena de Historia y Geografía',
      subtitulo: 'Sección Arqueología',
      descripcion: 'Fundada en 1839, institución dedicada a la investigación, preservación y difusión de la historia, arqueología y geografía nacional.',
      link: 'https://schhg.cl',
      logo: '/logo-schhg-v3.png',
      linkLabel: 'schhg.cl',
    },
    {
      nombre: 'Consejo de Monumentos Nacionales',
      subtitulo: 'Organismo Técnico del Estado',
      descripcion: 'Encargado de la tuición y protección del patrimonio cultural y natural bajo la Ley N° 17.288 de Monumentos Nacionales.',
      link: 'https://www.monumentos.gob.cl',
      logo: '/logo-cmn.jpeg',
      linkLabel: 'monumentos.gob.cl',
    },
  ]

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto space-y-12">

        {/* Encabezado */}
        <div className="text-center space-y-3 pb-8 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex justify-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center p-3 shadow-md"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <Image
                src="/logo.png"
                alt="RedPatrimonio"
                width={52}
                height={52}
                className="object-contain"
              />
            </div>
          </div>
          <div>
            <h1 className="font-display font-light text-3xl sm:text-4xl" style={{ color: 'var(--text)' }}>
              Acerca de RedPatrimonio
            </h1>
            <p className="text-sm mt-1 max-w-md mx-auto" style={{ color: 'var(--muted)' }}>
              Plataforma colaborativa para la documentación, gestión y protección del patrimonio arqueológico de Chile.
            </p>
          </div>
        </div>

        {/* ── SECCIÓN 1: Recursos y Guías ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
              Recursos y Documentación
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {seccionesInternas.map((sec) => (
              <Link
                key={sec.href}
                href={sec.href}
                className="group p-5 rounded-xl transition flex flex-col justify-between gap-4"
                style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition"
                      style={{
                        backgroundColor: 'var(--surface-2)',
                        color: 'var(--accent)',
                        border: '1px solid var(--border-m)',
                      }}
                    >
                      {sec.icon}
                    </div>
                    <span className="text-xs font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition" style={{ color: 'var(--accent)' }}>
                      Ingresar
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                  <h3 className="font-display font-light text-xl" style={{ color: 'var(--text)' }}>
                    {sec.titulo}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                    {sec.descripcion}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── SECCIÓN 2: Organizaciones Vinculadas ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
              Instituciones y Proyectos Vinculados
            </h2>
          </div>

          <div className="grid gap-4">
            {organizaciones.map((org) => (
              <div
                key={org.nombre}
                className="p-5 sm:p-6 rounded-xl transition flex flex-col sm:flex-row gap-5 sm:gap-6 items-start sm:items-center"
                style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                {/* Logo institucional */}
                <div
                  className="w-full sm:w-36 h-20 rounded-lg flex items-center justify-center p-3 flex-shrink-0"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-m)',
                  }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={org.logo}
                      alt={org.nombre}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Información */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(143,181,164,0.12)', color: 'var(--accent)' }}>
                    {org.subtitulo}
                  </span>
                  <h3 className="font-display font-light text-lg sm:text-xl leading-snug" style={{ color: 'var(--text)' }}>
                    {org.nombre}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                    {org.descripcion}
                  </p>
                </div>

                {/* Enlace externo */}
                <a
                  href={org.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-lg transition self-start sm:self-center flex-shrink-0"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    color: 'var(--text)',
                    border: '1px solid var(--border-m)',
                  }}
                >
                  <span>Visitar sitio</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECCIÓN 3: Términos y Legal ── */}
        <section className="border-t pt-8 pb-4 text-center space-y-3" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--faint)' }}>
            © {new Date().getFullYear()} RedPatrimonio Chile · Todos los derechos reservados
          </p>
          <div className="flex justify-center gap-6 text-xs">
            <Link
              href="/terminos"
              className="hover:underline transition"
              style={{ color: 'var(--muted)' }}
            >
              Términos de Servicio
            </Link>
            <span style={{ color: 'var(--faint)' }}>•</span>
            <Link
              href="/privacidad"
              className="hover:underline transition"
              style={{ color: 'var(--muted)' }}
            >
              Política de Privacidad
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
