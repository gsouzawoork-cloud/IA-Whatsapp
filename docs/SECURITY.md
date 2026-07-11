# SECURITY.md — Segurança

Segurança é **requisito funcional** desde a fundação. Este documento define os
princípios e requisitos que a implementação deverá cumprir. Nada aqui está
implementado nesta fase; serve como contrato de segurança para as fases futuras.
As ameaças correspondentes estão em [`THREAT_MODEL.md`](THREAT_MODEL.md).

## Princípios

- **Menor privilégio** em todos os níveis (usuários, papéis, IA, serviços).
- **Isolamento multiempresa** validado no backend, em todas as camadas.
- **Defesa em profundidade:** autorização + capacidade de módulo + RLS + validação.
- **Não confiar no cliente:** frontend nunca é fonte de autorização ou de escopo.
- **Segurança por padrão:** o caminho fácil é o caminho seguro.

## Autenticação

- Autenticação via provedor (Supabase Auth, previsto na Fase 2).
- Sessões seguras; expiração e renovação controladas.
- Sem credenciais no repositório; segredos apenas no servidor.

## Autorização

- Baseada em **papel + permissões + módulo ativo + contexto empresarial**.
- Verificada no backend em cada requisição — nunca apenas no menu/rota do cliente.
- Recurso de módulo desativado → **negado** no backend.

## Multiempresa

- Toda entidade de empresa carrega `business_id` (ou vínculo equivalente).
- Escopo derivado da **sessão autenticada** e da associação usuário↔empresa.
- Reforço por **Row Level Security**, índices/constraints com `business_id` e
  **testes de isolamento**. Ver [`DATABASE.md`](DATABASE.md).
- **Nunca** confiar em parâmetro de empresa enviado pelo cliente sem validação.

## Segredos

- **Nunca** versionar credenciais; apenas `.env.example` (vazio).
- **Nunca** expor segredos ao navegador; só `NEXT_PUBLIC_*` vai ao cliente e
  jamais contém segredo.
- Segredos de integração em cofre do servidor; **nunca** em logs.
- Rotação de chaves prevista para credenciais sensíveis.

## APIs

- Validação de entrada em toda borda (schemas, p.ex. Zod).
- **Rate limiting** e proteção contra abuso.
- **Idempotência** em operações críticas (pedidos, cobranças).
- Respostas de erro sem vazar detalhes internos.

## Webhooks

- **Verificar assinatura** antes de processar (WhatsApp, pagamentos).
- **Deduplicar** por id do provedor; **proteger contra replay** (timestamp/nonce).
- Processamento idempotente; eventos persistidos em `webhook_events`.

## Uploads

- Validar tipo/tamanho; tratar como conteúdo **não confiável**.
- Nunca executar/embutir conteúdo de arquivo como regra do sistema.
- Isolar armazenamento por empresa; varredura antes de uso quando aplicável.

## Logs

- **Nunca** registrar tokens, segredos ou dados sensíveis desnecessários.
- Auditoria com metadados mínimos (empresa, usuário, ação, recurso, resultado,
  origem). Ver [`DATABASE.md`](DATABASE.md).

## Pagamentos

- Cartão apenas via **checkout do provedor**; nunca coletar dados completos de
  cartão na conversa nem armazená-los.
- Confirmação de pagamento **somente** por evento validado do provedor — nunca
  por comprovante em imagem.
- Idempotência para evitar cobrança/pedido duplicado.

## IA

- A IA **solicita**; o backend **valida e executa**. Ver
  [`AI_GOVERNANCE.md`](AI_GOVERNANCE.md).
- Não confiar apenas no modelo para recusar ações proibidas.
- Mensagens/documentos são não confiáveis (prompt/tool injection).
- Ferramentas com efeito colateral exigem permissão, capacidade e idempotência.

## LGPD e privacidade

- **Minimização de dados:** coletar/armazenar apenas o necessário.
- Base legal e **consentimento** quando aplicável.
- Direitos do titular (acesso, correção, exclusão) previstos.
- Controle de acesso a dados do cliente por papel.

## Retenção, exclusão e backup

- Políticas de **retenção** por tipo de dado; exclusão lógica para dados
  sensíveis quando exigido.
- Backups protegidos e testados; escopo empresarial preservado.
- Desativar módulo bloqueia acesso, sem necessariamente apagar dados.

## Resposta a incidentes

- Processo definido: detecção, contenção, erradicação, recuperação e
  comunicação.
- Trilhas de auditoria dão suporte à investigação.
- Revisão pós-incidente alimenta o modelo de ameaças.

## Checklist antes de produção

- [ ] RLS ativa e testada para todas as tabelas de empresa.
- [ ] Testes de isolamento multiempresa passando.
- [ ] Autorização por papel + permissão + módulo verificada no backend.
- [ ] Nenhum segredo no repositório ou exposto ao navegador.
- [ ] Webhooks com verificação de assinatura, deduplicação e anti-replay.
- [ ] Rate limiting nas bordas públicas.
- [ ] Idempotência em pedidos e pagamentos.
- [ ] Ações da IA validadas no backend; ferramentas com permissão/capacidade.
- [ ] Logs sem dados sensíveis; auditoria cobrindo ações relevantes.
- [ ] Pagamentos via checkout do provedor; sem dados de cartão armazenados.
- [ ] Políticas de retenção/exclusão e backups definidos e testados.
- [ ] Plano de resposta a incidentes documentado.
