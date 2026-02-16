## lib/utils/storage.ts
```typescript
import { supabase } from '@/lib/supabase'

export async function uploadFoto(
  file: File,
  reporteId: string
): Promise<{ url: string; path: string } | null> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${reporteId}/${Date.now()}.${fileExt}`
    const filePath = `reportes/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('fotos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Error uploading:', uploadError)
      return null
    }

    const { data } = supabase.storage.from('fotos').getPublicUrl(filePath)

    return {
      url: data.publicUrl,
      path: filePath,
    }
  } catch (error) {
    console.error('Error en uploadFoto:', error)
    return null
  }
}
```
