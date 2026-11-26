import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  baixarObraIntegralRaw,
  MIN_OBRA_TEXTO_CHARS,
} from "../_shared/fetchIntegralObra.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MAX_TEXTO_BRUTO_CHARS = 1_500_000;

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

    const { data: callerProfile, error: profileError } = await userClient
      .from("profiles")
      .select("perfil, status")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !callerProfile?.status) {
      return new Response(JSON.stringify({ error: "Perfil inválido ou inativo." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!["professor", "administrador"].includes(callerProfile.perfil)) {
      return new Response(
        JSON.stringify({ error: "Somente professor ou administrador pode importar obras." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json();
    const fonteUrl = (body?.fonte_url as string | undefined)?.trim() ?? "";
    if (!fonteUrl) {
      return new Response(JSON.stringify({ error: "fonte_url é obrigatória" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const baixado = await baixarObraIntegralRaw(fonteUrl);
    if (baixado.texto.length > MAX_TEXTO_BRUTO_CHARS) {
      return new Response(JSON.stringify({ error: "Obra grande demais para importar por link." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (baixado.texto.length < MIN_OBRA_TEXTO_CHARS) {
      return new Response(
        JSON.stringify({
          error:
            `Texto baixado tem só ${baixado.texto.length} caracteres — não é a obra completa. Use gutenberg.net.au (…/ebooks…h.html) ou envie o .html/.pdf.`,
        }),
        { status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        texto_bruto: baixado.texto,
        fonte_url_efetiva: baixado.fonte_url_efetiva,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao baixar o link";
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});