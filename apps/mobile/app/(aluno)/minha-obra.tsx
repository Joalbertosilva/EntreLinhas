import { Stack, useRouter } from 'expo-router'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import type { CategoriaObra, TipoObra } from '@tcc-sistema/types'
import {
  ArrowLeft,
  BookMarked,
  BookOpen,
  FileText,
  Globe,
  ImagePlus,
  Loader2,
  PenLine,
  Plus,
  Quote,
} from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Input } from '@/components/ui/Input'
import {
  countPalavras,
  estimatePaginas,
  obraTemConteudo,
  useAdicionarCapitulo,
  useDespublicarObra,
  useMinhaObraEditor,
  usePublicarObra,
  useSalvarMinhaObra,
  useSalvarObraMeta,
  type ObraCapitulo,
} from '@/features/obras/useMinhaObra'
import {
  CATEGORIA_OBRA_LABEL,
  CATEGORIAS_LIVRO,
  CATEGORIAS_TEXTO,
} from '@/lib/obraCategoriaLabels'
import {
  TIPO_OBRA_EDITOR_PLACEHOLDER,
  TIPO_OBRA_HINT,
  TIPO_OBRA_LABEL,
} from '@/lib/obraLabels'
import { uploadObraCoverFromUri } from '@/lib/storage'
import { cn } from '@/lib/cn'
import { useAuth } from '@/providers/AuthProvider'

const TIPOS: Array<{ id: TipoObra; icon: typeof BookOpen }> = [
  { id: 'livro', icon: BookOpen },
  { id: 'cronica', icon: FileText },
  { id: 'poema', icon: Quote },
]

