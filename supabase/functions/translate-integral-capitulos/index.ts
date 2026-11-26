import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  type CapituloParsed,
  translateCapitulosToPt,
} from "../_shared/machineTranslatePt.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

    const { data: profile } = await userClient
      .from("profiles")
      .select("perfil, status")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.status || !["professor", "administrador"].includes(profile.perfil)) {
      return new Response(JSON.stringify({ error: "Sem permissão para traduzir." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const conteudoId = body?.conteudo_id as string | undefined;
    const idiomaOrigem = (body?.idioma_origem as string | undefined) ?? "auto";
    if (!conteudoId) {
      return new Response(JSON.stringify({ error: "conteudo_id é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const ordemInicio = Number(body?.ordem_inicio) || 0;
    const ordemFim = Number(body?.ordem_fim) || 0;

    const { data: allRows, error: readError } = await admin
      .from("conteudo_capitulos_integral")
      .select("id, ordem, titulo, texto_pt, texto_origem")
      .eq("conteudo_id", conteudoId)
      .order("ordem", { ascending: true });

    if (readError) throw readError;
    let rows = allRows ?? [];
    if (ordemInicio > 0 && ordemFim >= ordemInicio) {
      rows = rows.filter((r) => r.ordem >= ordemInicio && r.ordem <= ordemFim);
    }
    if (!rows?.length) {
      return new Response(JSON.stringify({ error: "Nenhum capítulo para traduzir." }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const caps: CapituloParsed[] = rows.map((r) => ({
      ordem: r.ordem,
      titulo: r.titulo,
      texto_pt: r.texto_pt,
      texto_origem: r.texto_origem,
    }));

    const traduzidos = await translateCapitulosToPt(caps, idiomaOrigem);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]!;
      const tr = traduzidos[i]!;
      const { error: upError } = await admin
        .from("conteudo_capitulos_integral")
        .update({
          titulo: tr.titulo,
          texto_pt: tr.texto_pt,
          texto_origem: tr.texto_origem,
        })
        .eq("id", row.id);
      if (upError) throw upError;
    }

    await admin
      .from("conteudos")
      .update({
        integral_traducao_metodo: "preimportado",
        integral_traducao_credito: "EntreLinhas (tradução automática)",
      })
      .eq("id", conteudoId);

    return new Response(
      JSON.stringify({ ok: true, capitulos: traduzidos.length, idioma: "pt" }),
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