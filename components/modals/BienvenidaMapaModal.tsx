'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'

export function BienvenidaMapaModal() {
  const { usuario } = useAuth()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const yaVisto = sessionStorage.getItem('bienvenida_mapa')
    if (!yaVisto) setVisible(true)
  }, [])

  function cerrar() {
    sessionStorage.setItem('bienvenida_mapa', '1')
    setVisible(false)
  }

  if (!visible) return null

  const rol = usuario?.rol as 'publico' | 'experto' | 'partner' | 'founder' | undefined

  const contenido = {
    titulo: '🏛️ Bienvenido al mapa patrimonial',
    mensaje: !usuario
      ? 'Los sitios arqueológicos son patrimonio de todos. Al explorar, recuerda: no remover objetos, no intervenir o caminar estructuras, no dejar basura. Regístrate para acceder a más sitios y contribuir a su protección.'
      : rol === 'experto' || rol === 'partner' || rol === 'founder'
      ? 'Como colaborador, tienes acceso a sitios protegidos (cod. B) 🔵 y restringidos (cod. C) ⚫. Recuerda: toda visita debe respetar los protocolos del CMN. La información de sitios código C es confidencial y de uso exclusivo para gestión patrimonial.'
      : 'Los sitios arqueológicos son patrimonio de todos. Al visitarlos: no remover objetos, no intervenir estructuras, no dejar basura, reportar daños al CMN. Puedes ver sitios de acceso abierto 🟢 y controlado 🔵.',
  }

  return (
    <div
      className="fixed inset-0 z-[1500] flex items-end md:items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={cerrar}
    >
      <div
        className="bg-white w-full md:max-w-md rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Franja superior de color */}
        <div style={{ backgroundColor: '#10454B', padding: '18px 24px 14px' }}>
          <p style={{ color: '#B6875D', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
            Antes de explorar
          </p>
          <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 700, lineHeight: 1.3 }}>
            {contenido.titulo}
          </h2>
        </div>

        {/* Cuerpo */}
        <div style={{ padding: '20px 24px 24px' }}>
          <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.7 }}>
            {contenido.mensaje}
          </p>

          <button
            onClick={cerrar}
            style={{
              marginTop: '20px',
              width: '100%',
              padding: '11px 0',
              backgroundColor: '#10454B',
              color: '#B6875D',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.02em',
            }}
          >
            Entendido, explorar mapa
          </button>
        </div>
      </div>
    </div>
  )
}
