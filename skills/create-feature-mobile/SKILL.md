---
name: create-feature-mobile
description: Implementa feature no app mobile do tcc-sistema (React Native, Expo, Expo Router, NativeWind). Use ao criar telas ou fluxos do aluno em apps/mobile/.
---

# Criar Feature Mobile — tcc-sistema

## Pré-requisitos

1. RF correspondente em `docs/requirements.md`
2. Fluxo em `docs/user-flows.md`
3. Paridade funcional com web (área aluno) quando aplicável (RNF09)

## Workflow

```
- [ ] Definir rota Expo Router em app/(aluno)/
- [ ] Reutilizar schema Zod de packages/schemas
- [ ] Reutilizar tipos de packages/types
- [ ] Hook TanStack Query (mesma queryKey que web quando possível)
- [ ] UI com NativeWind + Lucide React Native
- [ ] Sessão via expo-secure-store
```

## Estrutura sugerida

```
apps/mobile/
├── app/(aluno)/conteudos/[id].tsx
├── features/conteudos/
│   ├── components/ConteudoDetail.tsx
│   └── hooks/useConteudo.ts
```

## Padrões

```tsx
// Rota Expo Router
// app/(aluno)/conteudos/index.tsx
export default function ConteudosScreen() {
  const { data, isLoading } = useConteudos(filters);
  // ...
}

// Estilo NativeWind
<View className="flex-1 bg-background p-4">
  <Text className="text-lg font-semibold text-foreground">{titulo}</Text>
</View>
```

## UI Mobile

- NativeWind (classes Tailwind-like)
- expo-image para capas
- Linguagem simples, ícones de apoio (RNF11)
- Legibilidade prioritária (RNF10)
- Consistência visual com web (RNF09)

## Público

App exclusivo para **Aluno**. Professor/Admin usam web.

## Checklist

- [ ] Auth guard na layout `(aluno)`
- [ ] Schemas compartilhados com web
- [ ] Loading/error states
- [ ] Imagens via expo-image
- [ ] Tokens em expo-secure-store
