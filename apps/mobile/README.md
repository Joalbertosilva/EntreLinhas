# EntreLinhas — App Mobile

Aplicativo React Native + Expo para **alunos**.

## Stack

- Expo SDK **58** + Expo Router (compatível com Expo Go 58 no iPhone — App Store)
- NativeWind (tokens alinhados ao web)
- Supabase Auth (`expo-secure-store`)
- TanStack Query + schemas compartilhados (`@tcc-sistema/schemas`)

## Configuração

```bash
cd apps/mobile
cp .env.example .env
# Cole os mesmos valores de apps/web/.env.local (nuvem)
```

## Rodar

Na raiz do monorepo:

```bash
pnpm mobile:dev
```

Ou dentro de `apps/mobile`:

```bash
pnpm start
```

Use **Expo Go 58.x** (Settings → Supported SDK **58**) no celular/emulador.

### Expo Go logado no celular (seu caso)

O CLI **já está logado** como a mesma conta (`pnpm mobile:whoami` → ex.: `137588`).

**Não use `--offline`**: esse modo assina o manifesto como *anônimo* e o Expo Go logado recusa (`not signed in to Expo CLI`).

```bash
pnpm mobile:dev              # LAN + conta (recomendado com Expo Go logado)
pnpm mobile:dev -- --clear   # limpa cache do Metro
pnpm mobile:dev:tunnel       # outra Wi‑Fi
```

Só se quiser abrir **sem conta no Expo Go** no iPhone:

```bash
pnpm mobile:dev:offline      # manifesto anônimo — saia da conta no app Expo Go
```

Login no CLI (se `whoami` falhar):

```bash
pnpm mobile:login    # na raiz — usa o Expo do monorepo, não `npx expo` solto
pnpm mobile:whoami
```

### Pasta `images/`

O Metro atende URLs `/images/...` em `apps/mobile/images/`. O script `mobile-start.mjs` cria um link para `assets/images/` automaticamente.

No celular físico, opcional: `EXPO_PUBLIC_WEB_URL=http://SEU_IP:5173` no `.env`.

Se o PC avisar **memória cheia**, feche Chrome/VS Code extras antes de abrir no iPhone (o bundle iOS usa ~15 MB e pico de RAM).

### Erro “Project uses SDK 57 / Expo Go is SDK 58” (iPhone)

No **iOS não dá para instalar Expo Go antigo** — só a versão da App Store (hoje SDK 58). O projeto precisa estar em **SDK 58** também (`expo ~58` no `package.json`). Depois de atualizar: `pnpm install` na raiz e `pnpm mobile:dev`.

## Fluxo inicial

1. Splash animado com logo
2. Login (mesmo usuário/senha da web)
3. Abas inferiores: Início · Explorar · Leituras · Pesquisa

Professores/administradores são redirecionados para aviso de uso web.
