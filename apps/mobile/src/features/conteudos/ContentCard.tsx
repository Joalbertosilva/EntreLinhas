import { useRouter } from 'expo-router'
import { Image } from 'expo-image'
import type { TipoConteudo } from '@tcc-sistema/types'
import { BookMarked, FileText, Music, Quote, Sparkles } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import type { ConteudoCardData } from '@/features/conteudos/useConteudos'
import { TIPO_CONTEUDO_LABEL } from '@/lib/labels'
import { cn } from '@/lib/cn'

const TIPO_META: Record<TipoConteudo, { icon: typeof BookMarked; bgClass: string }> = {
  livro: { icon: BookMarked, bgClass: 'bg-primary-light' },
  cronica: { icon: FileText, bgClass: 'bg-accent-light' },
  poema: { icon: Quote, bgClass: 'bg-primary-light/70' },
  musica: { icon: Music, bgClass: 'bg-accent-light' },
  frase: { icon: Quote, bgClass: 'bg-primary-light/60' },
  outro: { icon: Sparkles, bgClass: 'bg-surface' },
}

interface ContentCardProps {
  conteudo: ConteudoCardData
  showTipo?: boolean
  className?: string
}

export function ContentCard({ conteudo, showTipo = false, className }: ContentCardProps) {
  const router = useRouter()
  const meta = TIPO_META[conteudo.tipo]
  const Icon = meta.icon

  const open = () => {
    router.push(`/(aluno)/conteudo/${conteudo.id}`)
  }

  return (
    <Pressable
      onPress={open}
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${conteudo.titulo}`}
      className={cn('w-[140px]', className)}
    >
      <View className="aspect-[3/4] overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm">
        {conteudo.capa_url ? (
          <Image
            source={{ uri: conteudo.capa_url }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            accessibilityLabel=""
          />
        ) : (
          <View className={cn('flex-1 items-start justify-end p-3', meta.bgClass)}>
            <View className="rounded-lg bg-white/90 p-2">
              <Icon color="#1c756a" size={18} strokeWidth={1.75} />
            </View>
          </View>
        )}
      </View>

      <View className="mt-2.5 px-0.5">
        <Text className="font-sans-semibold text-sm leading-snug text-text" numberOfLines={2}>
          {conteudo.titulo}
        </Text>
        {conteudo.autor ? (
          <Text className="mt-0.5 font-sans text-xs text-text-muted" numberOfLines={1}>
            {conteudo.autor}
          </Text>
        ) : null}
        {showTipo ? (
          <Text className="mt-1 font-sans-medium text-[10px] uppercase tracking-wide text-primary">
            {TIPO_CONTEUDO_LABEL[conteudo.tipo]}
          </Text>
        ) : null}
      </View>
    </Pressable>
  )
}
