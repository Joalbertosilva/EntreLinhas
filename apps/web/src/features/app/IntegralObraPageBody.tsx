import { useEffect, useRef, useState } from 'react'
import { splitObraEmParagrafos } from '@/lib/integralObraParagraphs'
import {
  lerPaginaTraduzidaCache,
  traduzirPaginaLeitor,
} from '@/lib/integralReaderOnDemandTranslate'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const ESPIA_LOADER_MS = 25_000

type IntegralObraPageBodyProps = {
  conteudoId: string
  pageId: string
  titulo: string
  corpo: string
  idiomaOrigem: string
  traduzirPt: boolean
  immersive?: boolean
  onTraduzindo: (ativo: boolean) => void
  onErro: (msg: string | null) => void
  onTituloPt?: (titulo: string) => void
  scrollRef?: React.RefObject<HTMLDivElement | null>
}

export function IntegralObraPageBody({
  conteudoId,
  pageId,
  titulo,
  corpo,
  idiomaOrigem,
  traduzirPt,
  immersive,
  onTraduzindo,
  onErro,
  onTituloPt,
  scrollRef,
}: IntegralObraPageBodyProps) {
  const [texto, setTexto] = useState(corpo)
  const [aguardando, setAguardando] = useState(false)
  const [exibirOriginalEnquantoEspera, setExibirOriginalEnquantoEspera] = useState(false)
  const onTraduzindoRef = useRef(onTraduzindo)
  const onErroRef = useRef(onErro)
  const onTituloPtRef = useRef(onTituloPt)
  onTraduzindoRef.current = onTraduzindo
  onErroRef.current = onErro
  onTituloPtRef.current = onTituloPt

  useEffect(() => {
    setExibirOriginalEnquantoEspera(false)
    onErroRef.current(null)

    if (!traduzirPt) {
      setTexto(corpo)
      onTituloPtRef.current?.(titulo)
      onTraduzindoRef.current(false)
      setAguardando(false)
      return
    }

    const emCache = lerPaginaTraduzidaCache(conteudoId, pageId, corpo, idiomaOrigem)
    if (emCache) {
      setTexto(emCache.corpo)
      onTituloPtRef.current?.(emCache.titulo)
      onTraduzindoRef.current(false)
      setAguardando(false)
      return
    }

    setTexto(corpo)
    setAguardando(true)
    let cancelado = false
    onTraduzindoRef.current(true)

    const timerOriginal = window.setTimeout(() => {
      if (!cancelado) setExibirOriginalEnquantoEspera(true)
    }, ESPIA_LOADER_MS)

    void traduzirPaginaLeitor(conteudoId, pageId, titulo, corpo, idiomaOrigem)
      .then((pt) => {
        if (cancelado) return
        setTexto(pt.corpo)
        onTituloPtRef.current?.(pt.titulo)
        onErroRef.current(null)
      })
      .catch(() => {
        if (cancelado) return
        setTexto(corpo)
        onTituloPtRef.current?.(titulo)
        onErroRef.current(
          'Não foi possível traduzir esta página. Use «Tentar de novo» ou leia o original acima.',
        )
      })
      .finally(() => {
        if (!cancelado) {
          onTraduzindoRef.current(false)
          setAguardando(false)
        }
      })

    return () => {
      cancelado = true
      window.clearTimeout(timerOriginal)
    }
  }, [conteudoId, pageId, titulo, corpo, idiomaOrigem, traduzirPt])

  const paragrafos = splitObraEmParagrafos(texto)
  const paragrafosOriginais = splitObraEmParagrafos(corpo)
  const carregando = aguardando && traduzirPt
  const aindaSemPt =
    carregando &&
    texto.trim() === corpo.trim() &&
    !lerPaginaTraduzidaCache(conteudoId, pageId, corpo, idiomaOrigem)
  const ocultarCorpo = aindaSemPt && !exibirOriginalEnquantoEspera

  return (
    <div
      ref={scrollRef}
      className={cn(
        'book-prose book-page-text scrollbar-thin integral-obra-texto notranslate',
        immersive && 'book-page-text--immersive',
      )}
      lang={traduzirPt && texto !== corpo ? 'pt' : idiomaOrigem === 'auto' ? 'en' : idiomaOrigem}
      translate="no"
      tabIndex={0}
    >
      {ocultarCorpo ? (
        <p className="integral-obra-paragrafo inline-flex items-center gap-2 text-sm text-text-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Traduzindo para português…
        </p>
      ) : (
        <>
          {carregando ? (
            <p className="integral-obra-paragrafo mb-2 inline-flex items-center gap-2 text-xs text-text-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              {exibirOriginalEnquantoEspera && aindaSemPt
                ? 'Ainda traduzindo… você pode ler o original abaixo.'
                : 'Traduzindo para português…'}
            </p>
          ) : null}
          {(exibirOriginalEnquantoEspera && aindaSemPt ? paragrafosOriginais : paragrafos).map((p, idx) => (
            <p
              key={`${pageId}-${exibirOriginalEnquantoEspera ? 'orig' : 'pt'}-${idx}`}
              className="integral-obra-paragrafo"
            >
              {p}
            </p>
          ))}
        </>
      )}
    </div>
  )
}