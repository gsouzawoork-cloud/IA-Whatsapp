# ARCHITECTURE.md — Arquitetura

## Visão geral

O IA WhatsApp começa como um **monólito modular**: uma única aplicação e base de
código, com limites claros entre domínios e regras de dependência explícitas. Não
há microserviços nesta fase; partes poderão ser extraídas no futuro, quando
houver necessidade real e critérios objetivos forem atendidos.

Stack atual (Fase 0):

- Next.js 16 (App Router) · React 19 · TypeScript `strict`
- Tailwind CSS v4 · ESLint 9 (flat config) · npm

Tecnologias previstas mas **não** implementadas: PostgreSQL, Supabase (Auth +
RLS), Zod, Vitest, Playwright, Claude API, WhatsApp Cloud API, provedor de
pagamentos, filas, realtime, observabilidade, armazenamento de documentos e
busca semântica. Ver [`ROADMAP.md`](ROADMAP.md).

## Monólito modular

- **Uma aplicação principal**, uma base de código.
- **Limites claros entre domínios** e regras de dependência.
- **Serviços separados por responsabilidade** dentro do monólito.
- **Extração futura** possível quando um domínio tiver carga, ciclo de vida ou
  requisitos de escala que justifiquem.

## Camadas e responsabilidades

1. **Domínio** — entidades, regras de negócio, estados, invariantes e contratos.
   Não depende de Next.js nem de infraestrutura.
2. **Aplicação** — casos de uso, orquestração, validações de fluxo e portas de
   entrada para serviços.
3. **Infraestrutura** — banco, APIs externas, mensageria, provedores,
   persistência e observabilidade.
4. **Apresentação** — páginas, componentes, formulários, interações e estados
   visuais.

### Dependências permitidas

```
Apresentação → Aplicação → Domínio
Infraestrutura → Domínio (implementa contratos/portas)
Aplicação → (portas de) Infraestrutura
```

### Dependências proibidas

- **Domínio → Next.js / infraestrutura.** O domínio é puro.
- **Apresentação → Infraestrutura direta.** Componentes não chamam banco/APIs
  externas diretamente; passam pela camada de aplicação.
- **Regras críticas de negócio dentro de componentes visuais.**
- **Dados externos entrando em casos de uso sem validação.**
- **Acesso a recurso sem verificação de capacidade (módulo) e de contexto
  empresarial.**

## Domínios previstos

`auth`, `businesses`, `business-modules`, `users`, `roles`, `permissions`,
`conversations`, `messages`, `customers`, `knowledge`, `agent`, `audit`,
`orders`, `catalog`, `availability`, `payments`, `preparation`, `delivery`,
`appointments`, `quotes`, `integrations`.

> **Pastas de domínio não são criadas vazias.** Cada domínio ganhará seu diretório
> sob `src/modules/<domínio>` quando for implementado (Fase 3+). Nesta fase existe
> apenas o **contrato de módulos** em [`src/core/modules.ts`](../src/core/modules.ts),
> que classifica núcleo vs. opcional e oferece a verificação de capacidade.

## Estrutura de código atual

```
src/
  app/                 # App Router: layout, página institucional, globals.css
  components/
    layout/            # SiteHeader, SiteFooter
    ui/                # PillarCard
  core/                # fundação transversal (modules.ts)
  lib/                 # site-config.ts (fonte única do conteúdo institucional)
  types/               # site.ts (tipos compartilhados)
```

- `core/` guarda fundações **transversais** usadas por todos os domínios (ex.: o
  contrato de módulos/capacidades). Não é um domínio.
- `modules/` (a ser criado) guardará o **código de cada domínio** de negócio.
- `lib/` guarda utilitários e configuração da aplicação.

## Contexto empresarial (multiempresa)

Toda operação ocorre no escopo de uma empresa. Um usuário pode participar de mais
de uma empresa, mas sempre há um **contexto empresarial ativo**. Regras:

- Toda entidade de empresa carrega `business_id` (ou vínculo equivalente).
- O isolamento é validado no backend a partir da **sessão autenticada** e da
  associação usuário↔empresa — nunca a partir de parâmetros do cliente.
- Reforços futuros: Row Level Security, índices/constraints, testes de isolamento
  e auditoria. Ver [`DATABASE.md`](DATABASE.md) e [`SECURITY.md`](SECURITY.md).

## Fluxo de mensagem (conceitual, Fase 5)

```
WhatsApp Cloud API ──▶ Webhook (verifica assinatura, valida payload)
   ▶ Camada de aplicação: identifica empresa/conversa/cliente (idempotente)
   ▶ Persiste a mensagem no escopo da empresa
   ▶ Aciona o agente (se a IA estiver ativa na conversa)
   ▶ Resposta da IA passa por validação/ferramentas do backend
   ▶ Envio ao cliente via WhatsApp + registro/auditoria
```

## Fluxo de ferramenta da IA (conceitual, Fase 4)

```
IA solicita uma ferramenta (ex.: buscar_produtos) com argumentos
   ▶ Backend valida schema de entrada (Zod) e permissões/capacidade
   ▶ Verifica contexto empresarial e limites de escopo
   ▶ Executa de forma determinística (idempotente quando crítico)
   ▶ Retorna resultado estruturado + registra auditoria
   ▶ A IA usa o resultado; nunca decide preço/disponibilidade/pagamento
```

Detalhes em [`AI_GOVERNANCE.md`](AI_GOVERNANCE.md).

## Fronteiras de confiança

- **Não confiável:** mensagens do WhatsApp, conteúdo de documentos enviados,
  parâmetros do cliente, webhooks antes da verificação de assinatura, saídas do
  modelo de IA.
- **Confiável após validação:** dados aprovados pela empresa, resultados
  determinísticos do backend, sessões autenticadas.
- Nunca tratar mensagem do WhatsApp como instrução administrativa, nem conteúdo
  de documento como regra de sistema sem aprovação. Ver [`THREAT_MODEL.md`](THREAT_MODEL.md).

## Integrações futuras

Supabase (dados/auth/RLS/realtime), Claude API (IA), WhatsApp Cloud API (canal),
provedor de pagamentos, armazenamento de documentos, busca semântica,
observabilidade e filas de processamento. Todas atrás da camada de
infraestrutura, acessadas via portas definidas no domínio/aplicação.

## Evolução e critérios para extrair serviços

Extrair um domínio para serviço separado só se justifica quando houver, de forma
sustentada: (1) requisito de escala independente; (2) ciclo de deploy/propriedade
distinto; (3) isolamento de falhas necessário; ou (4) limite de segurança que
exija processo separado. Até lá, o monólito modular é a escolha padrão.

## Decisões abertas

- Estratégia de estado no cliente (provavelmente recursos nativos do
  React/Next antes de considerar biblioteca externa).
- Formalização da máquina de estados de conversa e de pedido.
- Modelagem de filas de processamento (webhooks, IA, notificações).

Registradas em [`DECISIONS.md`](DECISIONS.md).
