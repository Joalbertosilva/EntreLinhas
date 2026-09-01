---
name: create-edge-function
description: Cria Supabase Edge Function para operações privilegiadas do tcc-sistema, como criação admin de usuários. Use ao implementar RF001, operações admin ou supabase/functions/.
---

# Criar Edge Function — tcc-sistema

## Quando usar

- Criação de usuários pelo Administrador (RF001) — **sem signup público**
- Operações que exigem service role key
- Validações que RLS/PostgREST não cobrem

## Workflow

```
- [ ] Identificar RF e permissão em docs/permissions.md
- [ ] Criar função em supabase/functions/<nome>/index.ts
- [ ] Validar JWT + perfil do caller
- [ ] Validar payload com Zod (packages/schemas)
- [ ] Executar operação com service role
- [ ] Registrar audit_logs (RS007)
- [ ] Retornar resposta segura (sem dados sensíveis)
```

## Template

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Unauthorized');

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Verificar perfil administrador em profiles
    // Validar body com Zod
    // Executar com service role client
    // Registrar audit_logs

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Operação não permitida' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

## Regras

- Service role key **somente** na Edge Function
- Validar perfil admin antes de criar usuários
- Mensagens de erro genéricas ao client
- Nunca logar senhas
- Registrar ação em audit_logs

## Deploy local

```bash
supabase functions serve create-user
supabase functions deploy create-user
```
