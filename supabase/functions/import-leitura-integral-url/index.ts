import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { baixarObraIntegralRaw, isAllowedIntegralUrl } from "../_shared/fetchIntegralObra.ts";
import {
  type CapituloParsed,
  integralImportPareceDegradado,
  isMislabeledPdfAsText,
  parseIntegralFromUrlContent,
  parseIntegralTextoBruto,
} from "../_shared/parseIntegralImport.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_HOSTS = [
  "gutenberg.net.au",
  "www.gutenberg.net.au",
  "gutenberg.org",
  "www.gutenberg.org",
  "dominiopublico.gov.br",
  "www.dominiopublico.gov.br",
  "dominiopublico.mec.gov.br",
  "machado.mec.gov.br",
  "wikisource.org",
  "pt.wikisource.org",
  "it.wikisource.org",
  "archive.org",
  "www.archive.org",
  "cervantesvirtual.com",
  "www.cervantesvirtual.com",
];

const MAX_TEXTO_BRUTO_CHARS = 1_500_000;

function isAllowedUrl(raw: string): URL | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    const host = url.hostname.toLowerCase();
    if (!ALLOWED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) return null;
    return url;
  } catch {
    return null;
  }
}

function isPlainTextUrl(url: URL): boolean {
  const path = url.pathname.toLowerCase();
  return path.endsWith(".txt") || path.endsWith(".txt.utf-8");
}

function isPdfUrl(url: URL): boolean {
  return url.pathname.toLowerCase().endsWith(".pdf");
}

function guessIdioma(host: string, capitulos: CapituloParsed[]): string {
  if (host.includes("dominiopublico") || host.includes("cervantesvirtual") || host.includes("machado.mec")) {
    return "pt";
  }
  const amostra = capitulos
    .slice(0, 3)
    .map((c) => c.texto_pt)
    .join(" ")
    .slice(0, 2000);
  if (/[àâçéèêëîïôûù]/i.test(amostra) && !/\b(the|and|chapter)\b/i.test(amostra)) return "fr";
  if (/\b(capitulo|não|também|porque)\b/i.test(amostra)) return "pt";
  if (/\b(the|and|chapter)\b/i.test(amostra)) return "en";
  return "origem";
}

function avisoIdioma(idioma: string, traduzidoAuto = false): string | null {
  if (idioma === "pt" && traduzidoAuto) {
    return "Tradução automática para português concluída. Revise antes do aluno ler — pode haver imprecisões (como no Tradutor do Google).";
  }
  if (idioma === "pt") {
    return "Texto importado em português. Revise capítulos e créditos antes de publicar.";
  }
  if (idioma === "fr") {
    return "Texto em francês (original em domínio público). Para português, envie um arquivo .txt em PT baixado do Domínio Público ou outra fonte legal.";
  }
  if (idioma === "en") {
    return "Texto em inglês (original em domínio público). Para português, use obra já traduzida em domínio público ou arquivo .txt em PT.";
  }
  return "Confira o idioma e a revisão dos capítulos antes de o aluno acessar.";
}

