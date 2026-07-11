# ROADMAP.md — Roadmap por fases

Evolução em fases, do simples ao completo, sem superdimensionar. Cada fase só
começa quando solicitada. **A fase atual é a Fase 0.**

Para cada fase: objetivo · entregas · fora do escopo · dependências · riscos ·
critérios objetivos de conclusão.

---

## Fase 0 — Fundação (ATUAL)

- **Objetivo:** estabelecer a fundação técnica e documental do produto.
- **Entregas:** projeto Next.js (App Router) com TypeScript strict, Tailwind,
  ESLint, script de typecheck; estrutura modular mínima; contrato de módulos;
  página institucional; documentação completa; `.env.example` vazio.
- **Fora do escopo:** banco, autenticação, dashboard, conversas, IA, WhatsApp,
  pagamentos, testes automatizados, deploy, dados simulados.
- **Dependências:** nenhuma.
- **Riscos:** superdimensionar a fundação; introduzir integrações prematuras.
- **Conclusão:** `install`, `lint`, `typecheck` e `build` passam; página
  institucional funcional e responsiva; documentação fiel à visão; nenhuma
  integração real; nenhuma credencial versionada.

---

## Fase 1 — Protótipo simulado da central

- **Objetivo:** validar a experiência da central de atendimento com dados em
  memória (mock), sem persistência.
- **Entregas:** layout de três áreas no desktop (lista de conversas · mensagens ·
  painel do cliente) e navegação adaptada no mobile; estados de conversa
  navegáveis; navegação condicional por módulo (mock).
- **Fora do escopo:** banco, autenticação, IA, WhatsApp, pagamentos; qualquer
  persistência real.
- **Dependências:** Fase 0.
- **Riscos:** confundir mock com funcionalidade; overengineering de UI.
- **Conclusão:** central navegável com dados mock; responsiva e acessível; sem
  qualquer integração externa; claramente identificada como protótipo.

---

## Fase 2 — Banco, autenticação e multiempresa

- **Objetivo:** persistência real com isolamento multiempresa e autenticação.
- **Entregas:** PostgreSQL/Supabase; schema do núcleo; Supabase Auth; contexto
  empresarial; papéis/permissões; **RLS**; testes de isolamento; migrations.
- **Fora do escopo:** IA, WhatsApp, pagamentos, módulos operacionais completos.
- **Dependências:** Fases 0–1.
- **Riscos:** falha de isolamento entre empresas; RLS incompleta.
- **Conclusão:** login funcional; RLS ativa e testada; testes de isolamento
  passando; autorização por papel+permissão+módulo no backend.

---

## Fase 3 — Atendimento e pedidos simulados persistentes

- **Objetivo:** atendimento humano e pedidos persistentes (sem IA e sem WhatsApp).
- **Entregas:** conversas/mensagens persistentes; assumir/pausar/devolver;
  transferência; máquina de estados de conversa; módulos de catálogo,
  disponibilidade e pedidos (rascunho→confirmação pelo backend); fila de preparo.
- **Fora do escopo:** IA, WhatsApp, pagamentos reais.
- **Dependências:** Fase 2.
- **Riscos:** disponibilidade virar ERP; total/preço calculado fora do backend.
- **Conclusão:** fluxo de pedido de pizzaria ponta a ponta com dados reais
  internos; disponibilidade enxuta; totais determinísticos; ações auditadas.

---

## Fase 4 — Claude API e ferramentas controladas

- **Objetivo:** IA atendendo com ferramentas validadas no backend.
- **Entregas:** integração Claude API; ferramentas com schema/validação/permissão/
  auditoria/idempotência; configuração da IA versionada; base de conhecimento com
  aprovação; ordem de confiança; salvaguardas de prompt/tool injection.
- **Fora do escopo:** WhatsApp, pagamentos.
- **Dependências:** Fase 3.
- **Riscos:** prompt/tool injection; IA decidindo dados determinísticos; custo.
- **Conclusão:** IA responde usando dados oficiais; nenhuma ação crítica sem
  validação; ferramentas auditadas; quotas/limites de IA ativos.

---

## Fase 5 — WhatsApp Cloud API

- **Objetivo:** conectar o canal real de mensagens.
- **Entregas:** conexão do número; envio/recebimento; webhooks com verificação de
  assinatura, deduplicação e anti-replay; mídia (áudio, imagem, localização).
- **Fora do escopo:** pagamentos.
- **Dependências:** Fase 4.
- **Riscos:** webhook falso/replay; spam; mensagem tratada como comando.
- **Conclusão:** conversas reais fluindo do WhatsApp; webhooks verificados e
  idempotentes; rate limiting ativo.

---

## Fase 6 — Pagamentos

- **Objetivo:** cobrança e conciliação seguras.
- **Entregas:** provedor de pagamentos; Pix (cobrança + webhook validado); status
  de pagamento separado do operacional; cartão na entrega/dinheiro/checkout online.
- **Fora do escopo:** relatórios financeiros avançados.
- **Dependências:** Fase 5 (e módulo de pedidos).
- **Riscos:** cobrança duplicada; confirmação por comprovante; dados de cartão.
- **Conclusão:** confirmação só por evento validado do provedor; idempotência;
  sem dados de cartão armazenados; nunca confirmar por imagem.

---

## Fase 7 — Onboarding e SaaS multiempresa

- **Objetivo:** autoatendimento de novas empresas com onboarding adaptável.
- **Entregas:** onboarding guiado ("o que você deseja que a IA faça?"); sugestão
  e confirmação de módulos; gestão de usuários; planos; navegação por módulos.
- **Fora do escopo:** observabilidade avançada de produção.
- **Dependências:** Fases 2–6.
- **Riscos:** onboarding complexo demais; ativação indevida de módulos.
- **Conclusão:** empresa cria conta, faz onboarding, ativa módulos (confirmados
  por responsável) e opera; IA nunca ativa módulos/permissões.

---

## Fase 8 — Segurança, observabilidade e produção

- **Objetivo:** endurecer para produção.
- **Entregas:** observabilidade (logs/métricas/traces sem dados sensíveis);
  revisão de segurança e checklist de produção; resposta a incidentes; avaliações
  automatizadas da IA; rollback; retenção/backup.
- **Fora do escopo:** novos módulos funcionais.
- **Dependências:** Fases 0–7.
- **Riscos:** dívidas de segurança acumuladas; lacunas de auditoria.
- **Conclusão:** checklist de produção de [`SECURITY.md`](SECURITY.md) satisfeito;
  observabilidade ativa; plano de incidentes exercitado.
