# IA WhatsApp

Central inteligente de atendimento por inteligência artificial conectada ao
WhatsApp — uma plataforma **SaaS multiempresa** onde a IA atende clientes,
organiza solicitações e apoia a operação, com controle humano e módulos que se
adaptam a cada negócio.

## Proposta

A empresa conecta seu WhatsApp, ensina como seu negócio funciona e passa a usar
uma plataforma centralizada onde a inteligência artificial atende clientes,
enquanto a equipe acompanha tudo, assume conversas quando necessário e habilita
apenas os módulos de que precisa (pedidos, catálogo, agenda, orçamentos, etc.).

O WhatsApp é o **canal**. A plataforma é a **central de operação** da empresa.

> **Fase 3 (fundação SaaS real):** autenticação, PostgreSQL, multi-tenancy com
> RLS, papéis/permissões, onboarding, catálogo/entrega/agente reais e motor
> determinístico já estão implementados. Rotas: `/demo/*` (demonstração pública,
> dados fictícios), `/auth/*` (login/cadastro) e `/app/*` (aplicação real,
> protegida). Veja `docs/PHASE_3_SAAS_FOUNDATION.md`, `docs/MULTI_TENANCY.md`,
> `docs/DETERMINISTIC_TOOLS.md`, `docs/SECURITY_LEARNING_NOTES.md` e
> `docs/SUPABASE_SETUP.md`. Sem Supabase configurado, o build funciona e a demo
> segue acessível.

> O produto **não** é um chatbot: é uma central de atendimento e operação em que
> a IA interpreta necessidades, consulta informações oficiais e usa ferramentas
> controladas pela aplicação — que valida e executa cada ação.

## Estado atual

**Fase 1 — Protótipo simulado da central (implementada).** Sobre a fundação da
Fase 0, o repositório agora traz um **protótipo navegável e operável** da central
de atendimento, com dados **simulados** e regras determinísticas locais. A empresa
fictícia é a **Pizzaria Forno Alto**.

O protótipo demonstra o fluxo completo: uma mensagem simulada chega, a IA simulada
conduz, um atendente pode assumir, um rascunho de pedido é montado, a disponibilidade
é validada, endereço e pagamento são registrados, o pedido é confirmado, entra na
fila de preparo e avança de status — atualizando a conversa a cada etapa.

> **Importante:** não há integrações reais. WhatsApp, Claude API, banco de dados,
> autenticação e pagamentos **não** estão funcionando — tudo é simulado no navegador.
> A "IA" segue mensagens pré-definidas e eventos determinísticos, sem Claude API.

### Como entrar na demonstração

1. Rode `npm run dev` e abra <http://localhost:3000>.
2. Na página institucional, clique em **"Abrir ambiente simulado"** (rota `/demo`).
3. Clique em **"Entrar na demonstração"** para abrir o painel (`/app`).

### Restaurar os dados

A demonstração é persistida no `localStorage` do navegador. Para voltar ao estado
inicial, use **"Restaurar demonstração"** em **Configuração da IA** (`/app/configuracoes/ia`).

**Ainda não há** (previsto para as próximas fases): banco de dados, autenticação,
integração com WhatsApp, Claude API ou pagamentos reais. Veja
[`docs/ROADMAP.md`](docs/ROADMAP.md).

## Stack

- [Next.js](https://nextjs.org) 16 (App Router)
- React 19
- TypeScript (modo `strict`)
- Tailwind CSS v4
- ESLint 9 (flat config, `eslint-config-next`)
- npm

## Requisitos

- Node.js 20+ (validado com Node 22)
- npm 10+

## Instalação

```bash
npm install
```

## Execução

```bash
npm run dev      # ambiente de desenvolvimento (http://localhost:3000)
npm run build    # build de produção
npm run start    # serve o build de produção
```

## Qualidade

```bash
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit (TypeScript strict)
npm run test       # Vitest (watch)
npm run test:run   # Vitest (execução única)
npm run build      # build completo (inclui verificação de tipos)
```

As regras puras de domínio (disponibilidade, pedidos, pagamento, fila e conversas)
são cobertas por testes unitários com Vitest.

## Estrutura resumida

```
src/
  app/                 # App Router: institucional, /demo e painel /app/*
  components/
    layout/            # app shell (sidebar, navegação mobile, topbar) + institucional
    ui/                # componentes de apresentação reutilizáveis
  core/                # fundação transversal (contrato de módulos e capacidades)
  data/demo/           # dados simulados centralizados (Pizzaria Forno Alto)
  modules/             # domínios: types · domain (regras puras) · components
    business|customers|conversations|catalog|availability|orders|payments|
    preparation|agent|demo/
  lib/                 # configuração e utilitários (format, result)
  types/               # tipos compartilhados
docs/                  # documentação de produto, arquitetura e segurança
```

Os domínios de negócio vivem sob `src/modules/<domínio>`; o estado da demonstração
fica em `src/modules/demo/state`. Consulte [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## O que está implementado

- Projeto Next.js com TypeScript strict, Tailwind e ESLint
- Scripts de `typecheck`, `test`/`test:run` (Vitest) e `build`
- Monólito modular com domínios sob `src/modules/<domínio>`
- Contrato tipado de módulos e verificação de capacidade pura
- Página institucional (com CTA) e rota `/demo` de entrada
- **Protótipo simulado da central** (`/app`): visão geral, atendimento em três
  áreas, pedidos, produtos e disponibilidade, clientes, fila de preparo e
  configuração da IA
- Estado da demonstração (Context + `useReducer`) com persistência opcional em
  `localStorage` e "Restaurar demonstração"
- Regras puras de domínio tipadas + 50 testes unitários

## O que ainda NÃO está implementado

Banco de dados · autenticação · RLS · Claude API · WhatsApp Cloud API · webhooks ·
Pix/pagamentos reais · RAG/embeddings · upload de documentos · onboarding ·
multiempresa funcional · realtime · notificações · relatórios avançados · PWA ·
deploy. **Nenhuma integração externa existe** — a demonstração é 100% simulada.

> **Aviso:** nenhuma integração externa existe neste repositório. Não há
> credenciais versionadas. O arquivo [`.env.example`](.env.example) apenas
> documenta variáveis previstas para fases futuras.

## Documentação

| Documento | Conteúdo |
| --- | --- |
| [`docs/PRODUCT.md`](docs/PRODUCT.md) | Problema, visão, princípios, público, MVP e escopo |
| [`docs/USER_FLOWS.md`](docs/USER_FLOWS.md) | Fluxos conceituais de empresa, atendimento e pizzaria |
| [`docs/MODULES.md`](docs/MODULES.md) | Núcleo universal, módulos opcionais e capacidades |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Monólito modular, camadas, domínios e fronteiras |
| [`docs/DATABASE.md`](docs/DATABASE.md) | Modelo conceitual de dados (sem migrations) |
| [`docs/AI_GOVERNANCE.md`](docs/AI_GOVERNANCE.md) | Papel, limites e governança da IA |
| [`docs/SECURITY.md`](docs/SECURITY.md) | Princípios e requisitos de segurança |
| [`docs/THREAT_MODEL.md`](docs/THREAT_MODEL.md) | Ativos, ameaças e mitigações |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Fases 0 a 8 com critérios de conclusão |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | Registro de decisões arquiteturais |
| [`CLAUDE.md`](CLAUDE.md) | Regras de trabalho para agentes neste repositório |

## Licença

Projeto privado. Todos os direitos reservados.
