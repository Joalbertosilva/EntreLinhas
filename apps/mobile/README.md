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

Use **Expo Go 58.x** (Settings → Supported SDK **58**) no celular/emulador. Se o projeto foi atualizado da semana passada e o app “não entra”, a causa mais comum é **Expo Go antigo (SDK 57)** — atualize na loja.

### “Falha” ou barra de progresso infinita no Expo Go

1. Pare o Metro e rode: `pnpm mobile:dev` (ou `pnpm mobile:dev -- --clear` se mudou dependência)
2. **Expo Go SDK 58** na loja — SDK 50/57 não abre este projeto
3. Mesma conta no **CLI** (`pnpm mobile:login` + `pnpm mobile:whoami`) e no **Expo Go**
4. **«The request timed out»** no Expo Go: o celular abriu **antes** do Metro terminar o bundle. Rode `pnpm mobile:dev:fresh` e espere no terminal **`AGORA pode abrir no Expo Go`**.
5. **Lista vazia no Expo Go (Linux):** Home → **Enter URL** → `exp://SEU_IP:8081` (o IP sai no terminal). Ignore atalho antigo com timeout
6. **Request timed out:** isolamento Wi‑Fi no roteador → `pnpm mobile:dev:tunnel`
7. **UFW:** `sudo ufw allow 8081/tcp` e `sudo ufw allow 19000:19002/tcp`
8. Sessão Supabase: `apps/mobile/.env` = mesmos valores do web
9. Metro pesado: `METRO_MAX_WORKERS=1 pnpm mobile:dev`

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

- **`icon` / `ios.icon`:** `./assets/icon.png` (cópia do manifest 1024×1024, fundo **`#f8fbfe`**). O **ícone** vem de URL no manifest — o cliente cacheia. Ao trocar o gráfico: suba `version` no `app.json` e `pnpm mobile:dev -- --clear`.

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

**Dependências:** na raiz use `pnpm exec expo install --check` (não `npx expo` solto na raiz — avisos de npmrc são inofensivos). O aviso «expo 58.0.19 → 58.1.0» é opcional; não é a causa do erro de conexão.

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
