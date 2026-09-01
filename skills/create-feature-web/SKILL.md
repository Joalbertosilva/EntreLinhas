---
name: create-feature-web
description: Implementa feature no frontend web do tcc-sistema (React, Vite, TanStack Router, shadcn/ui). Use ao criar telas, rotas ou componentes em apps/web/.
---

# Criar Feature Web — tcc-sistema

## Pré-requisitos

1. RF correspondente em `docs/requirements.md`
2. Permissões em `docs/permissions.md`
3. Fluxo em `docs/user-flows.md`
4. Entidades em `docs/database.md`

## Workflow

```
- [ ] Definir rota em TanStack Router (/_aluno, /_professor ou /_admin)
- [ ] Guard de auth + perfil
- [ ] Schema Zod em packages/schemas (se formulário)
- [ ] Tipos em packages/types
- [ ] Hook TanStack Query (queryKey + queryFn/mutationFn)
- [ ] Componentes com shadcn/ui + Tailwind
- [ ] Toast Sonner para feedback
- [ ] Mensagens de erro claras (RNF02)
```

## Estrutura sugerida

```
apps/web/src/
├── routes/_aluno/conteudos/index.tsx
├── features/conteudos/
│   ├── components/ConteudoCard.tsx
│   ├── hooks/useConteudos.ts
│   └── api/conteudos.api.ts
```

## Padrões

```tsx
// Rota protegida
export const Route = createFileRoute('/_aluno/conteudos/')({
  beforeLoad: ({ context }) => requireProfile(context, 'aluno'),
  component: ConteudosPage,
});

// Query
export function useConteudos(filters: ConteudoFilters) {
  return useQuery({
    queryKey: ['conteudos', filters],
    queryFn: () => supabase.from('conteudos').select('*').eq('status', true),
  });
}

// Form
const form = useForm({ resolver: zodResolver(conteudoSchema) });
```

## UI

- shadcn/ui: Button, Form, Input, Table, Dialog, Card
- TanStack Table para listagens admin
- Responsivo (RNF03)
- Lucide para ícones

## Checklist

- [ ] RLS cobre as queries (não bypass)
- [ ] Schema Zod compartilhado com mobile
- [ ] Loading e error states
- [ ] Acessibilidade básica (labels, contraste)
