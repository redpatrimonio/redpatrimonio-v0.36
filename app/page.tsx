import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div
      className="flex flex-col h-[calc(100vh-56px)] overflow-hidden"
      style={{ backgroundColor: 'var(--bg)' }}
    >

      {/* ── MOBILE ────────────────────────────────── */}
      <div className="flex flex-col justify-between flex-1 px-6 pt-10 pb-0 md:hidden">

        <div className="flex flex-col gap-5">
          {/* Eyebrow */}
          <div className="flex items-center gap-3">
            <span className="block w-6 h-px" style={{ backgroundColor: 'var(--accent)', opacity: 0.6 }} />
            <span className="text-[10px] font-medium tracking-widest uppercase" style={{ color: 'var(--accent)', opacity: 0.8 }}>
              Patrimonio arqueológico de Chile
            </span>
          </div>

          {/* Titular */}
          <h1 className="font-display font-light leading-[1.05]" style={{ fontSize: 'clamp(36px,9vw,52px)', color: 'var(--text)' }}>
            Registra<br />y protege<br />
            <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>lo que somos.</em>
          </h1>

          {/* Descripción */}
          <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)', maxWidth: '38ch' }}>
            Una plataforma colaborativa para documentar y preservar el patrimonio arqueológico de Chile.
          </p>

          {/* CTAs */}
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/reportar-inicio"
              className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-lg transition"
              style={{ backgroundColor: 'var(--btn-light)', color: '#111110' }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="6.5" cy="6.5" r="5" /><path d="M6.5 4v5M4 6.5h5" />
              </svg>
              Enviar reporte
            </Link>
            <Link
              href="/mapa"
              className="inline-flex items-center gap-2 text-sm px-5 py-2.5 rounded-lg transition"
              style={{ border: '1px solid var(--border-m)', color: 'var(--muted)' }}
            >
              Ver mapa
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M2 5.5h7M6 2.5l3 3-3 3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Cómo funciona */}
        <div
          className="rounded-xl overflow-hidden mb-0"
          style={{ border: '1px solid var(--border)' }}
        >
          {[
            { n: '01', title: 'Reporta un hallazgo', desc: 'Ubica y fotografía el sitio. Tu reporte inicia la documentación formal.' },
            { n: '02', title: 'El equipo lo evalúa', desc: 'Arqueólogos de la red revisan y completan la ficha técnica.' },
            { n: '03', title: 'Queda en la biblioteca', desc: 'El sitio validado se publica en el mapa y la biblioteca patrimonial.' },
          ].map(({ n, title, desc }, i) => (
            <div
              key={n}
              className="flex items-start gap-3.5 px-4 py-3.5"
              style={{
                backgroundColor: 'var(--surface)',
                borderTop: i > 0 ? '1px solid var(--border)' : 'none',
              }}
            >
              <span
                className="font-display font-light leading-none w-7 shrink-0"
                style={{ fontSize: 22, color: 'var(--accent)', opacity: 0.45 }}
              >
                {n}
              </span>
              <div>
                <p className="text-[13px] font-medium" style={{ color: 'var(--text)' }}>{title}</p>
                <p className="text-[12px] leading-snug mt-0.5" style={{ color: 'var(--muted)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── DESKTOP ───────────────────────────────── */}
      <div className="hidden md:grid grid-cols-2 gap-16 items-center flex-1 max-w-5xl mx-auto px-12 py-16 w-full">

        <div className="flex flex-col gap-7">
          <div className="flex items-center gap-3">
            <span className="block w-8 h-px" style={{ backgroundColor: 'var(--accent)', opacity: 0.6 }} />
            <span className="text-[11px] font-medium tracking-widest uppercase" style={{ color: 'var(--accent)', opacity: 0.8 }}>
              Patrimonio arqueológico de Chile
            </span>
          </div>

          <h1 className="font-display font-light leading-[1.05]" style={{ fontSize: 'clamp(44px,4.5vw,64px)', color: 'var(--text)' }}>
            Registra y protege<br />
            <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>lo que somos.</em>
          </h1>

          <p className="text-[15px] leading-relaxed" style={{ color: 'var(--muted)', maxWidth: '46ch' }}>
            Una plataforma colaborativa para documentar, preservar y difundir el patrimonio arqueológico de Chile.
          </p>

          <div className="flex gap-3">
            <Link
              href="/reportar-inicio"
              className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-lg transition"
              style={{ backgroundColor: 'var(--btn-light)', color: '#111110' }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="6.5" cy="6.5" r="5" /><path d="M6.5 4v5M4 6.5h5" />
              </svg>
              Enviar un reporte
            </Link>
            <Link
              href="/mapa"
              className="inline-flex items-center gap-2 text-sm px-5 py-2.5 rounded-lg transition"
              style={{ border: '1px solid var(--border-m)', color: 'var(--muted)' }}
            >
              Explorar el mapa
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M2 5.5h7M6 2.5l3 3-3 3" />
              </svg>
            </Link>
          </div>

          {/* Cómo — horizontal */}
          <div
            className="flex rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--border)' }}
          >
            {[
              { n: '01', title: 'Reporta', desc: 'Ubica y fotografía el sitio.' },
              { n: '02', title: 'Se evalúa', desc: 'Arqueólogos revisan la ficha.' },
              { n: '03', title: 'Se publica', desc: 'Entra al mapa y biblioteca.' },
            ].map(({ n, title, desc }, i) => (
              <div
                key={n}
                className="flex-1 p-4"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderLeft: i > 0 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div className="font-display font-light mb-2" style={{ fontSize: 26, color: 'var(--accent)', opacity: 0.4 }}>{n}</div>
                <div className="text-[13px] font-medium mb-1" style={{ color: 'var(--text)' }}>{title}</div>
                <div className="text-[12px] leading-snug" style={{ color: 'var(--muted)' }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mapa decorativo */}
        <div
          className="relative rounded-xl overflow-hidden"
          style={{
            border: '1px solid var(--border)',
            backgroundColor: 'var(--surface)',
            minHeight: 420,
            maxHeight: 560,
            height: '100%',
          }}
        >
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(143,181,164,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(143,181,164,0.04) 1px,transparent 1px)',
            backgroundSize: '30px 30px',
          }} />
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at 45% 38%,rgba(143,181,164,0.07) 0%,transparent 65%)',
          }} />
          {/* Pins */}
          {[
            { l: '43%', t: '19%', lg: true },
            { l: '57%', t: '32%' },
            { l: '37%', t: '43%', sm: true },
            { l: '50%', t: '55%' },
            { l: '31%', t: '28%', sm: true },
            { l: '64%', t: '24%', sm: true },
            { l: '46%', t: '69%', lg: true },
            { l: '36%', t: '62%', sm: true },
            { l: '44%', t: '81%', sm: true },
          ].map(({ l, t, lg, sm }, i) => (
            <div key={i} className="absolute rounded-full" style={{
              left: l, top: t,
              transform: 'translate(-50%,-50%)',
              width: lg ? 9 : sm ? 5 : 7,
              height: lg ? 9 : sm ? 5 : 7,
              backgroundColor: sm ? 'var(--faint)' : 'var(--accent)',
              boxShadow: lg ? '0 0 0 4px rgba(143,181,164,0.2)' : sm ? 'none' : '0 0 0 3px rgba(143,181,164,0.15)',
            }} />
          ))}
          <div className="absolute bottom-3.5 left-4 right-4 flex justify-between items-center">
            <span className="text-[10px] tracking-widest uppercase" style={{ color: 'var(--faint)' }}>Chile · Mapa patrimonial</span>
            <span className="font-display" style={{ fontSize: 12, color: 'var(--muted)' }}>1.840 sitios</span>
          </div>
        </div>

      </div>
    </div>
  )
}
