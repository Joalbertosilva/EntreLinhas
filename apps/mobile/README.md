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

### Ícone / splash corretos em qualquer celular (iOS e Android)

O **Expo Go** **não garante** que o `icon` do `app.json` apareça na tela branca de carregamento — o nome atualiza, o ícone depende de manifest + cache do cliente. Para comportamento **igual a app de loja** em **todos** os dispositivos, use **build nativo**:

```bash
# Na raiz
pnpm mobile:run:ios       # macOS + Xcode
pnpm mobile:run:android   # Android Studio / dispositivo
```

Detalhes: [`docs/mobile-dev-build.md`](../../docs/mobile-dev-build.md).

### Splash / abertura

- **Expo Go (tela “EntreLinhas” + %):** some **assim que o JS monta** a rota `/` — chamamos `hideNativeSplashOnce` em `app/index.tsx`. O **desenho ao lado do nome** vem do manifesto (`icon` / `ios.icon`) — não é `splash.image`.

- **`AnimatedSplash`:** fica visível **no mínimo 3 s** após montar `/` (`MIN_ANIMATED_SPLASH_VISIBLE_MS` em `app/index.tsx`). A **marca + textos** somem rápido na transição; o livro segue um instante.

- **`icon` / `ios.icon`:** `./assets/images/app-icon-manifest.png` — **ícone do app** (mesmo desenho do `favicon.png`), em **1024×1024** com fundo **`#f8fbfe`** para não “sumir” em tela branca (o PNG puro tem muita transparência). O nome no `app.json` muda na hora porque é texto; o **ícone** vem de **URL no manifest** — o cliente pode **cachear** por nome de arquivo. Ao trocar o gráfico, use **nome de arquivo novo** + subir `version` e `pnpm mobile:dev -- --clear`.

**Se no iOS o ícone não mudar:** feche o Expo Go (app switcher), reabra o projeto; em último caso reinstale o Expo Go. Para garantia total do ícone/splash: **`npx expo run:ios`** (dev build).
- **`splash` + plugin `expo-splash-screen`:** logo horizontal + fundo **`#f8fbfe`** — usado em **build nativo** (dev/production). O Expo Go **não** aplica essa splash completa.
- **Animação:** rota inicial `app/index.tsx` → **`AnimatedSplash`** (após fontes carregarem em `_layout.tsx`).

No **Expo Go**, a faixa **“Loading …%”** é do cliente. O ícone vem do manifesto; depois do bundle: **`hideNativeSplashOnce`** (em `AnimatedSplash`) e a animação.

Se você trocou `icon` para um PNG com **fundo preto** (ex.: cópia do splash), o desenho some em fundo branco — parece “só o nome”. Prefira o `favicon.png` ou um quadrado com **fundo claro** e margem.

**Depois de mudar `icon`:** subimos **`version`** no `app.json` para forçar manifest novo. Pare o Metro, rode `pnpm mobile:dev -- --clear`, feche o **Expo Go** por completo (remova dos apps recentes) e abra de novo — o cliente costuma cachear o ícone.

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
