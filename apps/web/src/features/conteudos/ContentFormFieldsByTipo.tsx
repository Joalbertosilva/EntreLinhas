import type { ReactNode } from 'react'
import type { ConteudoFormInput } from '@tcc-sistema/schemas'
import type { PlataformaConteudoTipo } from '@/features/conteudos/contentFormConfig'
import { CATALOG_ANCHORS } from '@tcc-sistema/types'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { LabelWithHint } from '@/components/ui/FieldHint'
import { FieldError, Label } from '@/components/ui/Label'
import { CATALOG_ANCHOR_LABEL } from '@/lib/catalogAnchorLabels'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'

interface ContentFormFieldsByTipoProps {
  tipo: PlataformaConteudoTipo
  register: UseFormRegister<ConteudoFormInput>
  errors: FieldErrors<ConteudoFormInput>
}

function FormSection({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: ReactNode
}) {
  return (
    <section className="space-y-4 rounded-xl border border-border/80 bg-surface/35 p-4 sm:p-5">
      <div>
        <h3 className="text-sm font-semibold text-brand-navy">{title}</h3>
        {hint && <p className="mt-1 text-xs leading-relaxed text-text-muted">{hint}</p>}
      </div>
      {children}
    </section>
  )
}

export function ContentFormFieldsByTipo({ tipo, register, errors }: ContentFormFieldsByTipoProps) {
  if (tipo === 'video') {
    return (
      <FormSection
        title="Vídeo"
        hint="Somente título, descrição e link. O aluno abre o vídeo em outra aba — sem player embutido."
      >
        <div className="space-y-2">
          <LabelWithHint
            htmlFor="video_url"
            required
            hint="YouTube ou outra plataforma. O botão na plataforma abrirá este endereço em nova aba."
          >
            Link do vídeo
          </LabelWithHint>
          <Input
            id="video_url"
            placeholder="https://www.youtube.com/watch?v=..."
            {...register('video_url')}
          />
          <FieldError message={errors.video_url?.message} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <LabelWithHint
              htmlFor="catalog_anchor"
              hint="Após qual seção da home este vídeo aparece (ex.: abaixo de Livros)."
            >
              Posição no catálogo
            </LabelWithHint>
            <Select id="catalog_anchor" {...register('catalog_anchor')}>
              <option value="">Selecione a seção</option>
              {CATALOG_ANCHORS.map((anchor) => (
                <option key={anchor} value={anchor}>
                  {CATALOG_ANCHOR_LABEL[anchor]}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <LabelWithHint
              htmlFor="video_categoria"
              hint="Rótulo curto no card — ex.: Importância da leitura."
            >
              Categoria do vídeo
            </LabelWithHint>
            <Input
              id="video_categoria"
              placeholder="Ex.: Importância da leitura"
              {...register('video_categoria')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            rows={4}
            placeholder="Breve apresentação do vídeo para o aluno..."
            {...register('descricao')}
          />
        </div>
      </FormSection>
    )
  }

  if (tipo === 'livro') {
    return (
      <>
        <FormSection title="Apresentação do livro">
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              rows={3}
              placeholder="Apresentação geral da obra..."
              {...register('descricao')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resumo">Resumo</Label>
            <Textarea
              id="resumo"
              rows={4}
              placeholder="Síntese da história para orientar a leitura..."
              {...register('resumo')}
            />
          </div>
        </FormSection>

        <FormSection title="Leitura completa">
          <div className="space-y-2">
            <Label htmlFor="conteudo_textual">Texto integral</Label>
            <Textarea
              id="conteudo_textual"
              rows={10}
              placeholder="Texto completo ou capítulos iniciais..."
              className="min-h-[12rem] font-mono text-sm leading-relaxed"
              {...register('conteudo_textual')}
            />
          </div>
        </FormSection>

        <FormSection title="Contexto literário">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="personagens">Personagens</Label>
              <Textarea id="personagens" rows={4} {...register('personagens')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contexto">Contexto histórico</Label>
              <Textarea id="contexto" rows={4} {...register('contexto')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pontos_importantes">Pontos importantes</Label>
            <Textarea id="pontos_importantes" rows={3} {...register('pontos_importantes')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="curiosidades">Curiosidades</Label>
            <Textarea id="curiosidades" rows={3} {...register('curiosidades')} />
          </div>
        </FormSection>
      </>
    )
  }

  if (tipo === 'cronica') {
    return (
      <>
        <FormSection title="Apresentação da crônica">
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              rows={3}
              placeholder="Do que trata esta crônica..."
              {...register('descricao')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resumo">Resumo (opcional)</Label>
            <Textarea
              id="resumo"
              rows={2}
              placeholder="Síntese em poucas linhas..."
              {...register('resumo')}
            />
          </div>
        </FormSection>

        <FormSection title="Texto da crônica">
          <div className="space-y-2">
            <Label htmlFor="conteudo_textual">Crônica completa *</Label>
            <Textarea
              id="conteudo_textual"
              rows={12}
              placeholder="Cole ou escreva o texto completo da crônica..."
              className="min-h-[14rem] leading-relaxed"
              {...register('conteudo_textual')}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contexto">Contexto</Label>
              <Textarea
                id="contexto"
                rows={3}
                placeholder="Quando, onde ou por que foi escrita..."
                {...register('contexto')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pontos_importantes">Pontos de atenção</Label>
              <Textarea
                id="pontos_importantes"
                rows={3}
                placeholder="Temas ou ideias centrais..."
                {...register('pontos_importantes')}
              />
            </div>
          </div>
        </FormSection>
      </>
    )
  }

  if (tipo === 'poema') {
    return (
      <>
        <FormSection title="Apresentação do poema">
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              rows={3}
              placeholder="Contexto ou apresentação breve do poema..."
              {...register('descricao')}
            />
          </div>
        </FormSection>

        <FormSection title="Texto do poema">
          <div className="space-y-2">
            <Label htmlFor="conteudo_textual">Poema completo *</Label>
            <Textarea
              id="conteudo_textual"
              rows={14}
              placeholder="Versos do poema, com quebras de linha..."
              className="min-h-[16rem] leading-relaxed"
              {...register('conteudo_textual')}
            />
          </div>
        </FormSection>
      </>
    )
  }

  if (tipo === 'musica') {
    return (
      <>
        <FormSection title="Apresentação da música">
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              rows={3}
              placeholder="Sobre a música, artista ou tema..."
              {...register('descricao')}
            />
          </div>
          <div className="space-y-2">
            <LabelWithHint
              htmlFor="musica_video_url"
              hint="YouTube, Spotify ou outra plataforma. O aluno pode abrir em nova aba."
            >
              Link para ouvir
            </LabelWithHint>
            <Input
              id="musica_video_url"
              placeholder="https://www.youtube.com/watch?v=... ou Spotify"
              {...register('video_url')}
            />
            <FieldError message={errors.video_url?.message} />
          </div>
        </FormSection>

        <FormSection title="Letra">
          <div className="space-y-2">
            <Label htmlFor="conteudo_textual">Letra completa *</Label>
            <Textarea
              id="conteudo_textual"
              rows={14}
              placeholder="Letra da música, com estrofes e refrão..."
              className="min-h-[16rem] leading-relaxed"
              {...register('conteudo_textual')}
            />
          </div>
        </FormSection>
      </>
    )
  }

  return null
}
