# Fase 3 — Fundação SaaS real, multiempresa e segura

Esta fase transforma a Central IA de um protótipo visual (dados fictícios,
estado local) em uma **fundação SaaS real**: autenticação, banco PostgreSQL,
isolamento entre empresas (multi-tenancy), papéis e permissões, onboarding,
catálogo/entrega/agente reais e um motor operacional determinístico. A versão
visual aprovada foi **preservada**; nada de redesenho.

> Fora de escopo nesta fase (por decisão explícita): WhatsApp, LLM/Claude,
> pagamentos, geocodificação, billing e convites por e-mail.

## O que foi construído

| Área | Entregue |
| --- | --- |
| Autenticação | Supabase Auth (e-mail/senha), SSR por cookies, login/cadastro/recuperação/redefinição/logout, proteção de rotas por middleware |
| Multiempresa | `organizations`, `units`, `organization_memberships`, contexto server-side de empresa/unidade ativas |
| Papéis | owner/admin/manager/agent/viewer, matriz de permissões central e tipada |
| Banco | 13 migrations, enums, constraints, índices, função transacional de criação de empresa |
| Segurança | RLS explícita por operação em todas as tabelas multiempresa; triggers de imutabilidade de `organization_id` e anti-auto-elevação de papel |
| Onboarding | Criação transacional da empresa + revisão/conclusão, progresso persistido |
| Dados reais | CRUD de produtos e zonas de entrega, configuração do agente, estados vazios honestos |
| Ferramentas | Motor determinístico (catálogo, entrega, pedidos, handoff) que a futura IA irá solicitar |
| Auditoria | `recordAuditEvent` com sanitização de metadados |
| Demo | Preservada e movida para `/demo` (dados fictícios, sem banco) |

## Rotas

- **Público:** `/`, `/demo/*` (demonstração), `/auth/*`.
- **Protegido (sessão + empresa):** `/app/*`, `/onboarding`.

O middleware (`middleware.ts` → `src/lib/supabase/middleware.ts`) renova a
sessão e redireciona não autenticados para `/auth/login`. O layout de `/app`
(`src/app/app/layout.tsx`) aplica as barreiras de negócio.

## Fluxo de autenticação (SSR)

1. Cliente de navegador (`src/lib/supabase/client.ts`) e de servidor
   (`src/lib/supabase/server.ts`) usam `@supabase/ssr`; a sessão vive em
   **cookies**, nunca em `localStorage`.
2. O middleware chama `supabase.auth.getUser()` a cada request — a identidade é
   **validada no servidor**, não inferida de cookies crus.
3. Server Actions (`src/app/auth/actions.ts`) executam sign-in/up, recuperação e
   redefinição. Mensagens são genéricas em fluxos sensíveis (não revelam se um
   e-mail existe).

## Fluxo de autorização (3 camadas)

1. **Banco (RLS)** — barreira inviolável. Ver `docs/MULTI_TENANCY.md`.
2. **Servidor** — Server Actions checam permissões (`src/core/auth`) antes de
   tocar o banco.
3. **Interface** — navegação e botões derivam de módulos + permissões (UX).

As três concordam por design, mas apenas a RLS é a autoridade final.

## Contexto de empresa/unidade

`src/core/context/organization.ts` resolve, no servidor, a organização e a
unidade ativas a partir das *memberships* do usuário. A preferência (cookie) só
**seleciona** entre opções às quais o usuário já tem acesso — nunca autoriza.
`src/core/context/current.ts` memoiza a resolução por request (`React.cache`).

## Repositórios (Demo × Supabase)

Componentes não conhecem SQL nem RLS: falam com repositórios tipados
(`src/core/data/contracts.ts`). Há implementações **Demo** (mocks/estado local)
e **Supabase** (banco real). Isso mantém a demonstração viva e permite substituir
os dados gradualmente.

## Ferramentas determinísticas

`src/core/tools/*` — contratos, contexto (autorização + validação Zod) e as
ferramentas `catalog.search`, `catalog.checkAvailability`, `delivery.quote`,
`order.calculateTotals`, `order.createDraft/getStatus`, `handoff.request`. Ver
`docs/DETERMINISTIC_TOOLS.md`.

## Como rodar

```bash
npm ci
npm run lint
npm run typecheck
npm run test:run
npm run build
```

Sem Supabase configurado, o build funciona, a demo fica acessível e as rotas
reais exibem o estado de **configuração ausente**. Para ativar o modo real, veja
`docs/SUPABASE_SETUP.md`.

## Limitações conhecidas

- Onboarding condensado (criação transacional + revisão); os passos intermediários
  (unidade, operação, catálogo, entrega, agente) são feitos nas telas de
  configuração da aplicação após a criação.
- Atendimento/pedidos/clientes/fila exibem estados vazios reais — não há canal de
  mensagens integrado nesta fase.
- Os testes de RLS (pgTAP) foram **criados**, mas não executados neste ambiente
  (sem Docker/Supabase local). Ver `supabase/tests/`.
