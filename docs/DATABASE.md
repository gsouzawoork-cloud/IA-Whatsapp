# DATABASE.md — Modelo conceitual de dados

> **Sem banco e sem migrations nesta fase.** Este documento descreve o modelo
> **conceitual** para orientar decisões. Nenhuma tabela, schema ou migration foi
> criada. O banco previsto é PostgreSQL (via Supabase), com Row Level Security.

## Princípios

- **Multiempresa por padrão:** toda entidade de empresa carrega `business_id`
  (ou vínculo equivalente obrigatório). O isolamento é validado no backend e,
  futuramente, reforçado por RLS, índices e constraints.
- **Minimização de dados:** só armazenar o necessário. Não persistir informações
  sensíveis só porque foram mencionadas em uma conversa.
- **Separação de status:** status operacional (ex.: do pedido) é separado do
  status de pagamento.
- **Idempotência:** operações críticas (pedidos, cobranças, webhooks) usam
  chaves de idempotência / deduplicação.
- **Auditoria:** ações relevantes registradas em `audit_logs`.

## Convenções conceituais

Campos comuns previstos por entidade: `id`, `business_id` (quando aplicável),
`created_at`, `updated_at` e, quando fizer sentido, `created_by`. Exclusões
sensíveis tendem a ser lógicas (soft delete) conforme política de retenção.

## Entidades conceituais

Para cada entidade: objetivo · escopo · relações principais · vínculo com a
empresa · dados sensíveis · invariantes.

### Identidade e organização

- **businesses** — a empresa (tenant). Objetivo: raiz do isolamento
  multiempresa. Escopo: global. Relações: possui unidades, usuários, módulos,
  clientes, conversas, etc. Vínculo: é a própria empresa. Sensível: dados
  cadastrais. Invariante: tudo que pertence à empresa referencia seu `id`.
- **business_units** — unidades/filiais. Vínculo: `business_id`. Relações:
  endereços, horários, filas. Invariante: pertence a exatamente uma empresa.
- **business_users** — vínculo usuário↔empresa (um usuário pode participar de
  várias empresas). Vínculo: `business_id` + `user_id`. Sensível: papel/acesso.
  Invariante: define o contexto empresarial ativo possível para o usuário.
- **roles** — papéis (proprietário, gerente, atendente, operador, etc.).
  Escopo: por empresa (ou template global). Vínculo: `business_id`.
- **permissions** — permissões atômicas. Escopo: catálogo. Relação: N:N com
  roles via `role_permissions`.
- **role_permissions** — associação papel↔permissão. Vínculo: `business_id`
  (quando papéis são por empresa). Invariante: sem duplicidade papel+permissão.
- **business_modules** — módulos ativos por empresa. Vínculo: `business_id`.
  Invariante: fonte da verificação de capacidade; núcleo sempre ativo.
- **departments** — setores. Vínculo: `business_id`. Relação: filas, usuários.
- **queues** — filas de atendimento. Vínculo: `business_id`. Relação: setor,
  conversas.

### Atendimento (núcleo)

- **customers** — cliente final. Vínculo: `business_id`. Sensível: telefone,
  identificador de WhatsApp, nome, preferências, consentimentos. Invariante:
  minimização; um cliente por empresa (mesma pessoa em empresas distintas são
  registros distintos). Relações: endereços, conversas, pedidos, solicitações.
- **customer_addresses** — endereços autorizados do cliente. Vínculo:
  `business_id` + `customer_id`. Sensível: endereço/geolocalização. Invariante:
  só endereços autorizados pelo cliente.
- **conversations** — a conversa. Vínculo: `business_id` + `customer_id`.
  Relação: mensagens, atribuições, notas, solicitações/pedidos. Invariante:
  estado segue a máquina de estados da aplicação (nova → … → encerrada).
- **conversation_assignments** — atribuição/responsável e transferências.
  Vínculo: `business_id` + `conversation_id`. Sensível: quem assumiu/transferiu.
  Invariante: registra ator, origem e destino de cada transição.
- **messages** — mensagens recebidas/enviadas (texto, áudio, imagem,
  localização, anexos). Vínculo: `business_id` + `conversation_id`. Sensível:
  conteúdo do cliente. Invariante: imutável após registro; deduplicada por id do
  provedor.
- **internal_notes** — notas internas da equipe. Vínculo: `business_id` +
  `conversation_id`. Sensível: visível só à equipe autorizada.

### Conhecimento e IA

- **knowledge_documents** — fontes de conhecimento (FAQ, políticas, cardápios,
  PDFs, textos, links). Vínculo: `business_id`. Sensível: conteúdo interno.
  Invariante: só conteúdo **aprovado** vira fonte oficial da IA.
- **knowledge_versions** — versões da base de conhecimento. Vínculo:
  `business_id` + `knowledge_document_id`. Invariante: versionado; publicação
  exige aprovação; permite rollback.
- **agent_settings** — configuração da IA (nome, tom, objetivos, ações
  permitidas/proibidas, limites). Vínculo: `business_id`. Invariante: a IA não
  edita a própria configuração.
