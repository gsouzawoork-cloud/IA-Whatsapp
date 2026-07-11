# USER_FLOWS.md — Fluxos de usuário (conceituais)

> **Todos os fluxos abaixo são conceituais e ainda NÃO estão implementados.**
> Descrevem o comportamento pretendido para orientar decisões de arquitetura e
> de design. A fase de cada fluxo é indicada em [`ROADMAP.md`](ROADMAP.md).

## 1. Onboarding da empresa (Fase 7)

1. O responsável cria a conta e a empresa.
2. A plataforma conduz um onboarding guiado, perguntando: tipo de negócio, nome,
   unidades, endereços, horários, canais, produtos/serviços, objetivos da IA,
   situações que exigem humano, módulos necessários, formas de pagamento,
   políticas, tom de comunicação, usuários/funções e integrações.
3. Pergunta central: **"O que você deseja que a IA faça?"** (responder dúvidas,
   informar produtos/serviços, registrar pedidos, verificar disponibilidade,
   receber pagamentos, criar agendamentos, criar solicitações, gerar orçamentos,
   consultar status, encaminhar para setor, transferir para atendente).
4. Com base nas respostas, a plataforma **sugere** os módulos necessários.
5. Um responsável **confirma** a ativação. A IA nunca ativa módulos nem concede
   permissões por conta própria.

## 2. Configuração de módulos (Fase 7)

1. O proprietário revisa os módulos sugeridos.
2. Ativa ou desativa módulos conforme o negócio.
3. A navegação, as páginas, as ações e as permissões passam a refletir apenas os
   módulos ativos — inclusive bloqueando no backend (não só no menu).

## 3. Configuração da IA (Fase 4)

1. Define nome do agente, apresentação, tom, formalidade, uso de emojis, idioma.
2. Define horários e mensagem fora do horário.
3. Define objetivos, informações oficiais, políticas e casos que exigem humano.
4. Define ações permitidas e proibidas e limites de autonomia.
5. A configuração é versionada; mudanças relevantes geram auditoria. A IA não
   edita a própria configuração.

## 4. Atendimento automático (Fase 4)

1. O cliente envia uma mensagem pelo WhatsApp.
2. A aplicação registra a mensagem na conversa (estado: nova / em atendimento
   pela IA).
3. A IA identifica intenção e entidades.
4. A IA consulta dados autorizados via ferramentas (produtos, horários,
   políticas, disponibilidade, etc.).
5. A IA responde ou faz perguntas de esclarecimento.
6. Se a situação exigir, transfere para humano.

## 5. Assunção por humano (Fase 3+)

1. O atendente abre a conversa na central.
2. Escolhe **assumir atendimento** e **pausar a IA** naquela conversa.
3. Passa a responder manualmente. A ação fica registrada (quem, quando).

## 6. Transferência (Fase 3+)

1. O atendente transfere a conversa para outro atendente ou setor.
2. A aplicação atualiza responsável/fila e registra a transferência e o motivo.
3. A IA pode gerar um resumo do histórico para o novo responsável.

## 7. Retorno para a IA (Fase 3+)

1. O atendente **devolve** a conversa para a IA.
2. A IA retoma o atendimento com o contexto atualizado. A ação é registrada.

## 8. Atendimento de pizzaria (Fase 3 simulado / 4+ com IA)

Fluxo conceitual completo:

1. Cliente inicia a conversa.
2. IA identifica a necessidade.
3. IA consulta o cardápio oficial.
4. Cliente seleciona itens.
5. Sistema valida cada item (existência, variações, adicionais).
6. Sistema consulta disponibilidade.
7. Sistema monta um **rascunho** de pedido.
8. IA confirma tamanho, alterações e adicionais.
9. Sistema calcula o subtotal.
10. Cliente informa ou confirma o endereço.
11. Sistema valida a área de entrega.
12. Sistema calcula taxa e prazo.
13. Cliente escolhe a forma de pagamento.
14. Sistema apresenta o resumo completo.
15. Cliente confirma.
16. Backend cria/confirma o pedido.
17. Pedido entra na fila apropriada.
18. Cliente recebe atualizações de status.
19. O funcionário acompanha tudo pelo painel.

## 9. Montagem de pedido (Fase 3+)

1. A IA propõe itens a partir do cardápio oficial.
2. Cada item é validado pelo backend antes de entrar no rascunho.
3. Quantidades, variações, adicionais e observações são estruturados.
4. O total é calculado pela aplicação, nunca pela IA.
5. Trocas de item exigem confirmação do cliente.

## 10. Verificação de disponibilidade (Fase 3+)

1. Antes de confirmar um item, a IA consulta a aplicação.
2. O backend valida a disponibilidade na confirmação.
3. Para itens com quantidade controlada, o backend pode reservar temporariamente.
4. Reservas expiradas são liberadas. Operações críticas são idempotentes.
5. A IA pode sugerir alternativa aprovada, mas não troca sem confirmação.

## 11. Pagamento (Fase 6)

1. O cliente escolhe a forma de pagamento (Pix, link, cartão online, cartão na
   entrega, dinheiro, presencial ou sem pagamento).
2. Para Pix: o backend cria a cobrança no provedor, envia o QR/código e aguarda
   confirmação por webhook validado.
3. Para dinheiro: pergunta troco e calcula pela aplicação.
4. Para cartão na entrega: registra e mantém pendente até a entrega.
5. A IA **nunca** confirma pagamento por comprovante em imagem.

## 12. Fila de preparo (Fase 3 simulado / 6 integrado)

1. Pedidos confirmados aparecem na fila (novos → confirmados → em preparação →
   prontos → em entrega → concluídos).
2. Cada item mostra apenas o necessário para a operação.
3. A previsão de tempo é calculada pela aplicação (tempo padrão, pedidos ativos,
   média recente, ajuste manual), nunca inventada pela IA.

## 13. Atualização do cliente (Fase 4/5)

1. A cada mudança de status relevante, a aplicação gera uma atualização.
2. A IA comunica a atualização ao cliente com base em dados reais.

## 14. Encerramento (Fase 3+)

1. Um atendente ou a IA marca a conversa como resolvida/encerrada.
2. A conversa pode ser reaberta, registrando a ação.

## 15. Revisão de conversa problemática (Fase 8)

1. Conversas com transferência, erro de intenção ou baixa resolução são
   sinalizadas.
2. O sistema pode **sugerir** melhorias (nova FAQ, ajuste de resposta, correção
   de produto, mudança de fluxo).
3. Nenhuma sugestão é publicada automaticamente: exige revisão e aprovação.

## Estados de uma conversa (conceituais)

`Nova` → `Em atendimento pela IA` → `Aguardando cliente` / `Aguardando
atendente` → `Em atendimento humano` → `Transferida` → `Resolvida` →
`Encerrada`. A máquina de estados é controlada pela aplicação e será formalizada
quando o atendimento for implementado.
