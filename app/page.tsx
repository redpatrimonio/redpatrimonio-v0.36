import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="py-20 text-center">
          {/* Logo grande */}
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 bg-green-700 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-5xl">RP</span>
            </div>
          </div>

          {/* Título */}
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Red Patrimonio Chile
          </h1>

          {/* Tagline */}
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Plataforma colaborativa de sitios arqueológicos en Chile
          </p>

          {/* CTA Button */}
          <Link
            href="/mapa"
            className="inline-block bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-800 transition shadow-lg hover:shadow-xl"
          >
            Explorar Mapa
          </Link>
        </div>

        {/* Sección simple de features */}
        <div className="py-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="font-semibold text-gray-900 mb-2">Explora</h3>
            <p className="text-gray-600 text-sm">
              Descubre sitios arqueológicos en todo Chile
            </p>
          </div>

          <div className="text-center p-6">
            <div className="text-4xl mb-4">📍</div>
            <h3 className="font-semibold text-gray-900 mb-2">Reporta</h3>
            <p className="text-gray-600 text-sm">
              Comparte sitios que conozcas con la comunidad
            </p>
          </div>

          <div className="text-center p-6">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="font-semibold text-gray-900 mb-2">Colabora</h3>
            <p className="text-gray-600 text-sm">
              Ayuda a preservar nuestro patrimonio arqueológico
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
