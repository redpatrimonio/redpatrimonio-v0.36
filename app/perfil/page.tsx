'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { esExpertoOMas, esPartnerOMas, esFounder } from '@/lib/utils/role'
import { AgregarInfoContactoModal } from '@/components/modals/AgregarInfoContactoModal'

const supabase = createClient()

export const dynamic = 'force-dynamic'

interface SolicitudConDatos {
  id_solicitud: string
  id_sitio: string
  motivo_solicitud: string
  info_adicional_solicitante: string | null
  estado: string
  timestamp_solicitud: string
  timestamp_respuesta: string | null
  notas_rechazo: string | null
  sitio_nombre: string
  sitio_region: string
  sitio_comuna: string
  solicitante_nombre?: string
  solicitante_email?: string
}

// ── Íconos SVG ────────────────────────────────────────────────
function IconRevisar() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )
}
function IconAprobar() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
function IconPublicados() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 9h10M7 13h6" />
    </svg>
  )
}
function IconUsuarios() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="7" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="18" cy="8" r="2.5" /><path d="M15 20c0-2.5 1.3-4.5 3-5" />
    </svg>
  )
}
function IconMisReportes() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}
function IconUser() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}
function IconArrow() {
  return <span style={{ color: 'var(--faint)', fontSize: 18, lineHeight: 1 }}>›</span>
}

// ── Helpers de estilo ─────────────────────────────────────────
function rolBadge(rol: string | undefined) {
  const base: React.CSSProperties = {
    display: 'inline-block', fontSize: 10, padding: '2px 10px',
    borderRadius: 20, letterSpacing: '0.08em', fontWeight: 500, marginTop: 6,
  }
  if (rol === 'founder')  return { ...base, background: 'rgba(194,120,64,0.13)', color: 'var(--cobre)',    border: '1px solid rgba(194,120,64,0.22)' }
  if (rol === 'partner')  return { ...base, background: 'rgba(143,181,164,0.1)',  color: 'var(--accent)',   border: '1px solid rgba(143,181,164,0.2)'  }
  if (rol === 'experto')  return { ...base, background: 'rgba(78,138,96,0.12)',   color: 'var(--musgo)',    border: '1px solid rgba(78,138,96,0.22)'   }
  return                         { ...base, background: 'rgba(82,96,88,0.15)',    color: 'var(--antracita)',border: '1px solid rgba(82,96,88,0.25)'    }
}

function estadoPill(estado: string): React.CSSProperties {
  const base: React.CSSProperties = {
    fontSize: 10, padding: '2px 9px', borderRadius: 20, whiteSpace: 'nowrap', flexShrink: 0,
  }
  if (estado === 'pendiente') return { ...base, background: 'rgba(155,104,69,0.12)', color: 'var(--tierra)',   border: '1px solid rgba(155,104,69,0.22)' }
  if (estado === 'aprobada')  return { ...base, background: 'rgba(78,138,96,0.12)',  color: 'var(--musgo)',    border: '1px solid rgba(78,138,96,0.22)'  }
  return                             { ...base, background: 'rgba(168,80,64,0.12)',  color: 'var(--ladrillo)', border: '1px solid rgba(168,80,64,0.22)'  }
}

const card: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20,
}
const sectionTitle: React.CSSProperties = {
  fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em',
  color: 'var(--faint)', marginBottom: 10,
}
const solItem: React.CSSProperties = {
  padding: 14, borderRadius: 11, border: '1px solid var(--border)',
  background: 'var(--surface-2)', display: 'flex', flexDirection: 'column', gap: 8,
}

// ── Componente PanelBtn ───────────────────────────────────────
interface PanelBtnProps {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  title: string
  desc: string
  badge?: number
  onClick: () => void
}
function PanelBtn({ icon, iconBg, iconColor, title, desc, badge, onClick }: PanelBtnProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px',
        borderRadius: 11, border: '1px solid var(--border)', background: 'var(--surface-2)',
        cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'border-color 140ms',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-m)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div style={{
        width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0, background: iconBg, color: iconColor,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{title}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{desc}</div>
      </div>
      {badge !== undefined && badge > 0 && (
        <span style={{
          background: 'rgba(194,120,64,0.15)', color: 'var(--cobre)', fontSize: 10,
          padding: '2px 7px', borderRadius: 20, fontWeight: 500, border: '1px solid rgba(194,120,64,0.2)',
        }}>{badge}</span>
      )}
      <IconArrow />
    </button>
  )
}

