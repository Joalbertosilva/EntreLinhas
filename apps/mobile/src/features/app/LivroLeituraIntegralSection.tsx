import { useMemo } from 'react'
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native'
import { BookOpen, Lock, Sparkles } from 'lucide-react-native'
import type { Conteudo, StatusLeitura, StatusLeituraIntegral } from '@tcc-sistema/types'
import { BookPaginatedReader } from '@/features/reader/BookPaginatedReader'
import {
  buildIntegralBookPages,
  getIntegralBookPageStorageKey,
} from '@/features/reader/bookPagination'
import { resolveConteudoCoverUrl } from '@/lib/conteudoCover'
import { SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'
import {
  mensagemLeituraIntegralBloqueada,
  podeAcessarLeituraIntegral,
} from '@/features/app/leituraIntegral'
import {
  useCapitulosIntegralLeitura,
  useCapitulosIntegralLista,
} from '@/features/app/useCapitulosIntegralLeitura'
import { useAtualizarLeituraIntegral } from '@/features/app/useLeituraIntegralAluno'
import { Speakable } from '@/features/accessibility/Speakable'
import { obraIntegralJaEmPortugues } from '@/lib/integralTranslateHeuristics'
import { cn } from '@/lib/cn'

interface LivroLeituraIntegralSectionProps {
  conteudo: Pick<
    Conteudo,
    'id' | 'titulo' | 'autor' | 'capa_url' | 'integral_ativa' | 'integral_licenca' | 'integral_traducao_credito'
  >
  usuarioId: string | undefined
  statusEstudo: StatusLeitura | null | undefined
  integralStatus: StatusLeituraIntegral | null | undefined
}

export function LivroLeituraIntegralSection({
  conteudo,
  usuarioId,
  statusEstudo,
  integralStatus,
}: LivroLeituraIntegralSectionProps) {
  const conteudoId = conteudo.id
  const showBlock = Boolean(conteudo.integral_ativa)
  const { data: listaCapitulos = [], isLoading: loadingLista } = useCapitulosIntegralLista(conteudoId, showBlock)
  const desbloqueado = podeAcessarLeituraIntegral(conteudo, statusEstudo, listaCapitulos.length)
  const leitorAtivo = showBlock && desbloqueado && Boolean(integralStatus)

  const {
    data: capitulosComTexto = [],
    isLoading: loadingTextos,
    isError: erroTextos,
    error: erroTextosMsg,
    refetch: recarregarTextos,
  } = useCapitulosIntegralLeitura(conteudoId, leitorAtivo)

  const atualizarIntegral = useAtualizarLeituraIntegral(conteudoId, usuarioId)

  const coverUrl = resolveConteudoCoverUrl(conteudo)
  const credito = conteudo.integral_traducao_credito?.trim() || 'Domínio público'
  const labelTrecho =
    listaCapitulos.length > 0 &&
    listaCapitulos.every((c) => /^Página\s+\d+$/i.test(c.titulo.trim()) || /^(?:Capítulo|CAPÍTULO)\s+/i.test(c.titulo.trim()))
      ? 'páginas'
      : 'trechos'

  const integralEmPortugues =
    capitulosComTexto.length > 0 && obraIntegralJaEmPortugues(capitulosComTexto)

  const pages = useMemo(
    () =>
      buildIntegralBookPages(
        {
          titulo: conteudo.titulo,
          autor: conteudo.autor,
          coverUrl,
          creditoTraducao: conteudo.integral_traducao_credito,
        },
        capitulosComTexto.map((c) => ({
          id: c.id,
          ordem: c.ordem,
          titulo: c.titulo,
          texto: c.texto_pt,
        })),
      ),
    [capitulosComTexto, conteudo.autor, conteudo.integral_traducao_credito, conteudo.titulo, coverUrl],
  )

  if (!showBlock) return null

  const mensagemBloqueio = mensagemLeituraIntegralBloqueada(conteudo, statusEstudo, listaCapitulos.length)
  const loadingLeitura = loadingLista || (leitorAtivo && loadingTextos)

  const handleIniciarIntegral = async () => {
    if (integralStatus) return
    try {
      await atualizarIntegral.mutateAsync('em_andamento')
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível iniciar a leitura integral')
    }
  }

  const handleConcluirIntegral = async () => {
    if (integralStatus === 'concluido') return
    try {
      await atualizarIntegral.mutateAsync('concluido')
      Alert.alert('Parabéns!', 'Você concluiu a leitura integral desta obra.')
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível registrar a conclusão')
    }
  }

  return (
    <View style={{ marginHorizontal: SCREEN_HORIZONTAL_PADDING }} className="mt-8">
      <View className="mb-4 flex-row items-center gap-3 rounded-2xl border border-primary/15 bg-primary-light/25 p-4">
        <View className="rounded-xl bg-white/90 p-3">
          {desbloqueado ? (
            <BookOpen color="#1c756a" size={24} strokeWidth={1.5} />
          ) : (
            <Lock color="#5a7282" size={22} strokeWidth={1.75} />
          )}
        </View>
        <View className="min-w-0 flex-1">
          <Text className="font-sans-bold text-lg text-brand-navy">Leitura integral</Text>
          <Text className="mt-0.5 font-sans text-xs text-text-muted">
            Obra completa · {credito}
            {listaCapitulos.length > 0 ? ` · ${listaCapitulos.length} ${labelTrecho}` : ''}
          </Text>
        </View>
      </View>

      {loadingLeitura ? (
        <View className="flex-row items-center gap-2 py-2">
          <ActivityIndicator color="#1c756a" />
          <Text className="font-sans text-sm text-text-muted">
            {loadingTextos ? 'Carregando o texto da obra…' : 'Carregando trechos…'}
          </Text>
        </View>
      ) : null}

      {!loadingLista && mensagemBloqueio ? (
        <Speakable label={mensagemBloqueio}>
          <Text className="rounded-2xl border border-primary/15 bg-primary-light/30 px-4 py-3 font-sans text-sm text-text">
            {mensagemBloqueio}
          </Text>
        </Speakable>
      ) : null}

      {!loadingLeitura && desbloqueado ? (
        <View className="gap-4">
          {!integralStatus ? (
            <Pressable
              onPress={() => void handleIniciarIntegral()}
              disabled={atualizarIntegral.isPending}
              className="flex-row items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 active:opacity-90"
            >
              {atualizarIntegral.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Sparkles color="#fff" size={18} />
              )}
              <Text className="font-sans-semibold text-sm text-white">Começar leitura integral</Text>
            </Pressable>
          ) : null}

          {integralStatus && listaCapitulos.length > 0 && erroTextos ? (
            <View className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <Text className="font-sans text-sm text-amber-950">
                {erroTextosMsg instanceof Error ? erroTextosMsg.message : 'Não foi possível carregar o texto.'}
              </Text>
              <Pressable
                onPress={() => void recarregarTextos()}
                className="mt-3 self-start rounded-full border border-primary/30 bg-white px-4 py-2"
              >
                <Text className="font-sans-semibold text-xs text-primary">Tentar de novo</Text>
              </Pressable>
            </View>
          ) : null}

          {integralStatus && !erroTextos && pages.length > 0 ? (
            <>
              {!integralEmPortugues ? (
                <Text className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 font-sans text-sm text-amber-950">
                  Este texto integral pode não estar totalmente em português. Se tiver dificuldade, peça ajuda ao
                  professor na plataforma web.
                </Text>
              ) : null}
              <Text className="font-sans text-xs text-text-muted">
                {listaCapitulos.length} {labelTrecho} · {pages.length} páginas no leitor (capa inclusa). Use Anterior /
                Próxima ou o modo leitura.
              </Text>
              <BookPaginatedReader
                pages={pages}
                conteudoId={conteudoId}
                titulo={`${conteudo.titulo} — integral`}
                storageKey={getIntegralBookPageStorageKey(conteudoId)}
                allowImmersive
              />
              <Pressable
                onPress={() => void handleConcluirIntegral()}
                disabled={integralStatus === 'concluido' || atualizarIntegral.isPending}
                className={cn(
                  'items-center rounded-full px-5 py-3',
                  integralStatus === 'concluido' ? 'border border-primary/30 bg-white' : 'bg-primary active:opacity-90',
                )}
              >
                <Text
                  className={cn(
                    'font-sans-semibold text-sm',
                    integralStatus === 'concluido' ? 'text-primary' : 'text-white',
                  )}
                >
                  {integralStatus === 'concluido' ? 'Integral concluída' : 'Marcar integral como concluída'}
                </Text>
              </Pressable>
            </>
          ) : null}
        </View>
      ) : null}
    </View>
  )
}