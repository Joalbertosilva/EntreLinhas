import { Stack } from 'expo-router'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import type { CategoriaObra, TipoObra } from '@tcc-sistema/types'
import {
  BookMarked,
  BookOpen,
  FileText,
  Download,
  FileDown,
  Globe,
  ImagePlus,
  Loader2,
  PenLine,
  Plus,
  Quote,
  Trash2,
} from 'lucide-react-native'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PlatformBackground } from '@/components/layout/PlatformBackground'
import { ScreenBackHeader } from '@/components/layout/ScreenBackHeader'
import { Input } from '@/components/ui/Input'
import {
  countPalavras,
  estimatePaginas,
  obraTemConteudo,
  useAdicionarCapitulo,
  useDespublicarObra,
  useExcluirObra,
  useMinhaObraEditor,
  usePublicarObra,
  useSalvarMinhaObra,
  useSalvarObraMeta,
  type ObraCapitulo,
} from '@/features/obras/useMinhaObra'
import {
  CATEGORIA_COVER_PALETTE,
  CATEGORIA_OBRA_LABEL,
  CATEGORIAS_LIVRO,
  CATEGORIAS_TEXTO,
} from '@/lib/obraCategoriaLabels'
import {
  TIPO_OBRA_EDITOR_PLACEHOLDER,
  TIPO_OBRA_HINT,
  TIPO_OBRA_LABEL,
} from '@/lib/obraLabels'
import { LoadingOverlay } from '@/components/ui/LoadingOverlay'
import { isDefaultObraCoverUrl } from '@tcc-sistema/cover-motifs'
import { captureObraCoverArt } from '@/features/obras/generateObraCoverImage'
import { ObraCoverArtView } from '@/features/obras/ObraCoverArtView'
import { capaImageUri } from '@/lib/imageUrl'
import { resolveObraCapaFotoUri } from '@/lib/obraCapaFoto'
import { uploadObraCapaFotoFromUri, uploadObraCoverFromBase64 } from '@/lib/storage'
import { cn } from '@/lib/cn'
import type { NativeViewRef } from '@/lib/nativeRefs'
import { stackScrollPaddingBottom } from '@/lib/layout'
import { resolveCapaImagemParaExport } from '@/lib/obraExportCapa'
import { shareObraComoDocx, shareObraComoPdf, snapshotFromEditorState } from '@/lib/obraExportDownload'
import { resolvePublicImageUri } from '@/lib/imageUrl'
import { useAuth } from '@/providers/AuthProvider'

const TIPOS: Array<{ id: TipoObra; icon: typeof BookOpen }> = [
  { id: 'livro', icon: BookOpen },
  { id: 'cronica', icon: FileText },
  { id: 'poema', icon: Quote },
]

