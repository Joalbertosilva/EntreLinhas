import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import type { UseFormRegister, FieldValues, Path } from 'react-hook-form'

interface ReflexaoFormFieldsProps<T extends FieldValues> {
  register: UseFormRegister<T>
  /** Prefixo dos campos no formulário de conteúdo (reflexao_*) ou vazio para temas */
  mode: 'conteudo' | 'tema'
}

const FIELDS = {
  conteudo: {
    tema: 'reflexao_tema',
    frase: 'reflexao_frase',
    texto: 'reflexao_texto',
    pergunta: 'reflexao_pergunta',
  },
  tema: {
    tema: 'tema',
    frase: 'questionamento',
    texto: 'descricao',
    pergunta: 'ensinamento',
  },
} as const

function StepBadge({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
        {n}
      </span>
      <span className="text-sm font-semibold text-brand-navy">{label}</span>
    </div>
  )
}

export function ReflexaoFormFields<T extends FieldValues>({
  register,
  mode,
}: ReflexaoFormFieldsProps<T>) {
  const names = FIELDS[mode]

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={names.tema}>Tema (rótulo curto)</Label>
        <Input
          id={names.tema}
          placeholder="Ex.: vínculo, amizade, responsabilidade"
          {...register(names.tema as Path<T>)}
        />
      </div>

      <div className="space-y-2 rounded-lg border border-primary/15 bg-white/70 p-3">
        <StepBadge n={1} label="Frase do livro" />
        <Textarea
          id={names.frase}
          rows={2}
          placeholder='Só a citação. Ex.: "Foi o tempo que você passou com sua rosa..."'
          className="mt-2 bg-white"
          {...register(names.frase as Path<T>)}
        />
      </div>

      <div className="space-y-2 rounded-lg border border-accent/30 bg-accent-light/20 p-3">
        <StepBadge n={2} label="Reflexão (orientação para o aluno)" />
        <p className="text-xs leading-relaxed text-text-muted">
          Texto curto que ajuda quem ainda não consegue refletir só com a frase.
        </p>
        <Textarea
          id={names.texto}
          rows={3}
          placeholder="Ex.: Quando passamos tempo com alguém, criamos laços. É isso que torna alguém especial."
          className="bg-white"
          {...register(names.texto as Path<T>)}
        />
      </div>

      <div className="space-y-2 rounded-lg border border-primary/15 bg-white/70 p-3">
        <StepBadge n={3} label="Pergunta para o aluno" />
        <Textarea
          id={names.pergunta}
          rows={2}
          placeholder="Ex.: Quem é uma pessoa importante para você? O que vocês viveram juntos?"
          className="mt-2 bg-white"
          {...register(names.pergunta as Path<T>)}
        />
        <p className="text-xs text-text-muted">
          Se deixar em branco, o aluno verá: &ldquo;O que essa frase desperta em você?&rdquo;
        </p>
      </div>
    </div>
  )
}
