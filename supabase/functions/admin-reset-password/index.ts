import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function authEmail(nomeUsuario: string): string {
  return `${nomeUsuario.toLowerCase()}@tcc-sistema.internal`;
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

    const { data: callerProfile, error: profileError } = await adminClient
      .from("profiles")
      .select("perfil, status")
      .eq("id", user.id)
      .single();

    if (
      profileError ||
      !callerProfile ||
      !callerProfile.status ||
      !["administrador", "professor"].includes(callerProfile.perfil)
    ) {
      return new Response(JSON.stringify({ error: "Operação não permitida" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { request_id, senha_temporaria } = body;

    if (!request_id || !senha_temporaria || String(senha_temporaria).length < 8) {
      return new Response(JSON.stringify({ error: "Dados inválidos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: request, error: requestError } = await adminClient
      .from("password_reset_requests")
      .select("id, profile_id, nome_usuario, status")
      .eq("id", request_id)
      .single();

    if (requestError || !request || request.status !== "pendente") {
      return new Response(JSON.stringify({ error: "Pedido não encontrado ou já atendido" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: targetProfile, error: targetError } = await adminClient
      .from("profiles")
      .select("id, nome, nome_usuario, perfil, status")
      .eq("id", request.profile_id)
      .single();

    if (targetError || !targetProfile || !targetProfile.status) {
      return new Response(JSON.stringify({ error: "Usuário inativo ou não encontrado" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (
      targetProfile.perfil !== "aluno" &&
      callerProfile.perfil !== "administrador"
    ) {
      return new Response(
        JSON.stringify({ error: "Apenas administradores podem redefinir senha de staff" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { error: updateAuthError } = await adminClient.auth.admin.updateUserById(
      targetProfile.id,
      { password: String(senha_temporaria) },
    );

    if (updateAuthError) {
      return new Response(JSON.stringify({ error: "Não foi possível redefinir a senha" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await adminClient
      .from("profiles")
      .update({ deve_trocar_senha: true })
      .eq("id", targetProfile.id);

    const now = new Date().toISOString();

    await adminClient
      .from("password_reset_requests")
      .update({
        status: "atendido",
        atendido_por: user.id,
        atendido_em: now,
      })
      .eq("id", request_id);

    await adminClient.from("audit_logs").insert({
      usuario_id: user.id,
      acao: "redefinir_senha_requerimento",
      entidade: "password_reset_requests",
      entidade_id: request_id,
      detalhes: {
        profile_id: targetProfile.id,
        nome_usuario: targetProfile.nome_usuario,
        email_interno: authEmail(targetProfile.nome_usuario),
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        nome: targetProfile.nome,
        nome_usuario: targetProfile.nome_usuario,
        senha_temporaria: String(senha_temporaria),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch {
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