export default function MinhaObraScreen() {
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
  const excluirObra = useExcluirObra(profile?.id)

  const [tituloObra, setTituloObra] = useState('')
  const [descricao, setDescricao] = useState('')
  const [tipoObra, setTipoObra] = useState<TipoObra>('livro')
  const [categoriaObra, setCategoriaObra] = useState<CategoriaObra>('ficcao')
  const [capituloAtivoId, setCapituloAtivoId] = useState<string | null>(null)
  const [tituloCapitulo, setTituloCapitulo] = useState('')
  const [texto, setTexto] = useState('')
  const [dirty, setDirty] = useState(false)
  const [capaUrl, setCapaUrl] = useState<string | null>(null)
  const [capaFotoUri, setCapaFotoUri] = useState<string | null>(null)
  const [capaPreviewUri, setCapaPreviewUri] = useState<string | null>(null)
  const [exportando, setExportando] = useState<'pdf' | 'docx' | null>(null)
  const [capaPreviewMeta, setCapaPreviewMeta] = useState<{
    mimeType: string
    fileSize?: number
  } | null>(null)
  const [uploadingCapa, setUploadingCapa] = useState(false)

  const salvarRef = useRef(salvar)
  salvarRef.current = salvar
  const obraIdRef = useRef<string | null>(null)
  const coverPreviewRef = useRef<NativeViewRef>(null)
  const coverJobRef = useRef(0)
  const { width: screenWidth } = useWindowDimensions()
  const coverPreviewWidth = Math.min(screenWidth - 40, 300)

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
    if (!capaPreviewUri) setCapaUrl(obra.capa_url)
    if (!capituloAtivoId && obra.capitulos[0]) {
      const cap = obra.capitulos[0]
      setCapituloAtivoId(cap.id)
      setTituloCapitulo(cap.titulo)
      setTexto(cap.texto)
    }
  }, [obra?.id, obra?.capa_url, isLoading, capituloAtivoId, obra, capaPreviewUri])

  useEffect(() => {
    if (!obra || !profile?.id || capaPreviewUri) return
    let cancelled = false
    void resolveObraCapaFotoUri(profile.id, obra.id).then((uri) => {
      if (!cancelled) setCapaFotoUri(uri)
    })
    return () => {
      cancelled = true
    }
  }, [obra?.id, profile?.id, capaPreviewUri])

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

  const regerarCapaComFoto = useCallback(
    async (photoUri: string, categoria: CategoriaObra) => {
      if (!obra || !profile) return
      setCapaPreviewUri(photoUri)
      await new Promise((resolve) => setTimeout(resolve, 550))
      const job = ++coverJobRef.current
      setUploadingCapa(true)
      try {
        const artBase64 = await captureObraCoverArt(coverPreviewRef, { delayMs: 450 })
        if (job !== coverJobRef.current) return
        const url = await uploadObraCoverFromBase64(artBase64, profile.id, obra.id)
        await salvarMeta.mutateAsync({
          obraId: obra.id,
          titulo: tituloObra.trim() || defaultTitle,
          descricao: descricao.trim() || null,
          capa_url: url,
        })
        if (job !== coverJobRef.current) return
        setCapaUrl(url)
        setCapaFotoUri(photoUri)
        setCapaPreviewUri(null)
        setCapaPreviewMeta(null)
      } catch (e) {
        Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível atualizar a capa.')
      } finally {
        if (job === coverJobRef.current) setUploadingCapa(false)
      }
    },
    [defaultTitle, descricao, obra, profile, salvarMeta, tituloObra],
  )

  const handleCategoriaChange = async (next: CategoriaObra) => {
    if (!obra || !profile || next === categoriaObra || uploadingCapa) return
    try {
      await salvarMeta.mutateAsync({
        obraId: obra.id,
        titulo: tituloObra.trim() || defaultTitle,
        descricao: descricao.trim() || null,
        categoria: next,
      })
      setCategoriaObra(next)

      let fotoUri = capaPreviewUri ?? capaFotoUri
      if (!fotoUri) {
        fotoUri = await resolveObraCapaFotoUri(profile.id, obra.id)
        if (fotoUri) setCapaFotoUri(fotoUri)
      }

      if (fotoUri) {
        await regerarCapaComFoto(fotoUri, next)
      } else if (capaUrl) {
        Alert.alert(
          'Atualizar capa',
          'Para aplicar o novo gênero na capa, toque em “Enviar foto · capa conceitual” e escolha a imagem de novo.',
        )
      }
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

  const gerarCapaConceitual = useCallback(async () => {
    if (!obra || !profile || !capaPreviewUri) return
    const job = ++coverJobRef.current
    setUploadingCapa(true)
    try {
      const artBase64 = await captureObraCoverArt(coverPreviewRef, { delayMs: 450 })
      if (job !== coverJobRef.current) return
      const url = await uploadObraCoverFromBase64(artBase64, profile.id, obra.id)
      let capaFotoUrl: string | undefined
      if (capaPreviewMeta && capaPreviewUri) {
        capaFotoUrl = await uploadObraCapaFotoFromUri(
          capaPreviewUri,
          profile.id,
          obra.id,
          capaPreviewMeta.mimeType,
          capaPreviewMeta.fileSize,
        )
      }
      await salvarMeta.mutateAsync({
        obraId: obra.id,
        titulo: tituloObra.trim() || defaultTitle,
        descricao: descricao.trim() || null,
        capa_url: url,
        ...(capaFotoUrl
          ? { capa_foto_url: capaFotoUrl.split('?')[0] ?? capaFotoUrl }
          : {}),
      })
      if (job !== coverJobRef.current) return
      setCapaUrl(url)
      if (capaPreviewUri) setCapaFotoUri(capaPreviewUri)
      setCapaPreviewUri(null)
      setCapaPreviewMeta(null)
      Alert.alert('Capa pronta', 'Sua foto foi colocada na capa do tema escolhido.')
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível gerar a capa.')
    } finally {
      if (job === coverJobRef.current) setUploadingCapa(false)
    }
  }, [capaPreviewUri, defaultTitle, descricao, obra, profile, salvarMeta, tituloObra])

  const handleFotoCarregada = useCallback(() => {
    void gerarCapaConceitual()
  }, [gerarCapaConceitual])

  const handleEscolherCapa = async () => {
    if (!obra || !profile || uploadingCapa) return
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('Permissão', 'Precisamos de acesso à galeria para enviar a capa.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
      allowsEditing: true,
      aspect: [1, 1],
    })
    if (result.canceled || !result.assets[0]) return

    const asset = result.assets[0]
    coverJobRef.current += 1
    setCapaPreviewUri(asset.uri)
    setCapaPreviewMeta({
      mimeType: asset.mimeType ?? 'image/jpeg',
      fileSize: asset.fileSize,
    })
  }

  const handleCancelarCapa = () => {
    coverJobRef.current += 1
    setUploadingCapa(false)
    setCapaPreviewUri(null)
    setCapaPreviewMeta(null)
  }

  const capaSalvaUrl = capaUrl && !isDefaultObraCoverUrl(capaUrl) ? capaUrl : null
  const capaSalvaUri = capaImageUri(capaSalvaUrl, obra?.updated_at)
  const capaPendente = Boolean(capaPreviewUri)
  const fotoNaMoldura = capaPreviewUri ?? capaFotoUri
  const mostrarCapaInterativa = Boolean(
    fotoNaMoldura || !capaSalvaUrl || capaPendente || uploadingCapa,
  )
  const tituloCapa = tituloObra.trim() || defaultTitle

  const capitulosAtualizados =
    obra?.capitulos.map((c) =>
      c.id === capituloAtivoId ? { ...c, titulo: tituloCapitulo, texto } : c,
    ) ?? []

  const capaUriParaExport =
    capaPreviewUri ?? capaSalvaUri ?? resolvePublicImageUri('/images/minha-obra-default-cover.png') ?? null

  const buildExportSnapshot = (capa: Awaited<ReturnType<typeof resolveCapaImagemParaExport>>) =>
    snapshotFromEditorState({
      titulo: tituloObra,
      descricao,
      tipo: tipoObra,
      categoria: categoriaObra,
      autorNome: profile?.nome ?? 'Autor',
      capitulos: capitulosAtualizados,
      capituloAtivoId,
      tituloCapitulo,
      textoAtivo: texto,
      capa,
    })

  const handleExportar = async (formato: 'pdf' | 'docx') => {
    if (!obra) return
    if (!obraTemConteudo(capitulosAtualizados)) {
      Alert.alert('Sem texto', 'Escreva algo antes de exportar.')
      return
    }
    setExportando(formato)
    try {
      const capa = await resolveCapaImagemParaExport(capaUriParaExport)
      const snapshot = buildExportSnapshot(capa)
      if (formato === 'pdf') await shareObraComoPdf(snapshot)
      else await shareObraComoDocx(snapshot)
      Alert.alert(
        formato === 'pdf' ? 'PDF pronto' : 'Word pronto',
        'O arquivo foi gerado. Use o menu para salvar no celular ou enviar para outro app.',
      )
    } catch (e) {
      const detalhe = e instanceof Error ? e.message : null
      Alert.alert(
        'Erro',
        detalhe
          ? `Não foi possível gerar o arquivo: ${detalhe}`
          : 'Não foi possível gerar o arquivo. Atualize o app Expo Go e tente de novo.',
      )
    } finally {
      setExportando(null)
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

  const confirmarExcluirObra = () => {
    if (!obra) return
    Alert.alert(
      'Apagar obra',
      'Isso remove capítulos e publicação. Não dá para desfazer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: () => {
            void excluirObra.mutateAsync(obra.id).catch(() => {
              Alert.alert('Erro', 'Não foi possível apagar a obra.')
            })
          },
        },
      ],
    )
  }

  const confirmarDespublicar = () => {
    if (!obra) return
    Alert.alert(
      'Despublicar obra',
      'A obra deixa de aparecer para outros alunos. Você pode publicar de novo quando quiser.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Despublicar',
          style: 'destructive',
          onPress: () => {
            void despublicar
              .mutateAsync(obra.id)
              .then(() => {
                Alert.alert('Despublicada', 'Sua obra voltou para rascunho.')
              })
              .catch(() => {
                Alert.alert('Erro', 'Não foi possível despublicar.')
              })
          },
        },
      ],
    )
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: true, fullScreenGestureEnabled: true }} />
      <LoadingOverlay visible={uploadingCapa} label="Gerando capa conceitual…" />
      <PlatformBackground style={{ paddingTop: insets.top }}>
        <ScreenBackHeader title="Minha obra" subtitle={TIPO_OBRA_HINT[tipoObra]} />

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#1c756a" size="large" />
            <Text className="mt-3 font-sans text-sm text-text-muted">Preparando seu espaço de escrita…</Text>
          </View>
        ) : obra ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: stackScrollPaddingBottom(insets) }}
          >
            <View className="mx-5 mt-4">
              <View className="mb-3 flex-row flex-wrap gap-2">
                <Pressable
                  onPress={() => void handleExportar('pdf')}
                  disabled={exportando !== null}
                  className="flex-row items-center gap-2 rounded-full border border-border bg-white px-4 py-2.5 active:bg-primary-light/15 disabled:opacity-50"
                  accessibilityRole="button"
                  accessibilityLabel="Exportar obra em PDF"
                >
                  {exportando === 'pdf' ? (
                    <Loader2 color="#1c756a" size={16} />
                  ) : (
                    <Download color="#1c756a" size={16} strokeWidth={1.75} />
                  )}
                  <Text className="font-sans-semibold text-sm text-brand-navy">PDF</Text>
                </Pressable>
                <Pressable
                  onPress={() => void handleExportar('docx')}
                  disabled={exportando !== null}
                  className="flex-row items-center gap-2 rounded-full border border-border bg-white px-4 py-2.5 active:bg-primary-light/15 disabled:opacity-50"
                  accessibilityRole="button"
                  accessibilityLabel="Exportar obra em Word"
                >
                  {exportando === 'docx' ? (
                    <Loader2 color="#1c756a" size={16} />
                  ) : (
                    <FileDown color="#1c756a" size={16} strokeWidth={1.75} />
                  )}
                  <Text className="font-sans-semibold text-sm text-brand-navy">Word</Text>
                </Pressable>
              </View>
              <View className="flex-row flex-wrap items-center gap-2">
                {isPublicada ? (
                  <View className="flex-row items-center gap-1.5 rounded-full border border-success/25 bg-success/10 px-3 py-1.5">
                    <Globe color="#15803d" size={15} strokeWidth={2} />
                    <Text className="font-sans-semibold text-xs text-success">Publicada</Text>
                  </View>
                ) : null}

                {isPublicada ? (
                  <Pressable
                    onPress={confirmarDespublicar}
                    disabled={despublicar.isPending}
                    className="flex-row items-center gap-2 rounded-full border border-border bg-white px-4 py-2.5 active:bg-primary-light/15 disabled:opacity-50"
                    accessibilityRole="button"
                    accessibilityLabel="Despublicar obra"
                  >
                    {despublicar.isPending ? (
                      <Loader2 color="#5a7282" size={16} />
                    ) : (
                      <Globe color="#5a7282" size={16} strokeWidth={1.75} />
                    )}
                    <Text className="font-sans-semibold text-sm text-brand-navy">Despublicar</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => void handlePublicar()}
                    disabled={publicar.isPending || dirty || salvar.isPending}
                    className="min-w-0 flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 active:opacity-90 disabled:opacity-50"
                    accessibilityRole="button"
                    accessibilityLabel="Publicar obra na comunidade"
                  >
                    {publicar.isPending ? (
                      <Loader2 color="#fff" size={18} />
                    ) : (
                      <Globe color="#fff" size={18} />
                    )}
                    <Text className="font-sans-semibold text-[15px] text-white">Publicar na comunidade</Text>
                  </Pressable>
                )}
              </View>

              {isPublicada ? (
                <Text className="mt-2.5 font-sans text-xs leading-relaxed text-text-muted">
                  Outros alunos podem ver e ler sua obra. Toque em Despublicar para voltar ao rascunho.
                </Text>
              ) : dirty || salvar.isPending ? (
                <Text className="mt-2 text-center font-sans text-xs text-text-muted">
                  Aguarde o salvamento antes de publicar
                </Text>
              ) : null}
            </View>

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
                {categoriasDisponiveis.map((cat) => {
                  const palette = CATEGORIA_COVER_PALETTE[cat]
                  const active = categoriaObra === cat
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => void handleCategoriaChange(cat)}
                      className={cn(
                        'flex-row items-center gap-1.5 rounded-full border px-3 py-1.5',
                        active ? 'border-primary bg-primary-light' : 'border-border bg-white',
                      )}
                    >
                      <View
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: palette.mid, borderWidth: 1, borderColor: palette.frame }}
                      />
                      <Text
                        className={cn(
                          'font-sans-medium text-xs',
                          active ? 'text-primary' : 'text-text-muted',
                        )}
                      >
                        {CATEGORIA_OBRA_LABEL[cat]}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>

            <View className="mx-5 mt-5 overflow-hidden rounded-2xl border border-primary/15 bg-primary-light/30">
              <Text className="border-b border-primary/10 bg-white/80 px-4 py-2 font-sans-semibold text-xs uppercase tracking-wide text-primary">
                Capa conceitual
              </Text>
              <Text className="border-b border-primary/10 bg-white/60 px-4 py-2 font-sans text-xs text-text-muted">
                Cada tema tem cores e elementos (romance, biografia, ficção…). Sua foto entra no centro da arte.
              </Text>

              <Pressable
                onPress={() => void handleEscolherCapa()}
                disabled={uploadingCapa}
                className="items-center py-4"
                accessibilityRole="button"
                accessibilityLabel="Enviar foto para capa conceitual"
              >
                {mostrarCapaInterativa ? (
                  <View
                    className="overflow-hidden rounded-xl border border-primary/15 shadow-sm"
                    style={{
                      width: coverPreviewWidth,
                      height: coverPreviewWidth * 1.5,
                    }}
                  >
                    <ObraCoverArtView
                      ref={coverPreviewRef}
                      photoUri={fotoNaMoldura}
                      categoria={categoriaObra}
                      titulo={tituloCapa}
                      width={coverPreviewWidth}
                      onPhotoLoad={
                        capaPreviewUri && capaPreviewMeta ? handleFotoCarregada : undefined
                      }
                    />
                  </View>
                ) : (
                  <Image
                    source={{ uri: capaSalvaUri! }}
                    style={{ width: coverPreviewWidth, height: coverPreviewWidth * 1.5, borderRadius: 12 }}
                    contentFit="cover"
                    recyclingKey={capaSalvaUri!}
                  />
                )}
              </Pressable>

              {capaPendente && uploadingCapa ? (
                <View className="flex-row items-center justify-center gap-2 border-t border-primary/10 bg-white/90 py-3">
                  <Loader2 color="#1c756a" size={16} />
                  <Text className="font-sans-semibold text-sm text-primary">Montando capa do tema…</Text>
                </View>
              ) : capaPendente ? (
                <View className="border-t border-primary/10 bg-white/90 p-3">
                  <Pressable
                    onPress={handleCancelarCapa}
                    className="items-center rounded-xl border border-border py-2.5 active:bg-primary-light/20"
                  >
                    <Text className="font-sans-semibold text-sm text-text-muted">Cancelar</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={() => void handleEscolherCapa()}
                  disabled={uploadingCapa}
                  className="border-t border-primary/10 bg-white/90 py-3 active:bg-primary-light/20"
                >
                  <View className="flex-row items-center justify-center gap-2">
                    <ImagePlus color="#1c756a" size={16} />
                    <Text className="font-sans-semibold text-sm text-primary">
                      {capaUrl ? 'Trocar foto' : 'Enviar foto'} · capa conceitual
                    </Text>
                  </View>
                </Pressable>
              )}
            </View>

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

            <View className="mx-5 mt-8 items-center pb-2">
              <Pressable
                onPress={confirmarExcluirObra}
                disabled={excluirObra.isPending}
                className="flex-row items-center gap-1.5 rounded-xl px-3 py-2 active:opacity-70"
                accessibilityRole="button"
                accessibilityLabel="Apagar obra"
              >
                <Trash2 color="#94a3b8" size={15} strokeWidth={1.75} />
                <Text className="font-sans-medium text-sm text-text-muted">Apagar obra</Text>
              </Pressable>
            </View>
          </ScrollView>
        ) : null}
      </PlatformBackground>
    </>
  )
}