async function persistCapitulos(
  adminClient: ReturnType<typeof createClient>,
  conteudoId: string,
  fonteUrl: string,
  capitulos: CapituloParsed[],
  idioma: string,
  traduzidoAuto = false,
): Promise<{ capitulos: number; idioma: string; aviso: string | null; traduzido_automaticamente?: boolean }> {
  await adminClient.from("conteudo_capitulos_integral").delete().eq("conteudo_id", conteudoId);

  const rows = capitulos.map((c) => ({
    conteudo_id: conteudoId,
    ordem: c.ordem,
    titulo: c.titulo,
    texto_pt: c.texto_pt,
    texto_origem: c.texto_origem,
  }));

  const { error: insError } = await adminClient.from("conteudo_capitulos_integral").insert(rows);
  if (insError) throw insError;

  const metodo = traduzidoAuto
    ? "preimportado"
    : idioma === "pt"
      ? "pt_nativo"
      : "preimportado";

  await adminClient
    .from("conteudos")
    .update({
      integral_fonte_url: fonteUrl.trim(),
      integral_traducao_metodo: metodo,
      integral_traducao_credito: traduzidoAuto
        ? "EntreLinhas (tradução automática)"
        : idioma === "pt"
          ? "Domínio público / importação automática"
          : `Original (${idioma.toUpperCase()}) — domínio público`,
    })
    .eq("id", conteudoId);

  return {
    capitulos: rows.length,
    idioma,
    aviso: avisoIdioma(idioma, traduzidoAuto),
    traduzido_automaticamente: traduzidoAuto || undefined,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: callerProfile, error: profileError } = await userClient
      .from("profiles")
      .select("perfil, status")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !callerProfile) {
      return new Response(
        JSON.stringify({
          error:
            "Não foi possível confirmar seu perfil. Saia e entre de novo; se continuar, fale com o administrador.",
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!callerProfile.status) {
      return new Response(JSON.stringify({ error: "Sua conta está inativa." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!["professor", "administrador"].includes(callerProfile.perfil)) {
      return new Response(
        JSON.stringify({
          error: "Somente professor ou administrador pode importar a leitura integral.",
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json();
    const conteudoId = body?.conteudo_id as string | undefined;
    const fonteUrl = (body?.fonte_url as string | undefined)?.trim() ?? "";
    const textoBruto = body?.texto_bruto as string | undefined;
    const traduzirParaPt = body?.traduzir_para_pt !== false;
    const somenteBaixar = body?.somente_baixar === true;

    if (somenteBaixar) {
      if (!fonteUrl) {
        return new Response(JSON.stringify({ error: "fonte_url é obrigatória para baixar o link" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      try {
        const baixado = await baixarObraIntegralRaw(fonteUrl);
        if (baixado.texto.length > MAX_TEXTO_BRUTO_CHARS) {
          return new Response(JSON.stringify({ error: "Obra grande demais para importar por link." }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        return new Response(
          JSON.stringify({ ok: true, ...baixado, texto_bruto: baixado.texto }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      } catch (e) {
        const message = e instanceof Error ? e.message : "Falha ao baixar o link";
        return new Response(JSON.stringify({ error: message }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (!conteudoId) {
      return new Response(JSON.stringify({ error: "conteudo_id é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!fonteUrl && !textoBruto?.trim()) {
      return new Response(JSON.stringify({ error: "Informe o link da obra ou envie um arquivo de texto" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let capitulos: CapituloParsed[] | null = null;
    let idioma = "desconhecido";
    let fonteGravada = fonteUrl || "arquivo:texto";

    if (textoBruto?.trim()) {
      if (textoBruto.length > MAX_TEXTO_BRUTO_CHARS) {
        return new Response(JSON.stringify({ error: "Arquivo de texto grande demais para importar." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (isMislabeledPdfAsText(textoBruto)) {
        return new Response(
          JSON.stringify({
            error:
              "Esse arquivo é PDF disfarçado de .txt (código %PDF). Não renomeie nem “converta” assim — envie o .pdf original; o EntreLinhas extrai o texto no navegador.",
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      capitulos = parseIntegralTextoBruto(
        textoBruto,
        fonteUrl,
        "Arquivo de texto enviado pelo professor",
      );
      let fonteHost = "local";
      if (fonteUrl) {
        try {
          fonteHost = new URL(fonteUrl).hostname;
        } catch {
          fonteHost = "local";
        }
      }
      idioma = guessIdioma(fonteHost, capitulos);
    } else {
      const url = isAllowedIntegralUrl(fonteUrl);
      if (!url) {
        return new Response(
          JSON.stringify({
            error:
              "URL não permitida. Use gutenberg.net.au, Cervantes, dominiopublico (MEC), wikisource ou archive.org.",
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      if (isPdfUrl(url)) {
        return new Response(
          JSON.stringify({
            error:
              "Link de PDF não é importado pelo servidor. Baixe o PDF e use Enviar arquivo (.txt ou PDF) — o texto é extraído no navegador.",
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      try {
        const baixado = await baixarObraIntegralRaw(fonteUrl);
        fonteGravada = baixado.fonte_url_efetiva;
        capitulos = parseIntegralFromUrlContent(baixado.fonte_url_efetiva, baixado.texto);
        idioma = guessIdioma(new URL(baixado.fonte_url_efetiva).hostname, capitulos ?? []);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Falha ao baixar o link";
        return new Response(JSON.stringify({ error: message }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (!capitulos || capitulos.length === 0 || integralImportPareceDegradado(capitulos)) {
      return new Response(
        JSON.stringify({
          error:
            "Não foi possível dividir a obra em capítulos deste link. Use a página HTML completa (ex.: gutenberg.net.au/ebooks03/…h.html), o arquivo -h.htm do Gutenberg ou envie PDF/.txt.",
        }),
        { status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const idiomaDetectado = idioma;
    const result = await persistCapitulos(
      adminClient,
      conteudoId,
      fonteGravada,
      capitulos,
      idioma,
      false,
    );

  const precisaTraducaoCliente =
    traduzirParaPt && idiomaDetectado !== "pt";

    return new Response(
      JSON.stringify({
        ok: true,
        ...result,
        idioma_detectado: idiomaDetectado,
        traduzir_no_cliente: precisaTraducaoCliente,
        aviso: precisaTraducaoCliente
          ? "Capítulos importados. Traduzindo para português no navegador (não feche a aba)…"
          : result.aviso,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro interno";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});