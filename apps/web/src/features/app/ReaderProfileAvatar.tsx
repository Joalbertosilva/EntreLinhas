import { Award, Camera, Loader2 } from 'lucide-react'
import { useId, useRef } from 'react'
import { toast } from 'sonner'
import { Avatar } from '@/components/ui/Avatar'
import { useProfileAvatarUpload } from '@/features/app/useProfileAvatarUpload'
import { validateCoverFile } from '@/lib/storage'
import { cn } from '@/lib/utils'

interface ReaderProfileAvatarProps {
  name: string
  imageUrl?: string | null
  nivel?: number
  showLevelBadge?: boolean
  editable?: boolean
  className?: string
}

export function ReaderProfileAvatar({
  name,
  imageUrl,
  nivel,
  showLevelBadge = true,
  editable = false,
  className,
}: ReaderProfileAvatarProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const { uploadAvatarAsync, isUploading, isRemoving } = useProfileAvatarUpload()
  const busy = isUploading || isRemoving

  const onPickFile = async (file: File | undefined) => {
    if (!file || busy) return
    const validation = validateCoverFile(file)
    if (validation) {
      toast.error(validation)
      return
    }
    await uploadAvatarAsync(file)
  }

  return (
    <div className={cn('reader-profile-avatar', className)}>
      <div className="reader-profile-avatar__ring" aria-hidden>
        <div className="reader-profile-avatar__inner">
          <div className="reader-profile-avatar__photo-slot">
            <Avatar
              name={name}
              imageUrl={imageUrl}
              className={cn(
                'h-full w-full min-h-0 min-w-0 font-bold',
                className?.includes('reader-profile-avatar--page')
                  ? 'text-[1.125rem]'
                  : 'text-[1.05rem]',
              )}
            />
          </div>
          {busy && (
            <span className="reader-profile-avatar__busy" aria-live="polite">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              <span className="sr-only">Enviando foto…</span>
            </span>
          )}
          {editable && (
            <button
              type="button"
              className="reader-profile-avatar__edit"
              disabled={busy}
              aria-label="Alterar foto de perfil"
              onClick={() => inputRef.current?.click()}
            >
              <Camera className="reader-profile-avatar__edit-icon" strokeWidth={2} aria-hidden />
              <span className="reader-profile-avatar__edit-text">Alterar foto</span>
            </button>
          )}
        </div>
      </div>

      {showLevelBadge && nivel != null && <ReaderLevelInsignia nivel={nivel} />}

      {editable && (
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0]
            void onPickFile(file).finally(() => {
              event.target.value = ''
            })
          }}
        />
      )}
    </div>
  )
}

function ReaderLevelInsignia({ nivel }: { nivel: number }) {
  return (
    <span className="reader-level-insignia" title={`Nível ${nivel}`} aria-label={`Nível ${nivel}`}>
      <span className="reader-level-insignia__glow" aria-hidden />
      <span className="reader-level-insignia__face">
        <Award className="reader-level-insignia__icon" strokeWidth={2.25} aria-hidden />
        <span className="reader-level-insignia__value">{nivel}</span>
      </span>
    </span>
  )
}