- **agent_setting_versions** — versões da configuração da IA. Vínculo:
  `business_id`. Invariante: mudanças relevantes geram auditoria; permite rollback.
- **agent_tool_calls** — registro de ferramentas solicitadas pela IA e seus
  resultados. Vínculo: `business_id` + `conversation_id`. Sensível: argumentos e
  resultados. Invariante: toda chamada validada no backend; idempotente quando
  crítica.

### Operação — módulos opcionais

- **products** — produtos do catálogo. Vínculo: `business_id`. Relação:
  variantes, disponibilidade, itens de pedido. Invariante: preço é determinístico
  (nunca definido pela IA).
- **product_variants** — variações (tamanho, borda, adicionais). Vínculo:
  `business_id` + `product_id`.
- **product_availability** — disponibilidade por produto/variante (sempre
  disponível · manual · quantidade controlada). Vínculo: `business_id`.
  Invariante: **não é ERP de estoque**; confirmação acima da quantidade é
  bloqueada; quantidade zero → indisponível; reservas temporárias expiram.
- **orders** — pedidos. Vínculo: `business_id` + `customer_id` (+ `conversation_id`,
  `business_unit_id`). Sensível: endereço, valores. Invariante: status
  operacional separado do status de pagamento; número legível; total calculado
  pelo backend; criação/confirmação só pelo backend.
- **order_items** — itens do pedido (quantidade, variação, adicionais,
  observações, preço no momento). Vínculo: `business_id` + `order_id`.
- **order_status_history** — histórico de status/horários por etapa. Vínculo:
  `business_id` + `order_id`. Invariante: registra ator e transição.
- **payments** — pagamentos. Vínculo: `business_id` (+ `order_id` quando
  aplicável). Sensível: **nunca** dados completos de cartão. Invariante: status
  próprio; cartão via checkout do provedor; sem dados sensíveis armazenados.
- **payment_events** — eventos de pagamento (webhooks do provedor). Vínculo:
  `business_id` + `payment_id`. Invariante: validados por assinatura;
  deduplicados; protegidos contra replay.
- **appointments** — agendamentos. Vínculo: `business_id` + `customer_id`.
  Relação: serviços/profissionais. Invariante: disponibilidade determinística.
- **quotes** — orçamentos. Vínculo: `business_id` + `customer_id`. Invariante:
  valores calculados/aprovados pela aplicação.

### Transversais

- **integrations** — integrações externas configuradas por empresa. Vínculo:
  `business_id`. Sensível: **credenciais nunca no navegador**; segredos em cofre
  do servidor, nunca em texto claro no cliente.
- **webhook_events** — eventos recebidos de provedores (WhatsApp, pagamentos).
  Vínculo: `business_id` quando resolúvel. Invariante: idempotentes,
  deduplicados por id do provedor, protegidos contra replay; validados por
  assinatura antes de processar.
- **audit_logs** — trilha de auditoria. Vínculo: `business_id`. Campos: empresa,
  usuário, ação, recurso, data, resultado, origem, metadados mínimos. Invariante:
  **não** armazenar dados sensíveis desnecessários.

## Relações principais (resumo)

```
businesses 1─* business_units
businesses 1─* business_users *─1 users(auth)
businesses 1─* business_modules
businesses 1─* customers 1─* customer_addresses
customers  1─* conversations 1─* messages
conversations 1─* conversation_assignments
conversations 1─* internal_notes
conversations 1─* agent_tool_calls
businesses 1─* knowledge_documents 1─* knowledge_versions
businesses 1─1 agent_settings 1─* agent_setting_versions
businesses 1─* products 1─* product_variants
products   1─* product_availability
businesses 1─* orders 1─* order_items
orders     1─* order_status_history
orders     1─* payments 1─* payment_events
businesses 1─* appointments
businesses 1─* quotes
businesses 1─* integrations
businesses 1─* webhook_events
businesses 1─* audit_logs
```

## Escopo empresarial e RLS (estratégia futura)

- Toda tabela de empresa terá `business_id` **not null** e índice.
- RLS restringirá cada linha ao contexto empresarial da sessão autenticada.
- Constraints/índices únicos considerarão `business_id` (ex.: número de pedido
  único **por empresa**).
- Testes de isolamento garantirão que nenhuma consulta cruze empresas.

## Dados sensíveis (destaques)

Telefone e identificador de WhatsApp, endereços, conteúdo de mensagens,
documentos internos, credenciais de integração e eventos de pagamento. Aplicar
minimização, controle de acesso por papel e retenção definida em
[`SECURITY.md`](SECURITY.md). **Nunca** armazenar dados completos de cartão.

## Invariantes globais

1. Nada pertencente a uma empresa é legível/gravável fora do seu contexto.
2. Preço, disponibilidade, total, taxa e status são determinísticos (backend).
3. Operações críticas são idempotentes.
4. Conteúdo da IA só se torna oficial após aprovação humana.
5. Auditoria não guarda segredos nem dados sensíveis desnecessários.
