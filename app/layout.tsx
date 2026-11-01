import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

const DESCRIPCION =
  'Plataforma colaborativa para el registro, investigación y protección del patrimonio arqueológico de Chile'

export const metadata: Metadata = {
  metadataBase: new URL('https://arqueoportal.com'),
  title: 'Arqueoportal',
  description: DESCRIPCION,
  applicationName: 'Arqueoportal',
  appleWebApp: {
    capable: true,
    title: 'Arqueoportal',
  },
  openGraph: {
    title: 'Arqueoportal.com',
    description: DESCRIPCION,
    url: 'https://arqueoportal.com',
    siteName: 'Arqueoportal',
    locale: 'es_CL',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 pb-16 md:pb-0">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
