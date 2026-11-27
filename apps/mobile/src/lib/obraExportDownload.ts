import {
  buildObraDocxBase64,
  buildObraExportSnapshot,
  buildObraPrintHtml,
  obraExportFilename,
  type ObraCapituloLike,
  type ObraExportCapaImagem,
} from '@tcc-sistema/obra-export'
import type { CategoriaObra, TipoObra } from '@tcc-sistema/types'
import * as FileSystem from 'expo-file-system/legacy'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
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

async function shareFileAtPath(path: string, filename: string, mimeType: string) {
  const canShare = await Sharing.isAvailableAsync()
  if (!canShare) throw new Error('Compartilhamento indisponível neste dispositivo')
  await Sharing.shareAsync(path, {
    mimeType,
    dialogTitle: filename,
    UTI: mimeType === 'application/pdf' ? 'com.adobe.pdf' : mimeType,
  })
}

async function shareBase64File(base64: string, filename: string, mimeType: string) {
  const dir = FileSystem.cacheDirectory
  if (!dir) throw new Error('Armazenamento temporário indisponível')
  const path = `${dir}${filename}`
  await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 })
  await shareFileAtPath(path, filename, mimeType)
}

export async function shareObraComoPdf(snapshot: ReturnType<typeof buildObraExportSnapshot>) {
  const name = obraExportFilename(snapshot.titulo, 'pdf')
  const dir = FileSystem.cacheDirectory
  if (!dir) throw new Error('Armazenamento temporário indisponível')

  const html = buildObraPrintHtml(snapshot)
  const { uri } = await Print.printToFileAsync({ html, base64: false })
  const dest = `${dir}${name}`
  await FileSystem.copyAsync({ from: uri, to: dest })
  await shareFileAtPath(dest, name, 'application/pdf')
}

export async function shareObraComoDocx(snapshot: ReturnType<typeof buildObraExportSnapshot>) {
  const base64 = await buildObraDocxBase64(snapshot)
  const name = obraExportFilename(snapshot.titulo, 'docx')
  await shareBase64File(
    base64,
    name,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  )
}