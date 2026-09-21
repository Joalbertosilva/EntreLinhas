# EntreLinhas — App Mobile

Aplicativo React Native + Expo para **alunos**.

## Stack

- Expo SDK **57** + Expo Router (compatível com Expo Go 57 no iPhone)
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

Use **Expo Go 57.x** (Settings → Supported SDK **57**) no celular/emulador.

Expo CLI e Expo Go precisam estar na **mesma conta**:
```bash
pnpm mobile:login    # login no PC (use conta do Expo Go)
pnpm mobile:whoami   # deve mostrar o mesmo usuário do iPhone
pnpm mobile:dev      # sobe Metro em LAN autenticado
```
Não use `npx expo login` na raiz — use `pnpm mobile:login` (Expo SDK 57 local).

## Fluxo inicial

1. Splash animado com logo
2. Login (mesmo usuário/senha da web)
3. Abas inferiores: Início · Explorar · Leituras · Perfil

Professores/administradores são redirecionados para aviso de uso web.
