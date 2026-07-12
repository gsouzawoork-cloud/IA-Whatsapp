# Ferramentas operacionais determinísticas

A futura IA da Central IA **não** acessará o banco diretamente nem decidirá
valores. Ela solicitará **ferramentas controladas** — funções determinísticas,
validadas e autorizadas pela aplicação. Este documento explica o porquê e a
estrutura já implementada em `src/core/tools/`.

## Por que a IA não calcula preço, frete ou total

Modelos de linguagem são ótimos para conversar, mas **não são fontes de
verdade** para números. Se a IA inventasse um preço, um frete ou um total, a
empresa perderia dinheiro ou prometeria o que não pode cumprir. Por isso:

- **Preço** vem de `products.price_cents` (banco). A IA nunca altera.
- **Disponibilidade** vem de `product_availability`/`availability_mode`.
- **Frete** vem de uma zona cadastrada (`delivery_zones`). Região desconhecida →
  `manual_review`. Nunca inventado.
- **Total** é recalculado no servidor: `subtotal + frete − desconto`, com
  desconto = 0 nesta fase.
- **Pedido** começa em `draft`; pagamento nunca é confirmado automaticamente.

## Como as ferramentas controlam as ações

Cada ferramenta tem: nome estável, descrição interna, **schema de entrada e
saída (Zod)**, exigência de **autorização**, **validação**, execução
**determinística**, **erros tipados** e **auditoria**. O fluxo padrão é:

```
authenticate → resolve tenant → authorize → validate → execute → audit → return
```

O `ToolContext` carrega o tenant resolvido no servidor. **Nenhuma ferramenta
confia em `organization_id` enviado pelo chamador.**

## Ferramentas implementadas

| Ferramenta | Entrada (resumo) | Saída (resumo) |
| --- | --- | --- |
| `catalog.search` | unidade, query, categoria | produtos ativos, preço oficial, disponibilidade |
| `catalog.checkAvailability` | produto, quantidade, unidade | disponível?, quantidade, alternativas |
| `delivery.quote` | unidade, CEP/bairro, subtotal | status (available/unavailable/manual_review), taxa, prazo, frete grátis |
| `order.calculateTotals` | itens, frete, desconto | subtotal, frete, desconto, total, erros |
| `order.createDraft` | cliente, unidade, itens, modalidade, endereço | rascunho, campos faltantes |
| `order.getStatus` | id/número | status permitido, próximo passo |
| `handoff.request` | conversa, razão, prioridade | status (idempotente), rótulo |

Registro central: `src/core/tools/registry.ts`. Testes: `src/core/tools/tools.test.ts`.

## Como será a futura integração com o LLM

Quando a IA entrar (fase posterior), ela receberá as **descrições** das
ferramentas e poderá pedir para executá-las. A aplicação continuará sendo quem
autoriza, valida e executa — a IA apenas **solicita**. Assim, nenhuma resposta do
modelo vira ação sem passar pelos controles determinísticos descritos aqui.
