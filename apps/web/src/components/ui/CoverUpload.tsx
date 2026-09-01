import { ImagePlus, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { validateCoverFile } from '@/lib/storage'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface CoverUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  onFileSelect: (file: File | null) => void
  disabled?: boolean
}

const coverFrameClass =
  'relative mx-auto w-full max-w-[168px] aspect-[2/3] overflow-hidden rounded-xl border border-border bg-surface shadow-sm'

export function CoverUpload({ value, onChange, onFileSelect, disabled }: CoverUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const displayUrl = preview ?? value ?? null

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const handleFile = (file: File | null) => {
    setError(null)
    if (!file) {
      if (preview) URL.revokeObjectURL(preview)
      setPreview(null)
      onFileSelect(null)
      return
    }
    const validation = validateCoverFile(file)
    if (validation) {
      setError(validation)
      return
    }
    if (preview) URL.revokeObjectURL(preview)
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    onFileSelect(file)
  }

  const clear = () => {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setError(null)
    onFileSelect(null)
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={disabled}
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      {displayUrl ? (
        <div className="flex flex-col items-center gap-3">
          <div className={coverFrameClass}>
            <img
              src={displayUrl}
              alt="Prévia da capa"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
            >
              Trocar imagem
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={clear}
            >
              <X className="h-4 w-4" />
              Remover
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className={cn(
            coverFrameClass,
            'flex flex-col items-center justify-center gap-2 p-4',
            'border-2 border-dashed transition-colors',
            'hover:border-primary/40 hover:bg-primary-light/30',
            disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light">
            <ImagePlus className="h-5 w-5 text-primary" />
          </div>
          <span className="text-center text-xs font-medium leading-snug text-text">
            Enviar capa
          </span>
          <span className="text-center text-[11px] leading-snug text-text-muted">
            JPG, PNG ou WebP
            <br />
            até 5 MB
          </span>
        </button>
      )}

      {error && <p className="text-center text-sm text-error">{error}</p>}
    </div>
  )
}
