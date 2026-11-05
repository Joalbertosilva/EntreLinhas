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

No SDK 58, **`pnpm mobile:dev` usa só `--offline`** (já inclui LAN; não combine `--offline` com `--lan`). Isso assina o manifesto localmente e evita `HTTP 500 UnexpectedServerError` da API Expo. Login só é obrigatório para **tunnel**:
```bash
pnpm mobile:dev              # LAN + offline (recomendado)
pnpm mobile:dev -- --clear     # limpa cache do Metro se travar
pnpm mobile:dev:tunnel         # outra Wi‑Fi — exige pnpm mobile:login
```
Se o PC avisar **memória cheia**, feche Chrome/VS Code extras antes de abrir no iPhone (o bundle iOS usa ~15 MB e pico de RAM).

### Erro “Project uses SDK 57 / Expo Go is SDK 58” (iPhone)

No **iOS não dá para instalar Expo Go antigo** — só a versão da App Store (hoje SDK 58). O projeto precisa estar em **SDK 58** também (`expo ~58` no `package.json`). Depois de atualizar: `pnpm install` na raiz e `pnpm mobile:dev`.

## Fluxo inicial

1. Splash animado com logo
2. Login (mesmo usuário/senha da web)
3. Abas inferiores: Início · Explorar · Leituras · Perfil

Professores/administradores são redirecionados para aviso de uso web.
