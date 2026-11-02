import Link from 'next/link'
import Image from 'next/image'

type Organizacion = {
  nombre: string
  subtitulo: string
  descripcion: string
  link: string
  logo: string
  linkLabel: string
}

const pasosInstalacion = [
  <>Abre <strong>arqueoportal.com</strong> en <strong>Safari</strong> y toca <strong>Compartir</strong>. Está en la barra inferior, o en el menú de tres puntos (⋯) si tu barra está arriba.</>,
  <>Desliza la lista hacia abajo y toca <strong>Agregar a Inicio</strong>. Si no la ves, baja hasta el final, toca <strong>Editar acciones</strong> y agrégala desde ahí.</>,
  <>Activa <strong>Abrir como app web</strong> y toca <strong>Agregar</strong>. El ícono de Arqueoportal queda en tu pantalla de inicio.</>,
]

const organizacionesVinculadas: Organizacion[] = [
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
]

const organismosPublicos: Organizacion[] = [
  {
    nombre: 'Consejo de Monumentos Nacionales',
    subtitulo: 'Organismo Técnico del Estado',
    descripcion: 'Encargado de la tuición y protección del patrimonio cultural y natural bajo la Ley N° 17.288 de Monumentos Nacionales.',
    link: 'https://www.monumentos.gob.cl',
    logo: '/logo-cmn.jpeg',
    linkLabel: 'monumentos.gob.cl',
  },
]

function TarjetaOrganizacion({ org }: { org: Organizacion }) {
  return (
    <div
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
  )
}

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
                alt="Arqueoportal"
                width={52}
                height={52}
                className="object-contain"
              />
            </div>
          </div>
          <div>
            <h1 className="font-display font-light text-3xl sm:text-4xl" style={{ color: 'var(--text)' }}>
              Acerca de Arqueoportal
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

        {/* ── SECCIÓN 2: Usar como app ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
              Usar como app
            </h2>
          </div>

          <div
            className="p-5 sm:p-6 rounded-xl space-y-4"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="space-y-1">
              <h3 className="font-display font-light text-xl" style={{ color: 'var(--text)' }}>
                Instalar en tu iPhone
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                Usa Arqueoportal como una app, sin pasar por la App Store.
              </p>
            </div>

            <ol className="space-y-3">
              {pasosInstalacion.map((paso, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                    style={{
                      backgroundColor: 'rgba(143,181,164,0.12)',
                      color: 'var(--accent)',
                      border: '1px solid var(--border-m)',
                    }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                    {paso}
                  </p>
                </li>
              ))}
            </ol>

            <p
              className="text-xs leading-relaxed pt-4 border-t"
              style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}
            >
              El ícono solo se crea en el dispositivo donde lo agregas. Si ya tenías una versión anterior instalada, bórrala y vuelve a agregarla para que aparezca el nombre actualizado.
            </p>
          </div>
        </section>

        {/* ── SECCIÓN 3: Organizaciones Vinculadas ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
              Instituciones y Proyectos Vinculados
            </h2>
          </div>

          <div className="grid gap-4">
            {organizacionesVinculadas.map((org) => (
              <TarjetaOrganizacion key={org.nombre} org={org} />
            ))}
          </div>
        </section>

        {/* ── SECCIÓN 4: Organismo Público ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
              Organismo Público
            </h2>
          </div>

          <div className="grid gap-4">
            {organismosPublicos.map((org) => (
              <TarjetaOrganizacion key={org.nombre} org={org} />
            ))}
          </div>
        </section>

        {/* ── SECCIÓN 5: Términos y Legal ── */}
        <section className="border-t pt-8 pb-4 text-center space-y-3" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--faint)' }}>
            © {new Date().getFullYear()} Arqueoportal · Todos los derechos reservados
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
