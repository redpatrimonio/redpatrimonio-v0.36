'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function MasPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Logo Principal */}
      <div className="flex justify-center pt-8 pb-6">
        <Image 
          src="/logo.png" 
          alt="Red Patrimonio Chile" 
          width={160} 
          height={160} 
          className="object-contain"
        />
      </div>

      {/* Contenedor Principal */}
      <div className="max-w-4xl mx-auto px-4 space-y-12">
        
        {/* Sección Botones Páginas Internas */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Información y Recursos
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* Botón Buenas Prácticas */}
            <Link 
              href="/mas/buenas-practicas"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition group"
            >
              <div className="text-center space-y-3">
                <div className="text-4xl">🏛️</div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Buenas Prácticas
                </h3>
                <p className="text-sm text-gray-600">
                  Protocolo ante hallazgos arqueológicos
                </p>
                <div 
                  className="inline-block px-6 py-2 rounded-lg font-medium text-white transition"
                  style={{ backgroundColor: '#25494D' }}
                >
                  Ver guía
                </div>
              </div>
            </Link>

            {/* Botón Contacto */}
            <Link 
              href="/mas/contacto"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition group"
            >
              <div className="text-center space-y-3">
                <div className="text-4xl">📧</div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Contacto
                </h3>
                <p className="text-sm text-gray-600">
                  ¿Tienes dudas? Escríbenos
                </p>
                <div 
                  className="inline-block px-6 py-2 rounded-lg font-medium text-white transition"
                  style={{ backgroundColor: '#25494D' }}
                >
                  Contactar
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Sección Organizaciones y Enlaces */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Organizaciones e Instituciones
          </h2>
          
          <div className="space-y-6">
            {/* Rutas de Nuestra Geografia Sagrada */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative w-48 h-24">
                  <Image 
                    src="/LOGO-RUTAS.webp" 
                    alt="Rutas de Nuestra Geografia Sagrada" 
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Rutas de Nuestra Geografia Sagrada
                </h3>
                <a 
                  href="https://geografiasagrada.cl/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-6 py-2 rounded-lg font-medium text-white transition hover:opacity-90"
                  style={{ backgroundColor: '#25494D' }}
                >
                  Ir a página
                </a>
              </div>
            </div>

            {/* Sociedad Chilena de Historia y Geografia */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative w-48 h-24">
                  <Image 
                    src="/logo-schhg-v3.png" 
                    alt="Sociedad Chilena de Historia y Geografia" 
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Sociedad Chilena de Historia y Geografia
                </h3>
                <a 
                  href="https://www.schhg.cl/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-6 py-2 rounded-lg font-medium text-white transition hover:opacity-90"
                  style={{ backgroundColor: '#25494D' }}
                >
                  Ir a página
                </a>
              </div>
            </div>

            {/* Consejo de Monumentos */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative w-48 h-24">
                  <Image 
                    src="/logo-cmn.jpeg" 
                    alt="Consejo de Monumentos" 
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Consejo de Monumentos
                </h3>
                <a 
                  href="https://www.monumentos.gob.cl/monumentos" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-6 py-2 rounded-lg font-medium text-white transition hover:opacity-90"
                  style={{ backgroundColor: '#25494D' }}
                >
                  Ir a página
                </a>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
