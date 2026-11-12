# Mobile — build nativo (ícone e splash “de verdade”)

## Por que o Expo Go não resolve “de uma vez”

O **Expo Go** é um app **genérico** da loja. Ele:

- Sempre mostra o **nome** do projeto a partir do manifest (por isso mudar `name` no `app.json` reflete na hora).
- Para o **desenho** ao lado do nome, depende de **URL do ícone no manifest**, **rede**, **cache agressivo** do próprio Expo Go e **implementação por plataforma**. Não é um ambiente de produção; a documentação oficial alerta que **splash/ícone customizados não são o foco do Go**.

**Conclusão:** não existe como garantir, em **qualquer celular**, que a tela de loading do **Expo Go** mostre exatamente o mesmo ícone que você colocou no `app.json`. Por isso parece que `icon` “não funciona” enquanto o nome funciona.

## Solução que vale para qualquer aparelho (iOS + Android)

Gerar um **binário nativo** do EntreLinhas (dev client ou release). Aí o sistema usa **o ícone e a splash** definidos em `apps/mobile/app.json` (e no plugin `expo-splash-screen`) — **comportamento igual a um app da loja**.

### Requisitos

- **iOS:** macOS com **Xcode** + simulador ou iPhone com cabo/USB (ou rede configurada para deploy).
- **Android:** **Android Studio** + SDK / emulador ou dispositivo com depuração USB.

### Primeira vez (na raiz do monorepo)

```bash
cd apps/mobile
pnpm install   # se ainda não rodou na raiz: na raiz, pnpm install
```

Copie o `.env` (mesmos `EXPO_PUBLIC_*` da web), depois:

**iOS**

```bash
cd apps/mobile
npx expo run:ios
```

**Android**

```bash
cd apps/mobile
npx expo run:android
```

O `run:*` aplica o `prebuild` quando necessário, gera `ios/` e `android/` e instala o app **EntreLinhas** no aparelho. A partir daí:

- O **ícone** na grade do sistema é o do projeto.
- A **splash nativa** segue `expo.splash` + plugin `expo-splash-screen`.
- Desenvolvimento: em outra aba, `pnpm mobile:dev` (Metro) e o app nativo recarrega o bundle (como de costume no Expo dev build).

### Scripts na raiz (atalho)

Na raiz do repositório:

```bash
pnpm mobile:run:ios
pnpm mobile:run:android
```

(definidos no `package.json` da raiz; chamam `expo run:*` no pacote `@tcc-sistema/mobile`.)

### Ícone e splash no projeto

| Onde | Uso |
|------|-----|
| `expo.icon` / `ios.icon` | Ícone do app (launcher / manifest nativo) |
| `expo.splash` + plugin `expo-splash-screen` | Launch screen antes do JS |
| `app/index.tsx` + `AnimatedSplash` | Animação depois que o JS carrega |

Depois de trocar assets em `app.json`, rode de novo `npx expo run:ios` ou `run:android` para incorporar a mudança no binário.

### E o Expo Go?

Continue usando **só** para testes rápidos de JS. Para **validar ícone + splash + impressão de app real**, use **sempre** o build nativo acima.
