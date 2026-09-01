# Comandos de desenvolvimento — tcc-sistema

Guia prático: o que instalar, como rodar e como testar.

---

## O que é pnpm?

**pnpm** (performant npm) é o **gerenciador de pacotes** do projeto — equivalente ao npm ou yarn, porém:

| Característica | Benefício |
|--------------|-----------|
| Mais rápido | Instala dependências em cache compartilhado |
| Menos disco | Não duplica pacotes entre projetos |
| Workspaces | Gerencia monorepo (`apps/` + `packages/`) num único lugar |
| Compatível | Usa o mesmo `package.json` que npm |

### Comandos pnpm vs npm

| npm | pnpm | O que faz |
|-----|------|-----------|
| `npm install` | `pnpm install` | Instala dependências |
| `npm run dev` | `pnpm dev` | Roda script `dev` |
| `npm install zod` | `pnpm add zod` | Adiciona pacote |
| `npm install -D vitest` | `pnpm add -D vitest` | Adiciona dev dependency |
| — | `pnpm --filter web dev` | Roda script só no app `web` |

### Instalar pnpm

```bash
# Opção 1 — via npm (se já tiver Node)
npm install -g pnpm

# Opção 2 — via script oficial
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Verificar
pnpm --version
```

---

## Pré-requisitos (instalar uma vez)

```bash
# 1. Docker Desktop ou Docker Engine
docker --version
docker compose version

# 2. Node.js 20+ (recomendado LTS)
node --version

# 3. pnpm
pnpm --version

# 4. Supabase CLI
npm install -g supabase
# ou: pnpm add -g supabase
supabase --version
```

---

## Ordem de trabalho do projeto

```
Fase 1: Backend  →  Fase 2: Web  →  Fase 3: Mobile
```

Sempre subir o **backend antes** de testar web ou mobile.

---

## Fase 1 — Backend

### Primeira vez

```bash
cd /home/joao/Documentos/Projeto-tcc/tcc-sistema

# Verificar Docker
docker info

# Instalar dependências do monorepo (quando package.json existir)
pnpm install

# Inicializar Supabase (primeira vez)
supabase init

# Subir containers Docker (PostgreSQL, Auth, Storage, Studio...)
supabase start

# Ver URLs, portas e keys
supabase status

# Aplicar migrations
supabase db reset
```

### Dia a dia (backend)

```bash
cd /home/joao/Documentos/Projeto-tcc/tcc-sistema

docker info                    # Docker rodando?
supabase start                 # Se não estiver up
supabase status                # Keys e portas
supabase db reset              # Recriar banco + migrations
supabase functions serve       # Edge Functions locais
supabase stop                  # Parar ao encerrar
```

### Testar backend manualmente

| Ferramenta | URL / Comando | Uso |
|------------|---------------|-----|
| **Supabase Studio** | http://127.0.0.1:54323 | Ver tabelas, dados, auth, storage |
| **API** | http://127.0.0.1:54321 | REST/GraphQL |
| **Adminer** | http://localhost:8080 | SQL direto no PostgreSQL |
| **Logs** | `supabase logs` | Debug de containers |

```bash
# Adminer (opcional)
docker compose --profile tools up -d
# Login Adminer: servidor host.docker.internal, porta 54322, user postgres
```

### Testar RLS e auth

1. Criar usuários de teste (admin, professor, aluno) via Edge Function ou Studio
2. No Studio → Authentication → ver usuários
3. No Studio → Table Editor → tentar queries com diferentes roles
4. Testar login via API ou app quando web estiver pronta

### Nova migration

```bash
supabase migration new nome_da_migration
# Editar arquivo em supabase/migrations/
supabase db reset                # Aplica tudo do zero (dev)
# ou
supabase migration up            # Aplica só pendentes
```

---

## Fase 2 — Web

> Só iniciar quando backend (Fase 1) estiver funcional.

### Primeira vez

```bash
cd /home/joao/Documentos/Projeto-tcc/tcc-sistema

# Backend deve estar rodando
supabase start

# Copiar variáveis de ambiente
cp .env.example apps/web/.env.local
# Preencher VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
# (valores de: supabase status)

pnpm install
pnpm --filter web dev
```

### Dia a dia (web)

```bash
cd /home/joao/Documentos/Projeto-tcc/tcc-sistema

supabase start                 # Terminal 1 — backend
pnpm --filter web dev          # Terminal 2 — frontend web
```

Acesse: **http://localhost:5173** (porta padrão Vite; pode variar)

### Testar a web

#### 1. Teste manual (navegador)

Fluxo sugerido após implementar cada RF:

