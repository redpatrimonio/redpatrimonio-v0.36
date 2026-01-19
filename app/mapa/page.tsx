import dynamic from 'next/dynamic'

const MapView = dynamic(() => import('@/components/map/MapView').then(mod => ({ default: mod.MapView })), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen">Cargando mapa...</div>
})

export default function MapaPage() {
  return (
    <div className="relative w-full h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]">
      <MapView />
    </div>
  )
}
