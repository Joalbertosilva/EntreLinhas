import {
  buildObraDocxBlob,
  buildObraExportSnapshot,
  buildObraPdfBlob,
  obraExportFilename,
  type ObraCapituloLike,
  type ObraExportCapaImagem,
} from '@tcc-sistema/obra-export'
import type { CategoriaObra, TipoObra } from '@tcc-sistema/types'
import { CATEGORIA_OBRA_LABEL } from '@/lib/obraCategoriaLabels'
import { TIPO_OBRA_LABEL } from '@/lib/obraLabels'

export function snapshotFromEditorState(input: {
  titulo: string
  descricao: string
  tipo: TipoObra
  categoria: CategoriaObra
  autorNome: string
  capitulos: ObraCapituloLike[]
  capituloAtivoId: string | null
  tituloCapitulo: string
  textoAtivo: string
  capa?: ObraExportCapaImagem | null
}) {
  const capitulos = input.capitulos.map((c) =>
    c.id === input.capituloAtivoId
      ? { ...c, titulo: input.tituloCapitulo.trim() || c.titulo, texto: input.textoAtivo }
      : c,
  )

  return buildObraExportSnapshot({
    titulo: input.titulo,
    autorNome: input.autorNome,
    tipo: input.tipo,
    tipoLabel: TIPO_OBRA_LABEL[input.tipo],
    categoriaLabel: CATEGORIA_OBRA_LABEL[input.categoria],
    descricao: input.descricao || null,
    capitulos,
    capa: input.capa ?? null,
  })
}

function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export async function downloadObraComoPdf(snapshot: ReturnType<typeof buildObraExportSnapshot>) {
  const blob = await buildObraPdfBlob(snapshot)
  triggerBrowserDownload(blob, obraExportFilename(snapshot.titulo, 'pdf'))
}

export async function downloadObraComoDocx(snapshot: ReturnType<typeof buildObraExportSnapshot>) {
  const blob = await buildObraDocxBlob(snapshot)
  triggerBrowserDownload(blob, obraExportFilename(snapshot.titulo, 'docx'))
}