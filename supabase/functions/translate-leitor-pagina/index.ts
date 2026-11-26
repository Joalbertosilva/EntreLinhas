import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { translateIntegralTextToPt } from "../_shared/machineTranslatePt.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MAX_CORPO = 48_000;

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

    const { data: profile } = await userClient
      .from("profiles")
      .select("perfil, status")
      .eq("id", user.id)
      .maybeSingle();

    const perfilOk =
      profile?.perfil && ["professor", "administrador", "aluno"].includes(profile.perfil);
    const statusOk = profile?.status == null || profile.status === "ativo";
    const podeTraduzir = perfilOk && statusOk;
    if (!podeTraduzir) {
      return new Response(JSON.stringify({ error: "Sem permissão." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const titulo = typeof body?.titulo === "string" ? body.titulo.trim() : "";
    const corpo = typeof body?.corpo === "string" ? body.corpo.trim() : "";
    const idioma = (body?.idioma_origem as string | undefined) ?? "auto";

    if (!titulo && !corpo) {
      return new Response(JSON.stringify({ error: "Nada para traduzir." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (corpo.length > MAX_CORPO) {
      return new Response(JSON.stringify({ error: "Trecho grande demais." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tituloPt = titulo ? await translateIntegralTextToPt(titulo, idioma) : "";
    const corpoPt = corpo ? await translateIntegralTextToPt(corpo, idioma) : "";

    return new Response(
      JSON.stringify({ titulo_pt: tituloPt, corpo_pt: corpoPt }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Falha na tradução";
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});