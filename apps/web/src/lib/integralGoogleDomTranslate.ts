import translate from 'google-translate-api-x'
import { inferirIdiomaOrigemTrecho } from '@/lib/integralTranslateHeuristics'

type GoogleTranslateWindow = Window &
  Record<string, unknown> & {
    google?: {
      translate: {
        TranslateElement: new (
          options: {
            pageLanguage: string
            includedLanguages?: string
            autoDisplay?: boolean
          },
          elementId: string,
        ) => void
      }
    }
  }

const HOST_ID = 'google_translate_element_integral'
let widgetPronto = false
let pageLanguageAtual = ''

function win(): GoogleTranslateWindow {
  return window as unknown as GoogleTranslateWindow
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function garantirHost(): HTMLElement {
  let el = document.getElementById(HOST_ID)
  if (!el) {
    el = document.createElement('div')
    el.id = HOST_ID
    el.className = 'integral-google-translate-host'
    el.setAttribute('aria-hidden', 'true')
    document.body.appendChild(el)
  }
  return el
}

export function ensureGoogleTranslateScript(): Promise<void> {
  if (win().google?.translate?.TranslateElement) {
    return Promise.resolve()
  }
  return new Promise((resolve, reject) => {
    const cb = `__integralGTranslateCb_${Date.now()}`
    const existing = document.querySelector('script[data-integral-gtranslate]')
    if (existing && win().google?.translate?.TranslateElement) {
      resolve()
      return
    }
    win()[cb] = () => {
      delete win()[cb]
      resolve()
    }
    const s = document.createElement('script')
    s.dataset.integralGtranslate = '1'
    s.src = `https://translate.google.com/translate_a/element.js?cb=${cb}`
    s.async = true
    s.onerror = () => reject(new Error('script-falhou'))
    document.head.appendChild(s)
  })
}

export function limparCookiesGoogleTranslate(): void {
  const paths = ['/', window.location.pathname]
  const domains = ['', window.location.hostname, `.${window.location.hostname}`]
  for (const path of paths) {
    for (const domain of domains) {
      const domPart = domain ? `;domain=${domain}` : ''
      document.cookie = `googtrans=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path}${domPart}`
    }
  }
}

/** Idioma de origem esperado pelo widget (igual ao «Traduzir página» do Chrome). */
export function idiomaParaGooglePageLanguage(idioma: string, amostraTexto?: string): string {
  const inferred = inferirIdiomaOrigemTrecho(amostraTexto?.trim() ?? '', idioma)
  if (inferred === 'fr' || inferred === 'en' || inferred === 'es' || inferred === 'de') return inferred
  if (idioma === 'fr' || idioma === 'en' || idioma === 'es' || idioma === 'de') return idioma
  return 'en'
}

export async function garantirWidgetGoogle(idioma: string, amostraTexto?: string): Promise<void> {
  const lang = idiomaParaGooglePageLanguage(idioma, amostraTexto)
  await ensureGoogleTranslateScript()
  const TranslateElement = win().google?.translate?.TranslateElement
  if (!TranslateElement) throw new Error('widget-indisponivel')

  if (!widgetPronto || pageLanguageAtual !== lang) {
    limparCookiesGoogleTranslate()
    garantirHost().innerHTML = ''
    new TranslateElement(
      {
        pageLanguage: lang,
        includedLanguages: 'pt',
        autoDisplay: false,
      },
      HOST_ID,
    )
    widgetPronto = true
    pageLanguageAtual = lang
    await sleep(400)
  }
}

function limparClassesTraduzidasHtml(): void {
  document.documentElement.classList.remove('translated-ltr', 'translated-rtl')
  document.body.classList.remove('translated-ltr', 'translated-rtl')
}

/** Volta ao original e liga PT de novo — necessário a cada troca de página no leitor. */
export async function resetarEReativarPortuguesGoogle(
  idioma: string,
  amostraTexto?: string,
): Promise<boolean> {
  limparClassesTraduzidasHtml()
  restaurarIdiomaOriginal()
  await sleep(120)

  const lang = idiomaParaGooglePageLanguage(idioma, amostraTexto)
  definirCookieGoogTrans(lang)
  await sleep(60)

  const select = document.querySelector<HTMLSelectElement>('select.goog-te-combo')
  if (select) {
    select.value = ''
    select.dispatchEvent(new Event('change'))
    await sleep(180)
    select.value = 'pt'
    select.dispatchEvent(new Event('change'))
    await sleep(400)
    return true
  }

  return aplicarPortuguesGoogleTranslate(idioma, 100, 70)
}

/** Liga «português» no combo do widget (traduz o que estiver na tela sem barra visível). */
export async function ativarTraducaoPortuguesNoLeitor(
  idioma: string,
  amostraTexto?: string,
): Promise<boolean> {
  try {
    await garantirWidgetGoogle(idioma, amostraTexto)
    await sleep(150)
    return await resetarEReativarPortuguesGoogle(idioma, amostraTexto)
  } catch {
    return false
  }
}

/** Após mudar de capítulo/página no leitor (conteúdo novo no DOM). */
export async function reaplicarTraducaoPortuguesNoLeitor(
  idioma: string,
  amostraTexto?: string,
): Promise<boolean> {
  try {
    await garantirWidgetGoogle(idioma, amostraTexto)
    await sleep(80)
    return await resetarEReativarPortuguesGoogle(idioma, amostraTexto)
  } catch {
    return false
  }
}

/** Cookie que o Google usa no carregamento da página (igual ao «Traduzir» do Chrome). */
export function prepararCookieTraducaoGoogle(idioma: string, amostraTexto?: string): void {
  definirCookieGoogTrans(idiomaParaGooglePageLanguage(idioma, amostraTexto))
}

function definirCookieGoogTrans(origem: string): void {
  const go = origem === 'auto' ? 'en' : origem
  const val = `googtrans=/${go}/pt`
  const paths = ['/', window.location.pathname]
  const domains = ['', window.location.hostname, `.${window.location.hostname}`]
  for (const path of paths) {
    for (const domain of domains) {
      const domPart = domain ? `;domain=${domain}` : ''
      document.cookie = `${val};path=${path}${domPart}`
    }
  }
}

function aplicarPortuguesGoogleTranslate(
  origem: string,
  maxTentativas = 40,
  intervaloMs = 75,
): Promise<boolean> {
  const lang = idiomaParaGooglePageLanguage(origem)
  definirCookieGoogTrans(lang)

  return new Promise((resolve) => {
    let n = 0
    const tick = () => {
      const select = document.querySelector<HTMLSelectElement>('select.goog-te-combo')
      if (select) {
        if (select.value === 'pt') {
          select.value = ''
          select.dispatchEvent(new Event('change'))
        }
        window.setTimeout(() => {
          select.value = 'pt'
          select.dispatchEvent(new Event('change'))
          resolve(true)
        }, 100)
        return
      }
      n++
      if (n >= maxTentativas) {
        resolve(false)
        return
      }
      setTimeout(tick, intervaloMs)
    }
    tick()
  })
}

export function restaurarIdiomaOriginal(): void {
  const select = document.querySelector<HTMLSelectElement>('select.goog-te-combo')
  if (!select) return
  select.value = ''
  select.dispatchEvent(new Event('change'))
}

/** Remove widget/cookies do Tradutor (evita a barra cinza «Traduzido para: Português»). */
export function desmontarGoogleTranslateNoLeitor(): void {
  limparCookiesGoogleTranslate()
  restaurarIdiomaOriginal()
  document.body.classList.remove('book-integral-translate-active')
  const host = document.getElementById(HOST_ID)
  if (host) host.innerHTML = ''
  document.querySelectorAll('script[data-integral-gtranslate]').forEach((el) => el.remove())
  widgetPronto = false
  pageLanguageAtual = ''
  document.body.style.top = ''
  document.body.style.position = ''
}

export async function traduzirTituloRapido(titulo: string, idioma: string): Promise<string> {
  const q = titulo.trim()
  if (!q) return titulo
  try {
    const from = idioma === 'pt' ? 'auto' : idioma
    const res = await translate(q, { to: 'pt', from, fallbackBatch: true })
    return res.text.trim() || titulo
  } catch {
    return titulo
  }
}