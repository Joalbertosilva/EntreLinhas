import {
  buildObraExportSnapshot,
  type ObraCapituloLike,
  type ObraExportCapaImagem,
} from '@tcc-sistema/obra-export'
import type { CategoriaObra, TipoObra } from '@tcc-sistema/types'
import { CATEGORIA_OBRA_LABEL } from '@/lib/obraCategoriaLabels'
import { TIPO_OBRA_LABEL } from '@/lib/obraLabels'
import { resolveCapaImagemParaExport } from '@/lib/obraExportCapa'

export function snapshotFromObraPublica(obra: {
  titulo: string
  descricao: string | null
  tipo: TipoObra
  categoria: CategoriaObra
  capa_url: string | null
  updated_at?: string | null
  autor: { nome: string } | null
  capitulos: ObraCapituloLike[]
  capa?: ObraExportCapaImagem | null
}) {
  return buildObraExportSnapshot({
    titulo: obra.titulo,
    autorNome: obra.autor?.nome ?? 'Autor',
    tipo: obra.tipo,
    tipoLabel: TIPO_OBRA_LABEL[obra.tipo],
    categoriaLabel: CATEGORIA_OBRA_LABEL[obra.categoria],
    descricao: obra.descricao,
    capitulos: obra.capitulos,
    capa: obra.capa ?? null,
  })
}

export async function snapshotFromObraPublicaComCapa(obra: {
  titulo: string
  descricao: string | null
  tipo: TipoObra
  categoria: CategoriaObra
  capa_url: string | null
  updated_at?: string | null
  autor: { nome: string } | null
  capitulos: ObraCapituloLike[]
}) {
  const capa = await resolveCapaImagemParaExport({
    capaPreview: null,
    capaUrl: obra.capa_url,
    obraUpdatedAt: obra.updated_at,
  })
  return snapshotFromObraPublica({ ...obra, capa })
}