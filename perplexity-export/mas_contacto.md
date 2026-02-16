## app/mas/contacto/page.tsx
```tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    mensaje: ''
  })
  const [enviado, setEnviado] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: Integrar con backend o servicio de email
    console.log('Datos del formulario:', formData)
    setEnviado(true)
    setTimeout(() => {
      setEnviado(false)
      setFormData({ nombre: '', email: '', mensaje: '' })
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Botón Volver */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <Link 
          href="/mas"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition"
        >
          <span className="text-2xl mr-2">&lt;</span>
          <span className="font-medium">Volver</span>
        </Link>
      </div>

      {/* Logo */}
      <div className="flex justify-center pt-4 pb-6">
        <Image 
          src="/logo.png" 
          alt="Red Patrimonio Chile" 
          width={140} 
          height={140} 
          className="object-contain"
        />
      </div>

      {/* Contenedor Principal */}
      <div className="max-w-2xl mx-auto px-4">
        
        {/* Título y Frase */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Contacto
          </h1>
          <p className="text-lg text-gray-700 leading-relaxed">
            Cada hallazgo es importante, especialmente dentro de su contexto. 
            Estamos para apoyarte a proteger nuestra historia.
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          {enviado ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✓</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Mensaje enviado
              </h3>
              <p className="text-gray-600">
                Te responderemos a la brevedad
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nombre */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition"
                  style={{ '--tw-ring-color': '#25494D' } as React.CSSProperties}
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition"
                  style={{ '--tw-ring-color': '#25494D' } as React.CSSProperties}
                />
              </div>

              {/* Mensaje */}
              <div>
                <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition resize-none"
                  style={{ '--tw-ring-color': '#25494D' } as React.CSSProperties}
                />
              </div>

              {/* Botón Enviar */}
              <button
                type="submit"
                className="w-full py-3 rounded-lg font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: '#25494D' }}
              >
                Enviar mensaje
              </button>
            </form>
          )}

          {/* Email directo */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-2">
              O escríbenos directamente a:
            </p>
            <a 
              href="mailto:redpatrimonio.chile@gmail.com"
              className="font-semibold hover:underline"
              style={{ color: '#25494D' }}
            >
              redpatrimonio.chile@gmail.com
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
```
