import translate from 'google-translate-api-x'
import { supabase } from '@/lib/supabase'

const PROBE: Record<string, string> = {
  en: 'The little prince looked at the sky.',
  fr: 'Le petit prince regarda le ciel.',
  auto: 'Hello world.',
}

export async function preflightTradutorIntegral(idioma: string): Promise<boolean> {
  const from = idioma === 'pt' ? 'en' : idioma === 'desconhecido' ? 'auto' : idioma
  const probe = PROBE[from] ?? PROBE.auto!

  try {
    const res = await translate(probe, { from, to: 'pt', fallbackBatch: true })
    if (res.text.trim() && res.text.trim() !== probe) return true
  } catch {
    /* tenta servidor */
  }

  try {
    const { data, error } = await supabase.functions.invoke('translate-integral-texto', {
      body: { texto: probe, idioma_origem: from },
    })
    if (!error && data?.texto_pt && data.texto_pt.trim() !== probe) return true
  } catch {
    /* ignore */
  }

  const apiKey = import.meta.env.VITE_LIBRETRANSLATE_API_KEY?.trim()
  if (apiKey) {
    const base = (import.meta.env.VITE_LIBRETRANSLATE_URL ?? 'https://libretranslate.com').replace(/\/$/, '')
    try {
      const res = await fetch(`${base}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: probe,
          source: from,
          target: 'pt',
          format: 'text',
          api_key: apiKey,
        }),
      })
      if (res.ok) {
        const json = (await res.json()) as { translatedText?: string }
        if (json.translatedText?.trim() && json.translatedText.trim() !== probe) return true
      }
    } catch {
      /* ignore */
    }
  }

  return false
}

export const MSG_TRADUTOR_INDISPONIVEL =
  'Não foi possível traduzir agora (limite ou bloqueio dos motores gratuitos).'

export const DETALHE_TRADUTOR_INDISPONIVEL = [
  'Capítulos que já estão em português continuam salvos.',
  'Use «Traduzir obra para português» no formulário do livro (não precisa importar o link de novo).',
  'Espere 15–30 minutos e tente outra vez, ou use PDF/.txt em português (Domínio Público).',
  'Para obras grandes: chave grátis em portal.libretranslate.com → VITE_LIBRETRANSLATE_API_KEY no .env → reinicie o web.',
  'Se ainda falhar: pnpm exec supabase functions deploy translate-integral-texto (ajuda o fallback no servidor).',
].join(' ')