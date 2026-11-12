import type { CategoriaObra } from '@tcc-sistema/types'
import { shouldShowLiveObraCoverMoldura } from '@tcc-sistema/cover-motifs'
import { Loader2 } from 'lucide-react'
import { ObraCoverArtPreview } from '@/components/obras/ObraCoverArtPreview'
import { useObraCapaFoto } from '@/features/app/useObraCapaFoto'
import { obraCapaImageSrc } from '@/lib/obraCoverDisplay'
import { cn } from '@/lib/utils'

export interface ObraCoverThumbnailProps {
  userId: string | undefined
  obraId: string | undefined
  capaUrl: string | null | undefined
  categoria: CategoriaObra
  titulo: string
  autorNome?: string
  updatedAt?: string | null
  className?: string
}

export function ObraCoverThumbnail({
  userId,
  obraId,
  capaUrl,
  categoria,
  titulo,
  updatedAt,
  className,
}: ObraCoverThumbnailProps) {
  const { data: capaFoto, isLoading } = useObraCapaFoto(userId, obraId)
  const hasFoto = Boolean(capaFoto?.trim())
  const liveMoldura = shouldShowLiveObraCoverMoldura(capaUrl, hasFoto)

  if (isLoading && obraId) {
    return (
      <div
        className={cn(
          'flex aspect-[2/3] w-full items-center justify-center overflow-hidden rounded-xl',
          'border border-primary/12 bg-primary-light/35',
          className,
        )}
      >
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
      </div>
    )
  }

  if (liveMoldura) {
    return (
      <ObraCoverArtPreview
        categoria={categoria}
        titulo={titulo}
        photoSrc={capaFoto}
        className={cn(
          'aspect-[2/3] w-full overflow-hidden rounded-xl border border-primary/12 shadow-sm',
          className,
        )}
      />
    )
  }

  const src = obraCapaImageSrc(capaUrl, updatedAt)
  return (
    <img
      src={src}
      alt=""
      className={cn(
        'aspect-[2/3] h-full w-full rounded-xl border border-primary/12 object-cover object-center',
        className,
      )}
    />
  )
}
