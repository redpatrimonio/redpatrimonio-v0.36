import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { LugarCapa, SitioMemoria } from '@/types/database'

interface UseLugaresCapaReturn {
  lugares: LugarCapa[]
  memoria: SitioMemoria[]
  loading: boolean
  error: string | null
}

export function useLugaresCapa(): UseLugaresCapaReturn {
  const [lugares, setLugares] = useState<LugarCapa[]>([])
  const [memoria, setMemoria] = useState<SitioMemoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchCapas() {
      try {
        const [{ data: dataLugares, error: errorLugares },
               { data: dataMemoria, error: errorMemoria }] = await Promise.all([
          supabase
            .from('lugares_capas')
            .select('id, nombre, descripcion, capa, subcategoria, latitud, longitud, url_imagen, url_externo, zoom_minimo, estado, es_premium, creado_por, fecha_creacion')
            .eq('estado', 'activo'),
          supabase
            .from('sitios_memoria')
            .select('id, nombre, descripcion, latitud, longitud, id_sitio_vinculado, que_lo_cubre, periodo_ocultamiento, url_publicacion, url_imagen, zoom_minimo, estado, creado_por, fecha_creacion')
            .eq('estado', 'activo'),
        ])

        if (errorLugares) throw errorLugares
        if (errorMemoria) throw errorMemoria

        setLugares(dataLugares ?? [])
        setMemoria(dataMemoria ?? [])
      } catch (err) {
        console.error('Error fetching capas:', err)
        setError('No se pudieron cargar las capas')
      } finally {
        setLoading(false)
      }
    }

    fetchCapas()
  }, [])

  return { lugares, memoria, loading, error }
}
