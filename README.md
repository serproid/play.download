# Play Store

Plataforma para cada usuário criar e divulgar a página do seu app. Cada app tem uma URL própria (`dominio.com/nome-do-app`), isolada das demais, com painel administrativo para moderação.

## Stack

- **TanStack Start** (React 19 + Vite) com rotas file-based e server functions
- **Tailwind CSS v4** + **shadcn/ui**
- **Better Auth** (e-mail/senha + plugin admin)
- **Drizzle ORM** + **PostgreSQL (Supabase)**
- **Supabase Storage** para logos e arquivos
- Ícones **Lucide**

## Funcionalidades

- Página individual do app em `/{slug}` (ex.: `play.download/meu-app`)
- Link exclusivo com botão de copiar para o usuário divulgar
- Link e metadados de compartilhamento (Open Graph) por página
- Contas criadas pelo administrador (cadastro público desabilitado)
- Conta do usuário com upload, edição e status das páginas
- Publicação imediata da página após o envio
- Limite de apps: 10 para administradores e 5 para usuários
- Painel administrativo para editar, destacar ou remover páginas
- Upload autenticado de arquivos para o Supabase Storage
- Registro de downloads por usuário/app
- Tipografia nativa do sistema, sem requisições externas de fontes
- **Modo demonstração**: sem `DATABASE_URL`, o site usa dados fictícios e uma sessão de admin simulada para visualizar página do app, conta e painel admin (sem persistir alterações)

## Rodando localmente

```bash
npm install
cp .env.example .env
```

Preencha o `.env`:

```env
DATABASE_URL="postgresql://postgres.xxxx:SENHA@aws-0-REGIAO.pooler.supabase.com:6543/postgres?sslmode=require"
DATABASE_SSL=true
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="uma-string-aleatoria-com-32-caracteres"
SUPABASE_URL="https://xxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="sua-service-role-key"
SUPABASE_BUCKET="apps"
ADMIN_EMAIL="admin@playdownload.com"
ADMIN_PASSWORD="admin12345"
ADMIN_NAME="Administrador"
```

Crie as tabelas e popule os dados iniciais:

```bash
npm run db:push
npm run db:seed
npm run dev
```

Acesse `http://localhost:3000/admin` com a conta de administrador criada pelo seed. É o admin quem cria as contas dos usuários em **Admin → Usuários**.

## Supabase

1. Crie um projeto no Supabase.
2. Copie a **connection string** do pooler (porta `6543`) para `DATABASE_URL`.
3. Crie um bucket **público** chamado `apps` em Storage.
4. Copie `SUPABASE_URL` e a **service role key** (Project Settings → API). A service role fica somente no servidor.
5. Rode `npm run db:push` e `npm run db:seed`.

Sem um banco configurado, a interface funciona em modo demonstração: página do app, conta e painel admin ficam acessíveis com dados fictícios, mas alterações, uploads e autenticação real não são persistidos.

## Scripts

| Script                | Descrição                                     |
| --------------------- | --------------------------------------------- |
| `npm run dev`         | Servidor de desenvolvimento em `:3000`        |
| `npm run build`       | Build de produção                             |
| `npm run preview`     | Preview do build (runtime Cloudflare/workerd) |
| `npm run typecheck`   | Checagem de tipos                             |
| `npm run lint`        | ESLint                                        |
| `npm run format`      | Prettier + ESLint fix                         |
| `npm run db:generate` | Gera migrations do Drizzle                    |
| `npm run db:migrate`  | Aplica migrations                             |
| `npm run db:push`     | Sincroniza o schema direto no banco           |
| `npm run db:studio`   | Drizzle Studio                                |
| `npm run db:seed`     | Popula categorias, apps, avaliações e admin   |
| `npm run deploy`      | Build + deploy no Cloudflare Workers          |
| `npm run cf-typegen`  | Gera tipos do Cloudflare (bindings/env)       |

## Rotas principais

