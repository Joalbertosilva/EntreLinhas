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
      callerProfile.perfil !== "administrador" ||
      !callerProfile.status
    ) {
      return new Response(JSON.stringify({ error: "Operação não permitida" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { nome, nome_usuario, senha, perfil } = body;

    if (!nome || !nome_usuario || !senha || !perfil) {
      return new Response(JSON.stringify({ error: "Dados inválidos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!["aluno", "professor", "administrador"].includes(perfil)) {
      return new Response(JSON.stringify({ error: "Perfil inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = authEmail(nome_usuario);

    const { data: newUser, error: createError } =
      await adminClient.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true,
        user_metadata: { nome_usuario: nome_usuario.toLowerCase(), nome },
      });

    if (createError || !newUser.user) {
      return new Response(
        JSON.stringify({ error: "Não foi possível criar o usuário" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { error: insertError } = await adminClient.from("profiles").insert({
      id: newUser.user.id,
      nome,
      nome_usuario: nome_usuario.toLowerCase(),
      perfil,
      status: true,
      deve_trocar_senha: true,
    });

    if (insertError) {
      await adminClient.auth.admin.deleteUser(newUser.user.id);
      return new Response(
        JSON.stringify({ error: "Não foi possível criar o perfil" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    await adminClient.from("audit_logs").insert({
      usuario_id: user.id,
      acao: "criar_usuario",
      entidade: "profiles",
      entidade_id: newUser.user.id,
      detalhes: { nome_usuario: nome_usuario.toLowerCase(), perfil },
    });

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: newUser.user.id,
          nome,
          nome_usuario: nome_usuario.toLowerCase(),
          perfil,
        },
      }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch {
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
