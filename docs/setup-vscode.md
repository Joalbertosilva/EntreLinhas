# Setup — primeira vez no VS Code

Siga estes passos **na pasta do projeto** no terminal integrado do VS Code (`Terminal > New Terminal`).

## 1. Pré-requisitos no sistema (instalar uma vez)

| Ferramenta | Como verificar | Como instalar |
|------------|----------------|---------------|
| **Node.js 20+** | `node --version` | https://nodejs.org |
| **pnpm** | `pnpm --version` | `npm install -g pnpm` |
| **Docker** | `docker info` | Docker Desktop |
| **Extensão Deno (VS Code)** | Ver Extensions | `denoland.vscode-deno` |

> **Erros vermelhos em `supabase/functions/`?** Esse código roda em **Deno**, não Node. Instale a extensão **Deno** no VS Code e recarregue a janela (`Ctrl+Shift+P` → "Reload Window"). Não é `pnpm install` — o código funciona mesmo com `pnpm functions:serve`.

## 2. Instalar dependências do projeto (obrigatório)

Na raiz do projeto:

```bash
cd /home/joao/Documentos/Projeto-tcc/tcc-sistema
pnpm install
```

Isso instala tudo: Supabase CLI, web app, packages compartilhados.

> Rode `pnpm install` de novo se clonou o repo ou aparecer erro de módulo não encontrado.

## 3. Subir o ambiente (cada sessão de trabalho)

**Terminal 1 — Backend:**
```bash
cd /home/joao/Documentos/Projeto-tcc/tcc-sistema
pnpm db:start
```

**Primeira vez (após `db:start`):** criar o usuário admin e configurar o web:

```bash
pnpm db:seed-admin
cp .env.example apps/web/.env.local
# Cole a ANON_KEY: pnpm exec supabase status -o env | grep ANON_KEY
```

**Terminal 2 — Gerenciador web:**
```bash
cd /home/joao/Documentos/Projeto-tcc/tcc-sistema
pnpm web:dev
```

**Terminal 3 — Só ao cadastrar usuários:**
```bash
cd /home/joao/Documentos/Projeto-tcc/tcc-sistema
pnpm functions:serve
```

## 4. Acessar

| O quê | URL |
|-------|-----|
| Gerenciador | http://localhost:5173 |
| Login | `admin` / `Admin@123456` |
| Studio (debug) | http://127.0.0.1:54323 |

## 5. Erros comuns

| Erro | Solução |
|------|---------|
| `pnpm: command not found` | `npm install -g pnpm` |
| `Cannot connect to Docker` | Abrir Docker Desktop |
| `Cannot find module ...` | `pnpm install` na raiz |
| `EADDRINUSE 5173` | Matar processo na porta ou Vite usa outra porta |
| Criar usuário falha | Rodar `pnpm functions:serve` |
| Erros em `supabase/functions/*.ts` | Instalar extensão **Deno** no VS Code e recarregar |
| Banco vazio após reset | `pnpm db:seed-admin` |

## 6. Recriar admin (se necessário)

```bash
pnpm db:seed-admin
```
