import { useRouter } from 'expo-router'
import { Image } from 'expo-image'
import type { TipoConteudo } from '@tcc-sistema/types'
import { BookMarked, FileText, Music, Quote, Sparkles } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import { Speakable } from '@/features/accessibility/Speakable'
import type { ConteudoCardData } from '@/features/conteudos/useConteudos'
import { contentCardSpeakLabel } from '@/lib/contentSpeakLabel'
import { ContentCardLeituraMenu } from '@/features/leituras/ContentCardLeituraMenu'
import { useLeiturasMap } from '@/features/leituras/useLeiturasMap'
import { TIPO_CONTEUDO_LABEL } from '@/lib/labels'
import { CONTENT_CARD_WIDTH, CONTENT_COVER_HEIGHT } from '@/lib/layout'
import { cn } from '@/lib/cn'
import { useAuth } from '@/providers/AuthProvider'

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
  width?: number
}

export function ContentCard({ conteudo, showTipo = false, width }: ContentCardProps) {
  const router = useRouter()
  const { profile } = useAuth()
  const { data: leiturasMap } = useLeiturasMap(profile?.id)
  const meta = TIPO_META[conteudo.tipo]
  const Icon = meta.icon
  const cardWidth = width ?? CONTENT_CARD_WIDTH
  const coverHeight = Math.round(cardWidth * (CONTENT_COVER_HEIGHT / CONTENT_CARD_WIDTH))
  const showMenu = conteudo.tipo === 'livro' && Boolean(profile)
  const leituraStatus = leiturasMap?.[conteudo.id] ?? null

  const open = () => router.push(`/(aluno)/conteudo/${conteudo.id}`)

  const speakLabel = contentCardSpeakLabel(conteudo, leituraStatus)

  return (
    <Speakable label={speakLabel} style={{ width: cardWidth }}>
      <View style={{ width: cardWidth, height: coverHeight }} className="relative">
        <Pressable
          onPress={open}
          accessibilityRole="button"
          accessibilityLabel={`Abrir ${conteudo.titulo}`}
          className="overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm"
          style={{ width: cardWidth, height: coverHeight }}
        >
          {conteudo.capa_url ? (
            <Image
              source={{ uri: conteudo.capa_url }}
              style={{ width: cardWidth, height: coverHeight }}
              contentFit="cover"
            />
          ) : (
            <View className={cn('flex-1 items-start justify-end p-2.5', meta.bgClass)}>
              <View className="rounded-lg bg-white/90 p-1.5">
                <Icon color="#1c756a" size={16} strokeWidth={1.75} />
              </View>
            </View>
          )}

          {leituraStatus === 'em_andamento' ? (
            <View className="absolute bottom-1.5 left-1.5 rounded-full bg-primary px-2 py-0.5">
              <Text className="font-sans-bold text-[9px] uppercase text-white">Lendo</Text>
            </View>
          ) : null}
          {leituraStatus === 'concluido' ? (
            <View className="absolute bottom-1.5 left-1.5 rounded-full bg-success px-2 py-0.5">
              <Text className="font-sans-bold text-[9px] uppercase text-white">Lido</Text>
            </View>
          ) : null}
        </Pressable>

        {showMenu ? (
          <ContentCardLeituraMenu conteudoId={conteudo.id} status={leituraStatus} variant="cover" />
        ) : null}
      </View>

      <Pressable onPress={open}>
        <Text className="mt-2 font-sans-semibold text-sm leading-snug text-text" numberOfLines={2}>
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
      </Pressable>
    </Speakable>
  )
}
