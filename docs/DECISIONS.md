# DECISIONS.md — Registro de decisões (ADRs)

Formato: Decisão · Contexto · Alternativas · Escolha · Motivo · Consequências ·
Status.

---

## ADR-001 — Monólito modular

- **Contexto:** produto novo, equipe enxuta, domínios ainda em formação.
- **Alternativas:** microserviços; monólito não modular.
- **Escolha:** monólito modular (uma app, limites claros entre domínios).
- **Motivo:** simplicidade operacional e velocidade, preservando fronteiras para
  extração futura sem pagar o custo de sistemas distribuídos agora.
- **Consequências:** disciplina de dependências entre camadas/domínios; extração
  de serviços só sob critérios objetivos ([`ARCHITECTURE.md`](ARCHITECTURE.md)).
- **Status:** aceita.

## ADR-002 — Next.js (App Router)

- **Contexto:** precisamos de front e backend leves na mesma base, com boa DX.
- **Alternativas:** SPA + API separada; outro framework full-stack.
- **Escolha:** Next.js 16 com App Router.
- **Motivo:** full-stack coeso, roteamento moderno, ecossistema maduro.
- **Consequências:** o **domínio** não deve depender de Next.js; a apresentação
  passa pela camada de aplicação.
- **Status:** aceita.

## ADR-003 — TypeScript strict

- **Contexto:** segurança e manutenibilidade desde o início.
- **Alternativas:** TypeScript sem strict; JavaScript.
- **Escolha:** TypeScript `strict` (+ `noUncheckedIndexedAccess`,
  `noImplicitOverride`, `noFallthroughCasesInSwitch`).
- **Motivo:** capturar erros cedo; contratos explícitos.
- **Consequências:** sem `any` injustificado, sem `@ts-ignore`; script
  `typecheck` obrigatório.
- **Status:** aceita.

## ADR-004 — Atendimento como núcleo

- **Contexto:** risco de virar um ERP genérico.
- **Alternativas:** tratar todos os recursos como iguais.
- **Escolha:** atendimento (conversas, clientes, conhecimento, IA, transferência,
  histórico) é o núcleo universal.
- **Motivo:** é a base comum a todo segmento; foco no valor central.
- **Consequências:** demais recursos são módulos opcionais separados.
- **Status:** aceita.

## ADR-005 — Módulos opcionais e verificação de capacidade

- **Contexto:** segmentos diferentes precisam de recursos diferentes.
- **Alternativas:** um produto fixo por segmento; tudo sempre ligado.
- **Escolha:** módulos opcionais habilitados por empresa, com verificação de
  capacidade determinística no backend.
- **Motivo:** a plataforma se adapta ao negócio; evita expor recursos irrelevantes.
- **Consequências:** módulo desativado é bloqueado em autorização/rotas/serviços,
  não só no menu. Contrato inicial em [`src/core/modules.ts`](../src/core/modules.ts).
- **Status:** aceita.

## ADR-006 — Disponibilidade simplificada (não é ERP)

- **Contexto:** a IA precisa saber o que pode oferecer/confirmar.
- **Alternativas:** módulo completo de estoque (custo médio, fornecedores, curva ABC).
- **Escolha:** três modos — sempre disponível, manual, quantidade controlada.
- **Motivo:** simplicidade operacional; evita superdimensionamento.
- **Consequências:** sem estoque industrial/fiscal; backend valida na confirmação;
  reservas temporárias expiram; operações idempotentes.
- **Status:** aceita.

## ADR-007 — Sem microserviços na fundação

- **Contexto:** complexidade distribuída não se justifica agora.
- **Alternativas:** microserviços desde o início.
- **Escolha:** adiar; manter monólito modular.
- **Motivo:** custo operacional alto sem benefício atual.
- **Consequências:** extração futura condicionada a critérios objetivos.
- **Status:** aceita.

## ADR-008 — Sem integrações externas na Fase 0

- **Contexto:** fundação deve ser hermética e segura.
- **Alternativas:** já preparar SDKs/conexões de banco, IA, WhatsApp, pagamentos.
- **Escolha:** nenhuma integração; `.env.example` apenas documenta variáveis
  futuras (vazias). A página institucional usa fontes do sistema para não
  depender de rede em build.
- **Motivo:** evitar "preparação" especulativa e superfície de ataque prematura.
- **Consequências:** integrações entram nas fases correspondentes do roadmap.
- **Status:** aceita.

## ADR-009 — IA sem acesso direto ao banco

- **Contexto:** a IA não é a fonte da verdade.
- **Alternativas:** dar à IA acesso amplo a dados/ações.
- **Escolha:** a IA age apenas por ferramentas com schema, validação, permissão,
  capacidade, contexto empresarial, auditoria e idempotência.
- **Motivo:** segurança, determinismo e controle humano.
- **Consequências:** o backend valida e executa; a IA interpreta e solicita. Ver
  [`AI_GOVERNANCE.md`](AI_GOVERNANCE.md).
- **Status:** aceita.

## ADR-010 — Multiempresa preparada conceitualmente

- **Contexto:** SaaS multiempresa desde a visão.
- **Alternativas:** adicionar multiempresa depois.
- **Escolha:** preparar conceitualmente desde já (documentação e contrato de
  módulos), implementar isolamento na Fase 2 (RLS + escopo + testes).
- **Motivo:** decisões atuais não podem inviabilizar o isolamento futuro.
- **Consequências:** toda entidade de empresa terá `business_id`; escopo derivado
  da sessão; nunca confiar em parâmetro do cliente.
- **Status:** aceita.

## ADR-011 — `src/modules/` não criado vazio na Fase 0

- **Contexto:** a estrutura sugerida inclui `modules/`, mas nenhum domínio é
  implementado nesta fase.
- **Alternativas:** criar a pasta vazia ou com placeholders fictícios.
- **Escolha:** não criar `src/modules/` ainda; manter o contrato de módulos em
  `src/core/modules.ts` e documentar que domínios virão sob `src/modules/<domínio>`.
- **Motivo:** a própria tarefa proíbe pastas vazias e interfaces fictícias.
- **Consequências:** o diretório de domínios nasce com o primeiro domínio (Fase 3).
- **Status:** aceita.
