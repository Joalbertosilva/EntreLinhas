import { Dialog } from './Dialog'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  variant?: 'destructive' | 'primary'
  loading?: boolean
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  variant = 'destructive',
  loading,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title} description={description}>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
          Cancelar
        </Button>
        <Button
          type="button"
          variant={variant === 'destructive' ? 'destructive' : 'primary'}
          disabled={loading}
          onClick={onConfirm}
        >
          {loading ? 'Aguarde...' : confirmLabel}
        </Button>
      </div>
    </Dialog>
  )
}