| Rota                | Descrição                               |
| ------------------- | --------------------------------------- |
| `/`                 | Redireciona para a página do usuário    |
| `/{slug}`           | Página individual e isolada do app      |
| `/adicionar`        | Criar uma página de app (logado)        |
| `/users`            | Entrar, criar conta e gerenciar páginas |
| `/meus-apps/$id`    | Editar a própria página                 |
| `/admin`            | Dashboard                               |
| `/admin/apps`       | Gerenciar apps                          |
| `/admin/usuarios`   | Gerenciar usuários                      |
| `/api/auth/*`       | Better Auth                             |
| `/api/upload`       | Upload autenticado                      |
| `/api/download/$id` | Download + contagem                     |

## Segurança

- Rotas `/admin` protegidas por sessão + papel `admin` no `beforeLoad`.
- Server functions administrativas validam o papel no servidor.
- Upload exige sessão, valida tipo/tamanho e usa a service role apenas no servidor.
- Slugs reservados (`admin`, `api`, `users`, entre outros) não podem ser usados por apps.
- Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` ou `BETTER_AUTH_SECRET` no cliente.
- O `.env` está no `.gitignore`.

## Deploy no Cloudflare Workers

O projeto já está configurado com o adapter oficial:

- `@cloudflare/vite-plugin` no `vite.config.ts`
- `wrangler.jsonc` com `nodejs_compat` e entry `@tanstack/react-start/server-entry`
- scripts `deploy` e `cf-typegen`

No painel da Cloudflare (Workers Builds) use:

| Configuração   | Valor            |
| -------------- | ---------------- |
| Build command  | `npm run build`  |
| Deploy command | `npm run deploy` |
| Node version   | 22               |

> O nome do Worker está como `play-download` no `wrangler.jsonc`. Se o Worker já existente tiver outro nome, ajuste esse campo para não criar um Worker novo.

### Variáveis na Cloudflare

Configure em **Workers → seu Worker → Settings → Variables and Secrets**:

**Secrets (encrypted):**

- `DATABASE_URL` — connection string do Supabase (recomendado: Transaction Pooler, porta 6543, com `?sslmode=require`)
- `BETTER_AUTH_SECRET` — string aleatória com 32+ caracteres
- `SUPABASE_SERVICE_ROLE_KEY`

**Vars (plain text):**

- `DATABASE_SSL` = `true`
- `SUPABASE_URL` = `https://SEU-PROJETO.supabase.co`
- `SUPABASE_BUCKET` = `apps`
- `BETTER_AUTH_ALLOWED_HOSTS` = `seu-dominio.com,www.seu-dominio.com` (o código já libera `*.workers.dev`, `localhost` e `play.download`)

O Better Auth usa **base URL dinâmica** com allowlist, então funciona tanto no domínio `workers.dev` quanto no domínio final.

### Banco de dados no Workers

Use a connection string do **Transaction Pooler** do Supabase (porta `6543`). O app usa `postgres.js` com uma conexão isolada por requisição (via `AsyncLocalStorage`) para respeitar o isolamento de I/O do Cloudflare Workers. Em desenvolvimento local, se o runtime não conseguir negociar TLS com o pooler, use `DATABASE_SSL=false` no `.env`; em produção mantenha `DATABASE_SSL=true`. Para volumes altos, considere Cloudflare Hyperdrive na frente do Supabase.

Configure os secrets no Worker com `npx wrangler secret put DATABASE_URL`, `npx wrangler secret put BETTER_AUTH_SECRET` e `npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY` (ou pelo painel da Cloudflare). Depois, rode as migrations localmente apontando para o mesmo banco:

```bash
npm run db:push
npm run db:seed
```

### Uploads

O limite de request do Cloudflare Workers é 100 MB, então o upload foi limitado a 100 MB. No Supabase Storage, confira o limite global do bucket `apps` (o padrão do projeto pode ser menor) e ajuste se necessário. Alternativamente, evolua para upload direto via signed URL.

### Desenvolvimento local com Cloudflare

O `vite dev` agora roda no runtime do Workers (workerd) e carrega as variáveis do `.env`. Para simular secrets localmente com `wrangler dev`, use também:

```bash
cp .dev.vars.example .dev.vars
```

O `.env` continua sendo usado pelos scripts de banco/seed.
