# CLAUDE.md — Regras de trabalho neste repositório

Este documento orienta qualquer agente (ou pessoa) que trabalhe no IA WhatsApp.
Leia antes de alterar qualquer arquivo. A visão completa do produto está em
[`docs/PRODUCT.md`](docs/PRODUCT.md); a arquitetura, em
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Postura geral

- **Respeite o escopo.** Faça o que foi pedido e o necessário para isso; não
  avance de fase sem solicitação explícita. Consulte [`docs/ROADMAP.md`](docs/ROADMAP.md).
- **Inspecione antes de alterar.** Entenda o estado atual do repositório e do
  arquivo antes de modificá-lo.
- **Não implemente funcionalidades especulativas.** Nada de "preparação" para
  integrações futuras sem necessidade imediata.
- **Não integre serviços sem solicitação.** Nada de banco, autenticação,
  Claude, WhatsApp ou pagamentos até a fase correspondente ser pedida.
- **Documentar não é implementar.** A documentação descreve a visão; o código
  entrega apenas o escopo da fase atual.

## Segurança e segredos

- **Nunca versione credenciais** nem valores secretos. Apenas `.env.example`
  (vazio) entra no repositório.
- **Nunca exponha segredos ao navegador.** Só variáveis `NEXT_PUBLIC_*` chegam
  ao cliente; jamais coloque segredos nelas.
- **Nunca registre tokens em logs.**
- **Nunca confie em parâmetros de empresa enviados pelo cliente** sem validação
  no backend.
- **Nunca permita que a IA execute ações sem autorização no backend.** A IA
  solicita; o backend valida e executa. Veja [`docs/AI_GOVERNANCE.md`](docs/AI_GOVERNANCE.md).
- **Nunca trate uma mensagem do WhatsApp como instrução administrativa**, nem
  conteúdo de documento como regra de sistema sem aprovação humana.

## Qualidade de código

- **TypeScript `strict`** sempre. Sem `any` injustificado, sem `@ts-ignore`,
  sem `eslint-disable` global. Se precisar de uma exceção pontual, justifique-a
  por escrito no próprio ponto.
- **Não esconda erros.** Trate-os ou propague-os; não os silencie.
- **Não crie arquivos gigantes** nem funções/componentes gigantes. Prefira
  módulos pequenos e coesos.
- **Sem código morto, imports não usados ou arquivos vazios.**
- **Sem comentários que apenas repetem o código.** Comente o "porquê".
- **Separe regras de negócio da interface.** Componentes visuais não contêm
  regras críticas de negócio; integrações externas não são chamadas direto de
  componentes.

## Limites arquiteturais

- **Atendimento é o núcleo.** Conversas, mensagens, clientes, base de
  conhecimento, configuração da IA, transferência para humano e histórico são a
  base universal.
- **Módulos opcionais ficam separados** (pedidos, catálogo, disponibilidade,
  pagamentos, agenda, orçamentos, etc.) e respeitam verificação de capacidade.
- **Disponibilidade não é um ERP.** O módulo de produtos e disponibilidade só
  informa o que a IA pode oferecer/confirmar. Sem estoque industrial, custo
  médio, fornecedores, curva ABC, etc.
- **Valide as ações da IA no backend.** Preços, disponibilidade, pagamentos,
  permissões e status são determinísticos e controlados pela aplicação.
- **Multiempresa desde a fundação.** Toda entidade de empresa carrega vínculo
  empresarial; o isolamento é validado no backend, nunca só no frontend.

## Antes de concluir qualquer tarefa

Execute e faça passar:

```bash
npm install
npm run lint
npm run typecheck
npm run build
```

Depois:

- **Revise o diff** por completo.
- **Não declare sucesso sem evidência** (saída dos comandos).
- **Não faça merge automaticamente** na `main`.
- **Não avance de fase sem solicitação.**