| Passo | O que testar |
|-------|--------------|
| Login | Nome de usuário + senha; perfil correto redireciona |
| Admin | Criar usuário, listar, ativar/desativar |
| Professor | CRUD conteúdos, temas, materiais |
| Aluno | Buscar conteúdo, interagir, marcar leitura, produções |
| Logout | Sessão encerrada |

#### 2. Testes automatizados (Vitest + RTL)

```bash
# Rodar todos os testes
pnpm --filter web test

# Modo watch (re-roda ao salvar)
pnpm --filter web test:watch

# Com coverage
pnpm --filter web test:coverage
```

O que testar com Vitest:
- Schemas Zod (`packages/schemas`)
- Hooks e funções utilitárias
- Componentes web (React Testing Library)

#### 3. Lint e formatação

```bash
pnpm --filter web lint
pnpm --filter web format
```

#### 4. Build de produção (validar que compila)

```bash
pnpm --filter web build
pnpm --filter web preview    # Preview do build
```

### Variáveis de ambiente (web)

Arquivo: `apps/web/.env.local`

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<copiar de supabase status>
```

---

## Fase 3 — Mobile

> Só iniciar quando web (Fase 2) estiver funcional para o aluno.

### Primeira vez

```bash
cd /home/joao/Documentos/Projeto-tcc/tcc-sistema

supabase start

cp .env.example apps/mobile/.env
# Preencher EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY

pnpm install
pnpm --filter mobile start
```

### Dia a dia (mobile)

```bash
supabase start                 # Terminal 1
pnpm --filter mobile start     # Terminal 2 — Expo Dev Tools
```

Escaneie QR code no Expo Go (Android/iOS) ou pressione `a` (Android emulator) / `i` (iOS simulator).

### Testar mobile

```bash
# Testes automatizados
pnpm --filter mobile test
pnpm --filter mobile test:watch
```

Teste manual: mesmo fluxo do aluno na web (login, conteúdos, interações, produções).

---

## Comandos do monorepo (raiz)

Quando `package.json` raiz existir:

```bash
pnpm install                   # Instala tudo (apps + packages)
pnpm dev                       # Roda dev de todos (se configurado)
pnpm --filter web dev          # Só web
pnpm --filter mobile start     # Só mobile
pnpm test                      # Testes de todo o monorepo
pnpm lint                      # Lint geral
pnpm build                     # Build geral
```

---

## Docker — referência rápida

```bash
docker info                              # Docker OK?
supabase start                           # Backend up
supabase stop                            # Backend down
docker compose --profile tools up -d     # Adminer
docker compose --profile tools down      # Para Adminer
docker ps                                # Containers rodando
```

Detalhes: [docs/docker.md](./docker.md)

---

## Checklist antes de testar a web

```
[ ] Docker rodando (docker info)
[ ] supabase start — serviços healthy
[ ] supabase db reset — migrations aplicadas
[ ] .env.local configurado em apps/web
[ ] pnpm install concluído
[ ] pnpm --filter web dev — sem erros
[ ] Login funciona com usuário de teste
```

---

## Dependências corrompidas (`node_modules`)

Se aparecer erro como:

```text
ENOENT: no such file or directory, open '.../tailwindcss/index.css'
```

significa que a instalação do pnpm ficou **incompleta** (interrupção, remoção parcial da pasta, ou terminal não interativo).

```bash
# Verificar
pnpm deps:verify

# Corrigir (reinstala tudo)
pnpm deps:fix
```

O projeto agora valida dependências automaticamente antes de `pnpm web:dev` e `pnpm web:build`.

---

| Serviço | Porta |
|---------|-------|
| Supabase API | 54321 |
| PostgreSQL | 54322 |
| Supabase Studio | 54323 |
| Inbucket (email dev) | 54324 |
| Web (Vite) | 5173 |
| Adminer | 8080 |
| Expo DevTools | 8081 |

---

## Onde registrar progresso

Atualize `session/current.md` ao concluir cada fase ou decisão importante.

---

## Troubleshooting rápido

| Problema | Solução |
|----------|---------|
| `ENOENT ... tailwindcss/index.css` | `node_modules` corrompido — rode `pnpm deps:fix` |
| `Cannot connect to Docker` | Abrir Docker Desktop |
| Web não conecta ao Supabase | Verificar `.env.local` e `supabase status` |
| `pnpm: command not found` | `npm install -g pnpm` |
| Porta 5173 em uso | Vite usa outra porta automaticamente — ver terminal |
| Migration falhou | `supabase db reset`, ler erro no terminal |
| CORS / auth error | Verificar anon key e URL |
