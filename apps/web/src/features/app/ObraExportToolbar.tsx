import { Download, FileDown, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { ObraPublica } from '@/features/app/useMinhaObra'
import { obraTemConteudo } from '@/features/app/useMinhaObra'
import { downloadObraComoDocx, downloadObraComoPdf } from '@/lib/obraExportDownload'
import { snapshotFromObraPublicaComCapa } from '@/lib/obraExportSnapshot'
import { Button } from '@/components/ui/Button'

interface ObraExportToolbarProps {
  obra: ObraPublica
  className?: string
}

export function ObraExportToolbar({ obra, className }: ObraExportToolbarProps) {
  const [exportando, setExportando] = useState<'pdf' | 'docx' | null>(null)

  const handleExportar = async (formato: 'pdf' | 'docx') => {
    const capitulosLike = obra.capitulos.map((c) => ({
      id: c.id,
      ordem: c.ordem,
      titulo: c.titulo,
      texto: c.texto,
    }))
    if (!obraTemConteudo(obra.capitulos)) {
      toast.error('Esta obra ainda não tem texto para exportar')
      return
    }
    setExportando(formato)
    try {
      const snapshot = await snapshotFromObraPublicaComCapa({
        titulo: obra.titulo,
        descricao: obra.descricao,
        tipo: obra.tipo,
        categoria: obra.categoria,
        capa_url: obra.capa_url,
        autor: obra.autor,
        capitulos: capitulosLike,
      })
      if (formato === 'pdf') await downloadObraComoPdf(snapshot)
      else await downloadObraComoDocx(snapshot)
      toast.success(formato === 'pdf' ? 'PDF baixado' : 'Word baixado')
    } catch {
      toast.error('Não foi possível gerar o arquivo')
    } finally {
      setExportando(null)
    }
  }

  return (
    <div className={className}>
      <p className="mb-2 text-xs font-medium text-text-muted">Baixar obra (professor / admin)</p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={exportando !== null}
          onClick={() => void handleExportar('pdf')}
        >
          {exportando === 'pdf' ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Download className="h-4 w-4" aria-hidden />
          )}
          PDF
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={exportando !== null}
          onClick={() => void handleExportar('docx')}
        >
          {exportando === 'docx' ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <FileDown className="h-4 w-4" aria-hidden />
          )}
          Word
        </Button>
      </div>
    </div>
  )
}