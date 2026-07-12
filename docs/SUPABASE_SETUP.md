# Configuração do Supabase

Passo a passo para ativar o modo real. Sem estes valores, a aplicação continua
compilando, a demo fica acessível e as rotas reais mostram "configuração
ausente".

## 1. Criar o projeto

1. Acesse <https://supabase.com> e crie um projeto.
2. Em **Project Settings → API**, copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** (anon/public) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. **NUNCA** copie a *service role key* para variáveis `NEXT_PUBLIC_*`. Ela é um
   segredo de servidor e não é usada pela aplicação nesta fase.

## 2. Configurar `.env.local` (desenvolvimento)

Copie `.env.example` para `.env.local` (ignorado pelo git) e preencha:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=SUA-PUBLISHABLE-KEY
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_ENV=development
```

## 3. Aplicar as migrations

Com a [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase link --project-ref SEU-REF     # projeto remoto
supabase db push                         # aplica supabase/migrations

# OU, para desenvolvimento local com Docker:
supabase start
supabase db reset                        # aplica migrations + seed local
```

## 4. Gerar os tipos TypeScript

```bash
supabase gen types typescript --local > src/lib/supabase/database.types.ts
```

(Nesta fase os tipos foram escritos à mão espelhando as migrations; substitua-os
pelos gerados quando tiver um projeto.)

## 5. Testar

```bash
npm run dev
```

- `/demo` deve funcionar sempre (não depende do Supabase).
- `/auth/cadastro` cria uma conta; depois `/onboarding` cria a empresa; então
  `/app` mostra os dados reais.

## 6. Vercel — variáveis por ambiente

Configure em **Project → Settings → Environment Variables**, para cada ambiente:

| Variável | Development | Preview | Production |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | projeto dev | projeto preview | projeto prod |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✔ | ✔ | ✔ |
| `NEXT_PUBLIC_APP_URL` | localhost | URL de preview | domínio prod |
| `APP_ENV` | development | preview | production |

Observações:

- **Após alterar variáveis, faça um novo deploy** — o Next inlineia
  `NEXT_PUBLIC_*` em build.
- Use projetos Supabase **separados** para Preview e Production; nunca rode
  testes destrutivos contra o banco de produção.
- Não aplique migrations automaticamente a cada request.

## 7. Testes de banco (RLS)

Com Docker/Supabase local:

```bash
supabase db reset
supabase test db        # executa supabase/tests/*.test.sql (pgTAP)
```