export default function MinhaObraScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { profile } = useAuth()
  const firstName = profile?.nome.split(' ')[0] ?? 'Leitor'
  const defaultTitle = `Obra de ${firstName}`

  const { data: obra, isLoading } = useMinhaObraEditor(profile?.id, defaultTitle)
  const salvar = useSalvarMinhaObra(profile?.id)
  const salvarMeta = useSalvarObraMeta(profile?.id)
  const adicionarCapitulo = useAdicionarCapitulo(profile?.id)
  const publicar = usePublicarObra(profile?.id)
  const despublicar = useDespublicarObra(profile?.id)

  const [tituloObra, setTituloObra] = useState('')
  const [descricao, setDescricao] = useState('')
  const [tipoObra, setTipoObra] = useState<TipoObra>('livro')
  const [categoriaObra, setCategoriaObra] = useState<CategoriaObra>('ficcao')
  const [capituloAtivoId, setCapituloAtivoId] = useState<string | null>(null)
  const [tituloCapitulo, setTituloCapitulo] = useState('')
  const [texto, setTexto] = useState('')
  const [dirty, setDirty] = useState(false)
  const [capaUrl, setCapaUrl] = useState<string | null>(null)
  const [uploadingCapa, setUploadingCapa] = useState(false)

  const salvarRef = useRef(salvar)
  salvarRef.current = salvar
  const obraIdRef = useRef<string | null>(null)

  const isLivro = tipoObra === 'livro'
  const isPublicada = obra?.publicado ?? false

  useEffect(() => {
    if (!obra || isLoading) return

    const obraMudou = obraIdRef.current !== obra.id
    obraIdRef.current = obra.id

    setTituloObra(obra.titulo)
    setDescricao(obra.descricao ?? '')
    setTipoObra(obra.tipo)
    setCategoriaObra(obra.categoria ?? 'outro')
    if (obraMudou) setCapaUrl(obra.capa_url)

    if (!capituloAtivoId && obra.capitulos[0]) {
      const cap = obra.capitulos[0]
      setCapituloAtivoId(cap.id)
      setTituloCapitulo(cap.titulo)
      setTexto(cap.texto)
    }
  }, [obra?.id, isLoading, capituloAtivoId, obra])

  useEffect(() => {
    if (!dirty || !obra || !capituloAtivoId || isLoading) return

    const timer = setTimeout(() => {
      salvarRef.current.mutate(
        {
          obraId: obra.id,
          producaoId: capituloAtivoId,
          titulo: tituloObra.trim() || defaultTitle,
          descricao: descricao.trim() || null,
          capituloTitulo: isLivro ? tituloCapitulo.trim() || 'Capítulo' : 'Texto',
          texto,
        },
        {
          onSuccess: () => setDirty(false),
          onError: () => Alert.alert('Erro', 'Não foi possível salvar. Tente de novo.'),
        },
      )
    }, 900)

    return () => clearTimeout(timer)
  }, [dirty, tituloObra, descricao, tituloCapitulo, texto, obra, capituloAtivoId, defaultTitle, isLoading, isLivro])

  const trocarCapitulo = (cap: ObraCapitulo) => {
    if (cap.id === capituloAtivoId) return
    setCapituloAtivoId(cap.id)
    setTituloCapitulo(cap.titulo)
    setTexto(cap.texto)
    setDirty(false)
  }

  const handleTipoChange = async (next: TipoObra) => {
    if (!obra || next === tipoObra) return
    try {
      await salvarMeta.mutateAsync({
        obraId: obra.id,
        titulo: tituloObra.trim() || defaultTitle,
        descricao: descricao.trim() || null,
        tipo: next,
      })
      setTipoObra(next)
    } catch {
      Alert.alert('Erro', 'Não foi possível alterar o formato')
    }
  }

  const handleCategoriaChange = async (next: CategoriaObra) => {
    if (!obra || next === categoriaObra) return
    try {
      await salvarMeta.mutateAsync({
        obraId: obra.id,
        titulo: tituloObra.trim() || defaultTitle,
        descricao: descricao.trim() || null,
        categoria: next,
      })
      setCategoriaObra(next)
    } catch {
      Alert.alert('Erro', 'Não foi possível alterar a categoria')
    }
  }

  const handleNovoCapitulo = async () => {
    if (!obra) return
    try {
      const novo = await adicionarCapitulo.mutateAsync({ obraId: obra.id, tipo: tipoObra })
      setCapituloAtivoId(novo.id)
      setTituloCapitulo(novo.titulo)
      setTexto('')
      setDirty(false)
    } catch {
      Alert.alert('Erro', 'Não foi possível criar o capítulo')
    }
  }

  const handleEscolherCapa = async () => {
    if (!obra || !profile) return
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('Permissão', 'Precisamos de acesso à galeria para enviar a capa.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    })
    if (result.canceled || !result.assets[0]) return

    const asset = result.assets[0]
    setUploadingCapa(true)
    try {
      const url = await uploadObraCoverFromUri(
        asset.uri,
        profile.id,
        obra.id,
        asset.mimeType ?? 'image/jpeg',
        asset.fileSize,
      )
      await salvarMeta.mutateAsync({
        obraId: obra.id,
        titulo: tituloObra.trim() || defaultTitle,
        descricao: descricao.trim() || null,
        capa_url: url.split('?')[0] ?? url,
      })
      setCapaUrl(url)
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível enviar a capa.')
    } finally {
      setUploadingCapa(false)
    }
  }

  const handlePublicar = async () => {
    if (!obra) return
    const temTexto = obraTemConteudo(
      obra.capitulos.map((c) => (c.id === capituloAtivoId ? { ...c, texto } : c)),
    )
    if (!temTexto) {
      Alert.alert('Escreva algo', 'Escreva algo antes de publicar.')
      return
    }
    if (dirty || salvar.isPending) {
      Alert.alert('Aguarde', 'Aguarde o salvamento terminar.')
      return
    }
    try {
      await publicar.mutateAsync(obra.id)
      Alert.alert('Publicada!', 'Outros alunos já podem ler sua obra.')
    } catch {
      Alert.alert('Erro', 'Não foi possível publicar')
    }
  }

  const palavras = countPalavras(texto)
  const paginas = estimatePaginas(palavras)
  const categoriasDisponiveis = isLivro ? CATEGORIAS_LIVRO : CATEGORIAS_TEXTO

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center gap-3 border-b border-border px-4 py-3">
          <Pressable onPress={() => router.back()} className="rounded-full p-2 active:bg-primary-light">
            <ArrowLeft color="#1a3342" size={22} strokeWidth={1.75} />
          </Pressable>
          <View className="min-w-0 flex-1">
            <Text className="font-sans-bold text-lg text-brand-navy">Minha obra</Text>
            <Text className="font-sans text-xs text-text-muted">{TIPO_OBRA_HINT[tipoObra]}</Text>
          </View>
          {isPublicada ? (
            <Pressable
              onPress={() => void despublicar.mutateAsync(obra!.id)}
              disabled={despublicar.isPending}
              className="rounded-full border border-border px-3 py-1.5"
            >
              <Text className="font-sans-semibold text-xs text-text-muted">Despublicar</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => void handlePublicar()}
              disabled={publicar.isPending || dirty || salvar.isPending}
              className="flex-row items-center gap-1 rounded-full bg-primary px-3 py-1.5"
            >
              {publicar.isPending ? (
                <Loader2 color="#fff" size={14} />
              ) : (
                <Globe color="#fff" size={14} />
              )}
              <Text className="font-sans-semibold text-xs text-white">Publicar</Text>
            </Pressable>
          )}
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#1c756a" size="large" />
            <Text className="mt-3 font-sans text-sm text-text-muted">Preparando seu espaço de escrita…</Text>
          </View>
        ) : obra ? (
          <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
            {isPublicada ? (
              <View className="mx-5 mt-4 flex-row items-center gap-2 rounded-xl bg-success/10 px-4 py-2">
                <Globe color="#15803d" size={16} />
                <Text className="font-sans-semibold text-sm text-success">Obra publicada na comunidade</Text>
              </View>
            ) : null}

            <View className="mx-5 mt-4">
              <Text className="mb-2 font-sans-semibold text-xs uppercase tracking-wide text-text-muted">
                Formato
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {TIPOS.map(({ id, icon: Icon }) => (
                  <Pressable
                    key={id}
                    onPress={() => void handleTipoChange(id)}
                    className={cn(
                      'flex-row items-center gap-2 rounded-full border px-3 py-2',
                      tipoObra === id ? 'border-primary bg-primary-light' : 'border-border bg-white',
                    )}
                  >
                    <Icon color={tipoObra === id ? '#1c756a' : '#5a7282'} size={16} />
                    <Text
                      className={cn(
                        'font-sans-semibold text-sm',
                        tipoObra === id ? 'text-primary' : 'text-text-muted',
                      )}
                    >
                      {TIPO_OBRA_LABEL[id]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="mx-5 mt-4">
              <Text className="mb-2 font-sans-semibold text-xs uppercase tracking-wide text-text-muted">
                Categoria
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {categoriasDisponiveis.map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => void handleCategoriaChange(cat)}
                    className={cn(
                      'rounded-full border px-3 py-1.5',
                      categoriaObra === cat ? 'border-primary bg-primary-light' : 'border-border bg-white',
                    )}
                  >
                    <Text
                      className={cn(
                        'font-sans-medium text-xs',
                        categoriaObra === cat ? 'text-primary' : 'text-text-muted',
                      )}
                    >
                      {CATEGORIA_OBRA_LABEL[cat]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable
              onPress={() => void handleEscolherCapa()}
              disabled={uploadingCapa}
              className="mx-5 mt-5 overflow-hidden rounded-2xl border border-primary/15 bg-primary-light/30"
            >
              <View className="h-40 items-center justify-center">
                {capaUrl ? (
                  <Image source={{ uri: capaUrl }} style={{ width: '100%', height: 160 }} contentFit="cover" />
                ) : (
                  <View className="items-center gap-2">
                    <ImagePlus color="#1c756a" size={28} />
                    <Text className="font-sans-semibold text-sm text-primary">Enviar capa da obra</Text>
                  </View>
                )}
                {uploadingCapa ? (
                  <View className="absolute inset-0 items-center justify-center bg-black/30">
                    <Loader2 color="#fff" size={24} />
                  </View>
                ) : null}
              </View>
            </Pressable>

            <View className="mx-5 mt-5 gap-3">
              <View>
                <Text className="mb-1.5 font-sans-semibold text-sm text-text">Título</Text>
                <Input
                  value={tituloObra}
                  onChangeText={(v) => {
                    setTituloObra(v)
                    setDirty(true)
                  }}
                  placeholder={defaultTitle}
                />
              </View>
              <View>
                <Text className="mb-1.5 font-sans-semibold text-sm text-text">Sinopse (opcional)</Text>
                <Input
                  value={descricao}
                  onChangeText={(v) => {
                    setDescricao(v)
                    setDirty(true)
                  }}
                  placeholder="Do que fala?"
                />
              </View>
            </View>

            {isLivro && (
              <View className="mx-5 mt-5">
                <Text className="mb-2 font-sans-semibold text-xs uppercase tracking-wide text-text-muted">
                  Capítulos
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {obra.capitulos.map((cap) => (
                    <Pressable
                      key={cap.id}
                      onPress={() => trocarCapitulo(cap)}
                      className={cn(
                        'flex-row items-center gap-1.5 rounded-xl border px-3 py-2',
                        cap.id === capituloAtivoId ? 'border-primary bg-primary-light' : 'border-border bg-white',
                      )}
                    >
                      <BookMarked color={cap.id === capituloAtivoId ? '#1c756a' : '#5a7282'} size={14} />
                      <Text
                        className={cn(
                          'max-w-[120px] font-sans-medium text-sm',
                          cap.id === capituloAtivoId ? 'text-primary' : 'text-text',
                        )}
                        numberOfLines={1}
                      >
                        {cap.titulo}
                      </Text>
                    </Pressable>
                  ))}
                  <Pressable
                    onPress={() => void handleNovoCapitulo()}
                    disabled={adicionarCapitulo.isPending}
                    className="flex-row items-center gap-1 rounded-xl border border-dashed border-primary/30 px-3 py-2"
                  >
                    <Plus color="#1c756a" size={14} />
                    <Text className="font-sans-semibold text-sm text-primary">Novo</Text>
                  </Pressable>
                </ScrollView>
              </View>
            )}

            {isLivro && (
              <View className="mx-5 mt-4">
                <Text className="mb-1.5 font-sans-semibold text-sm text-text">Título do capítulo</Text>
                <Input
                  value={tituloCapitulo}
                  onChangeText={(v) => {
                    setTituloCapitulo(v)
                    setDirty(true)
                  }}
                  placeholder="Capítulo 1"
                />
              </View>
            )}

            <View className="mx-5 mt-4 rounded-2xl border border-border bg-white p-4">
              <View className="mb-3 flex-row items-center gap-2">
                <PenLine color="#1c756a" size={18} />
                <Text className="font-sans-semibold text-base text-brand-navy">Escrever</Text>
              </View>
              <TextInput
                value={texto}
                onChangeText={(v) => {
                  setTexto(v)
                  setDirty(true)
                }}
                placeholder={TIPO_OBRA_EDITOR_PLACEHOLDER[tipoObra]}
                placeholderTextColor="#5a7282"
                multiline
                textAlignVertical="top"
                className="min-h-[320px] font-sans text-base leading-7 text-text"
              />
              <View className="mt-3 flex-row items-center justify-between border-t border-border/60 pt-3">
                <Text className="font-sans text-xs text-text-muted">
                  {palavras} palavras
                  {paginas > 0 ? ` · ~${paginas} ${paginas === 1 ? 'página' : 'páginas'}` : ''}
                </Text>
                <Text
                  className={cn(
                    'font-sans-semibold text-xs',
                    salvar.isPending ? 'text-primary' : dirty ? 'text-text-muted' : 'text-success',
                  )}
                >
                  {salvar.isPending ? 'Salvando…' : dirty ? 'Pendente…' : 'Salvo'}
                </Text>
              </View>
            </View>
          </ScrollView>
        ) : null}
      </View>
    </>
  )
}
