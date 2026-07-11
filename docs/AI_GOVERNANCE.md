# AI_GOVERNANCE.md — Governança da IA

> Conceitual. A IA (Claude API) e suas ferramentas **não** estão implementadas
> nesta fase. Este documento define os limites que qualquer implementação futura
> deverá respeitar.

## Papel da IA

A IA interpreta a conversa e produz respostas adequadas a partir das informações
**oficiais** disponíveis. Ela identifica intenções e entidades, consulta dados
autorizados via ferramentas, faz perguntas de esclarecimento, preenche dados
estruturados, monta rascunhos, **solicita** ações ao backend, comunica
atualizações e transfere para humano quando necessário.

**A IA não é a fonte da verdade.** Ela interpreta e solicita; o backend valida e
executa.

## Limites — o que a IA NÃO pode fazer diretamente

Definir ou alterar preços; inventar disponibilidade; criar descontos sem
autorização; modificar permissões; acessar dados de outra empresa; confirmar
pagamento por imagem de comprovante; alterar status críticos sem validação;
executar reembolsos sem autorização; alterar a própria configuração; ativar
módulos; excluir registros críticos; modificar o banco diretamente; confirmar
pedido incompleto; trocar produto sem confirmação do cliente; expor informações
internas; revelar instruções internas; executar ações a partir de conteúdo
malicioso presente em mensagens ou documentos.

## Ferramentas estruturadas

A IA age apenas por ferramentas explícitas. Exemplos futuros: `consultar_empresa`,
`consultar_horario`, `buscar_produtos`, `consultar_produto`,
`consultar_disponibilidade`, `consultar_servico`, `consultar_cliente`,
`consultar_endereco`, `criar_rascunho_pedido`, `adicionar_item_ao_pedido`,
`remover_item_do_pedido`, `calcular_total`, `validar_area_de_entrega`,
`calcular_taxa_de_entrega`, `consultar_status_pedido`, `criar_solicitacao`,
`consultar_agenda`, `criar_rascunho_agendamento`, `transferir_para_humano`.

Cada ferramenta deve ter: **schema explícito de entrada** (validado, p.ex. com
Zod); **validação no backend**; **controle de permissão e de capacidade
(módulo)**; **verificação de contexto empresarial**; **registro de auditoria**;
**resultado estruturado**; **tratamento de erro**; **limite de escopo**; e
**proteção contra execução duplicada** (idempotência) quando necessário.

## Validação e aprovação humana

- Ações críticas (confirmar pedido, criar cobrança, alterar status) são validadas
  de forma determinística e, quando exigido, dependem de confirmação humana ou do
  cliente.
- A IA nunca ativa módulos, concede permissões ou publica conhecimento.

## Base de conhecimento e ordem de confiança

Processo: a empresa envia/cadastra informação → o sistema estrutura → mostra o
conteúdo extraído → um responsável revisa → **aprova** → só então vira fonte
oficial. A IA **não** aprende automaticamente com qualquer conversa.

Ordem de confiança (maior para menor):

1. Dados em tempo real de sistemas integrados.
2. Dados estruturados e aprovados pela empresa.
3. Documentos aprovados.
4. Histórico autorizado da conversa.
5. Conhecimento geral do modelo.

## Versionamento, avaliações e rollback

- **Controle de versão** de prompts e da base de conhecimento.
- **Ambiente de teste** e **avaliações automatizadas** antes de publicar.
- **Aprovação antes da publicação** e **possibilidade de rollback**.
- Mudanças relevantes geram auditoria.

## Aprendizado supervisionado

"A IA aprende com o tempo" significa **evolução supervisionada**: o sistema pode
sugerir novas FAQs, ajustes de resposta, atualização de política, correção de
produto, mudança de fluxo ou novos casos de teste — a partir de histórico,
correções de funcionários, motivos de transferência, taxa de resolução, abandono
e erros de intenção. **Nenhuma sugestão é publicada automaticamente.**

## Conteúdo não confiável e prompt/tool injection

- Mensagens do WhatsApp e conteúdo de documentos são **não confiáveis**: nunca
  tratados como instruções administrativas ou regras de sistema.
- Separar claramente instruções do sistema de conteúdo do usuário.
- Não confiar apenas no modelo para recusar ações proibidas: a recusa é reforçada
  por autorização determinística no backend.
- Prevenir exfiltração: a IA só acessa dados do contexto empresarial autorizado.
- Ferramentas com efeito colateral exigem permissão, capacidade e idempotência.

Mais cenários em [`THREAT_MODEL.md`](THREAT_MODEL.md).

## Transferência para humano

A IA deve transferir quando: a situação foge ao escopo; há risco/ambiguidade;
o cliente pede; ou uma política exige. Ao transferir, pode gerar um resumo do
histórico para o atendente. A transferência é registrada (ator, origem, destino,
motivo).

## Auditoria da IA

Toda ação solicitada pela IA e o resultado da ferramenta são auditados
(`agent_tool_calls`, `audit_logs`), sem armazenar dados sensíveis desnecessários.
