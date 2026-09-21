import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

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
    const body = await req.json();
    const nomeUsuario = String(body?.nome_usuario ?? "").trim().toLowerCase();

    if (!nomeUsuario || nomeUsuario.length < 3) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: profile } = await adminClient
      .from("profiles")
      .select("id, nome_usuario, status")
      .eq("nome_usuario", nomeUsuario)
      .maybeSingle();

    if (profile?.status) {
      const { data: pending } = await adminClient
        .from("password_reset_requests")
        .select("id")
        .eq("profile_id", profile.id)
        .eq("status", "pendente")
        .maybeSingle();

      if (!pending) {
        const { data: created } = await adminClient
          .from("password_reset_requests")
          .insert({
            profile_id: profile.id,
            nome_usuario: profile.nome_usuario,
            status: "pendente",
          })
          .select("id")
          .single();

        if (created?.id) {
          await adminClient.from("audit_logs").insert({
            usuario_id: null,
            acao: "senha.solicitacao",
            entidade: "password_reset_requests",
            entidade_id: created.id,
            detalhes: {
              profile_id: profile.id,
              nome_usuario: profile.nome_usuario,
              origem: "esqueci_senha",
            },
          });
        }
      }
    }

    // Resposta sempre genérica — não revela se o usuário existe
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