// ── Página principal ──────────────────────────────────────────
export default function PerfilPage() {
  const { user, usuario, loading, signOut } = useAuth()
  const router = useRouter()

  const [solicitudesPendientes, setSolicitudesPendientes] = useState<SolicitudConDatos[]>([])
  const [misSolicitudes, setMisSolicitudes] = useState<SolicitudConDatos[]>([])
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(true)
  const [modalAprobar, setModalAprobar] = useState<{ id_solicitud: string; id_sitio: string; nombre_sitio: string } | null>(null)

  const [modalVerContacto, setModalVerContacto] = useState<{ nombreSitio: string; idSitio: string } | null>(null)
  const [infoContacto, setInfoContacto] = useState<{
    nombre_contacto: string | null
    email_contacto: string | null
    telefono_contacto: string | null
    organizacion: string | null
    info_adicional: string | null
  } | null>(null)
  const [loadingInfoContacto, setLoadingInfoContacto] = useState(false)
  const [errorInfoContacto, setErrorInfoContacto] = useState<string | null>(null)

  useEffect(() => {
    if (user && usuario) cargarSolicitudes()
  }, [user, usuario])

  async function cargarSolicitudes() {
    if (!user || !usuario) return
    try {
      setLoadingSolicitudes(true)
      if (esPartnerOMas(usuario.rol)) {
        const { data, error } = await supabase
          .from('solicitudes_contacto')
          .select(`id_solicitud,id_sitio,motivo_solicitud,info_adicional_solicitante,estado,timestamp_solicitud,timestamp_respuesta,notas_rechazo,reportes_nuevos!inner(nombre_sitio,region,comuna),solicitante:usuarios_autorizados!id_usuario_solicitante(nombre_completo,email)`)
          .eq('estado', 'pendiente')
          .order('timestamp_solicitud', { ascending: false })
        if (!error && data) {
          setSolicitudesPendientes(data.map((sol: any) => ({
            id_solicitud: sol.id_solicitud, id_sitio: sol.id_sitio,
            motivo_solicitud: sol.motivo_solicitud, info_adicional_solicitante: sol.info_adicional_solicitante,
            estado: sol.estado, timestamp_solicitud: sol.timestamp_solicitud,
            timestamp_respuesta: sol.timestamp_respuesta, notas_rechazo: sol.notas_rechazo,
            sitio_nombre: sol.reportes_nuevos?.nombre_sitio || 'Sin nombre',
            sitio_region: sol.reportes_nuevos?.region || '', sitio_comuna: sol.reportes_nuevos?.comuna || '',
            solicitante_nombre: sol.solicitante?.nombre_completo || '', solicitante_email: sol.solicitante?.email || '',
          })))
        }
      }
      const { data: misSols, error: misError } = await supabase
        .from('solicitudes_contacto')
        .select(`id_solicitud,id_sitio,motivo_solicitud,info_adicional_solicitante,estado,timestamp_solicitud,timestamp_respuesta,notas_rechazo,reportes_nuevos!inner(nombre_sitio,region,comuna)`)
        .eq('id_usuario_solicitante', user.id)
        .order('timestamp_solicitud', { ascending: false })
      if (!misError && misSols) {
        setMisSolicitudes(misSols.map((sol: any) => ({
          id_solicitud: sol.id_solicitud, id_sitio: sol.id_sitio,
          motivo_solicitud: sol.motivo_solicitud, info_adicional_solicitante: sol.info_adicional_solicitante,
          estado: sol.estado, timestamp_solicitud: sol.timestamp_solicitud,
          timestamp_respuesta: sol.timestamp_respuesta, notas_rechazo: sol.notas_rechazo,
          sitio_nombre: sol.reportes_nuevos?.nombre_sitio || 'Sin nombre',
          sitio_region: sol.reportes_nuevos?.region || '', sitio_comuna: sol.reportes_nuevos?.comuna || '',
        })))
      }
    } catch (err) {
      console.error('Error cargando solicitudes:', err)
    } finally {
      setLoadingSolicitudes(false)
    }
  }

  function handleAprobarSolicitud(idSolicitud: string, idSitio: string, nombreSitio: string) {
    setModalAprobar({ id_solicitud: idSolicitud, id_sitio: idSitio, nombre_sitio: nombreSitio })
  }

  async function handleVerContacto(idSitio: string, nombreSitio: string) {
    setInfoContacto(null); setErrorInfoContacto(null)
    setModalVerContacto({ idSitio, nombreSitio }); setLoadingInfoContacto(true)
    try {
      const { data, error } = await supabase
        .from('info_contacto_sitios')
        .select('nombre_contacto,email_contacto,telefono_contacto,organizacion,info_adicional')
        .eq('id_sitio', idSitio).single()
      if (error) throw error
      setInfoContacto(data)
    } catch { setErrorInfoContacto('No se pudo cargar la información de contacto.') }
    finally { setLoadingInfoContacto(false) }
  }

  async function handleRechazarSolicitud(idSolicitud: string) {
    const motivo = prompt('Motivo del rechazo (opcional):')
    try {
      const { error } = await supabase
        .from('solicitudes_contacto')
        .update({ estado: 'rechazada', timestamp_respuesta: new Date().toISOString(), id_usuario_revisor: user?.id, notas_rechazo: motivo || null })
        .eq('id_solicitud', idSolicitud)
      if (error) throw error
      alert('Solicitud rechazada')
      cargarSolicitudes()
    } catch { alert('Error al rechazar solicitud') }
  }

  async function handleSignOut() { await signOut(); router.push('/') }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <p style={{ fontSize: 13, color: 'var(--muted)' }}>Cargando perfil…</p>
    </div>
  )

  if (!user) { router.push('/auth/login'); return null }

  if (!usuario) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <p style={{ fontSize: 13, color: 'var(--muted)' }}>Cargando datos de usuario…</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '24px 16px 80px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, marginBottom: 4 }}>
          <span style={{ display: 'block', width: 20, height: 1, background: 'var(--accent)', opacity: 0.6 }} />
          <span style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', opacity: 0.8 }}>
            Mi cuenta
          </span>
        </div>

        {/* ── Info usuario ── */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%', background: 'rgba(143,181,164,0.1)',
              border: '1px solid var(--border-m)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, color: 'var(--accent)',
            }}>
              <IconUser />
            </div>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: 20, color: 'var(--text)', lineHeight: 1.1 }}>
                {usuario.nombre_completo || 'Sin nombre'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{user.email}</div>
              <span style={rolBadge(usuario.rol)}>{usuario.rol?.toUpperCase() || 'PÚBLICO'}</span>
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--border)', marginBottom: 14 }} />

          <div style={{ display: 'grid', gap: 10 }}>
            {usuario.telefono && (
              <div>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--faint)', marginBottom: 2 }}>Teléfono</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>{usuario.telefono}</div>
              </div>
            )}
          </div>

          <button
            onClick={handleSignOut}
            style={{
              marginTop: 16, width: '100%', padding: 9, borderRadius: 9,
              border: '1px solid var(--border-m)', background: 'transparent',
              color: 'var(--muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ladrillo)'; e.currentTarget.style.color = 'var(--ladrillo)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-m)'; e.currentTarget.style.color = 'var(--muted)' }}
          >
            Cerrar sesión
          </button>
        </div>

        {/* ── Panel de control ── */}
        <div style={card}>
          <div style={sectionTitle}>Panel de control</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

            {esExpertoOMas(usuario.rol) && (
              <PanelBtn
                icon={<IconRevisar />}
                iconBg="rgba(155,104,69,0.12)" iconColor="var(--tierra)"
                title="Revisar reportes" desc="Validar reportes nuevos recibidos"
                onClick={() => router.push('/dashboard/revisar')}
              />
            )}

            {esPartnerOMas(usuario.rol) && (
              <PanelBtn
                icon={<IconAprobar />}
                iconBg="rgba(78,138,96,0.12)" iconColor="var(--musgo)"
                title="Aprobar reportes" desc="Publicar sitios revisados"
                onClick={() => router.push('/dashboard/aprobar')}
              />
            )}

            {esPartnerOMas(usuario.rol) && (
              <PanelBtn
                icon={<IconPublicados />}
                iconBg="rgba(143,181,164,0.1)" iconColor="var(--accent)"
                title="Sitios publicados" desc="Ver y gestionar sitios aprobados"
                onClick={() => router.push('/dashboard/publicados')}
              />
            )}

            {esFounder(usuario.rol) && (
              <PanelBtn
                icon={<IconUsuarios />}
                iconBg="rgba(194,120,64,0.1)" iconColor="var(--cobre)"
                title="Gestionar usuarios" desc="Asignar roles y permisos"
                onClick={() => router.push('/panel-usuarios')}
              />
            )}

            <PanelBtn
              icon={<IconMisReportes />}
              iconBg="rgba(82,96,88,0.15)" iconColor="var(--antracita)"
              title="Mis reportes" desc="Ver reportes que he creado"
              onClick={() => router.push('/mis-reportes')}
            />

          </div>
        </div>

        {/* ── Solicitudes recibidas (partner+) ── */}
        {esPartnerOMas(usuario.rol) && (
          <div style={card}>
            <div style={sectionTitle}>Solicitudes de contacto recibidas</div>
            {loadingSolicitudes ? (
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>Cargando…</p>
            ) : solicitudesPendientes.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--faint)' }}>No hay solicitudes pendientes</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {solicitudesPendientes.map(sol => (
                  <div key={sol.id_solicitud} style={solItem}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{sol.sitio_nombre}</div>
                        <div style={{ fontSize: 11, color: 'var(--faint)', marginTop: 1 }}>{sol.sitio_region}, {sol.sitio_comuna}</div>
                      </div>
                      <span style={estadoPill('pendiente')}>Pendiente</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}><strong style={{ color: 'var(--text)', fontWeight: 500 }}>Solicitante:</strong> {sol.solicitante_nombre}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}><strong style={{ color: 'var(--text)', fontWeight: 500 }}>Email:</strong> {sol.solicitante_email}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}><strong style={{ color: 'var(--text)', fontWeight: 500 }}>Motivo:</strong> {sol.motivo_solicitud}</div>
                    {sol.info_adicional_solicitante && (
                      <div style={{ fontSize: 11, color: 'var(--faint)', fontStyle: 'italic' }}>{sol.info_adicional_solicitante}</div>
                    )}
                    <div style={{ display: 'flex', gap: 7, marginTop: 2 }}>
                      <button
                        onClick={() => handleAprobarSolicitud(sol.id_solicitud, sol.id_sitio, sol.sitio_nombre)}
                        style={{ flex: 1, padding: 7, borderRadius: 8, border: '1px solid rgba(78,138,96,0.25)', background: 'rgba(78,138,96,0.15)', color: 'var(--musgo)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}
                      >✓ Aprobar</button>
                      <button
                        onClick={() => handleRechazarSolicitud(sol.id_solicitud)}
                        style={{ flex: 1, padding: 7, borderRadius: 8, border: '1px solid var(--border-m)', background: 'transparent', color: 'var(--muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ladrillo)'; e.currentTarget.style.color = 'var(--ladrillo)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-m)'; e.currentTarget.style.color = 'var(--muted)' }}
                      >✗ Rechazar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Mis solicitudes ── */}
        <div style={card}>
          <div style={sectionTitle}>Mis solicitudes de contacto</div>
          {loadingSolicitudes ? (
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>Cargando…</p>
          ) : misSolicitudes.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--faint)' }}>No has realizado solicitudes aún</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {misSolicitudes.map(sol => (
                <div key={sol.id_solicitud} style={solItem}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{sol.sitio_nombre}</div>
                      <div style={{ fontSize: 11, color: 'var(--faint)', marginTop: 1 }}>
                        Solicitado: {new Date(sol.timestamp_solicitud).toLocaleDateString('es-CL')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={estadoPill(sol.estado)}>
                        {sol.estado === 'pendiente' ? 'Pendiente' : sol.estado === 'aprobada' ? 'Aprobada' : 'Rechazada'}
                      </span>
                      {sol.estado === 'aprobada' && (
                        <button
                          onClick={() => handleVerContacto(sol.id_sitio, sol.sitio_nombre)}
                          style={{ padding: '4px 10px', borderRadius: 7, background: 'rgba(143,181,164,0.1)', color: 'var(--accent)', fontSize: 11, border: '1px solid rgba(143,181,164,0.2)', cursor: 'pointer', fontFamily: 'inherit' }}
                        >Ver</button>
                      )}
                    </div>
                  </div>
                  {sol.estado === 'rechazada' && sol.notas_rechazo && (
                    <div style={{ fontSize: 11, color: 'var(--ladrillo)' }}><strong>Motivo:</strong> {sol.notas_rechazo}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Info rol público ── */}
        {usuario.rol === 'publico' && (
          <div style={{ padding: 14, borderRadius: 11, border: '1px solid rgba(143,181,164,0.18)', background: 'rgba(143,181,164,0.05)', fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--accent)' }}>Eres usuario público.</strong> Puedes reportar sitios arqueológicos.
            Si eres investigador o arqueólogo, solicita acceso elevado a{' '}
            <a href="mailto:redpatrimonio.chile@gmail.com" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>redpatrimonio.chile@gmail.com</a>
          </div>
        )}

      </div>

      {/* ── Modal Aprobar ── */}
      {modalAprobar && (
        <AgregarInfoContactoModal
          idSitio={modalAprobar.id_sitio}
          idSolicitud={modalAprobar.id_solicitud}
          nombreSitio={modalAprobar.nombre_sitio}
          onClose={() => setModalAprobar(null)}
          onSuccess={() => { setModalAprobar(null); cargarSolicitudes() }}
        />
      )}

      {/* ── Modal Ver Info Contacto ── */}
      {modalVerContacto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border-m)', borderRadius: 16, maxWidth: 420, width: '100%', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: 18, color: 'var(--text)' }}>
                Información de contacto
              </div>
              <button
                onClick={() => { setModalVerContacto(null); setInfoContacto(null) }}
                style={{ color: 'var(--faint)', background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}
              >×</button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>{modalVerContacto.nombreSitio}</div>
            {loadingInfoContacto && <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', padding: '16px 0' }}>Cargando…</p>}
            {errorInfoContacto && <p style={{ fontSize: 12, color: 'var(--ladrillo)', textAlign: 'center', padding: '16px 0' }}>{errorInfoContacto}</p>}
            {!loadingInfoContacto && !errorInfoContacto && infoContacto && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Nombre', val: infoContacto.nombre_contacto },
                  { label: 'Organización', val: infoContacto.organizacion },
                  { label: 'Email', val: infoContacto.email_contacto, href: `mailto:${infoContacto.email_contacto}` },
                  { label: 'Teléfono', val: infoContacto.telefono_contacto, href: `tel:${infoContacto.telefono_contacto}` },
                  { label: 'Info adicional', val: infoContacto.info_adicional },
                ].filter(f => f.val).map(f => (
                  <div key={f.label}>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--faint)', marginBottom: 2 }}>{f.label}</div>
                    {f.href
                      ? <a href={f.href} style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'underline' }}>{f.val}</a>
                      : <div style={{ fontSize: 13, color: 'var(--muted)' }}>{f.val}</div>
                    }
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <button
                onClick={() => { setModalVerContacto(null); setInfoContacto(null) }}
                style={{ width: '100%', padding: 9, borderRadius: 9, border: '1px solid var(--border-m)', background: 'transparent', color: 'var(--muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
              >Cerrar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
