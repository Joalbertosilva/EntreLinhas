import { supabase } from '@/lib/supabase'

const COVERS_BUCKET = 'covers'

export function obraCapaFotoPublicUrl(userId: string, obraId: string): string {
  const { data } = supabase.storage
    .from(COVERS_BUCKET)
    .getPublicUrl(`obras/${userId}/${obraId}/capa-foto.jpg`)
  return data.publicUrl
}

export async function resolveObraCapaFotoUrl(userId: string, obraId: string): Promise<string | null> {
  const url = obraCapaFotoPublicUrl(userId, obraId)
  try {
    const res = await fetch(url, { method: 'HEAD' })
    return res.ok ? url : null
  } catch {
    return null
  }
}
