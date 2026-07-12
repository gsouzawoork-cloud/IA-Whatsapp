# THREAT_MODEL.md — Modelo de ameaças

> Documento vivo. Conceitual nesta fase (não há sistema em execução com dados
> reais). Deve ser revisado a cada nova superfície (banco, auth, IA, WhatsApp,
> pagamentos). Complementa [`SECURITY.md`](SECURITY.md).

## Ativos

- Dados de clientes finais (telefone, WhatsApp id, endereços, mensagens).
- Dados e configuração de cada empresa (base de conhecimento, config da IA).
- Credenciais de integração (WhatsApp, IA, pagamentos, banco).
- Pedidos, pagamentos e status operacionais.
- Trilhas de auditoria.
- Disponibilidade e integridade da plataforma.

## Atores

- **Cliente final** (via WhatsApp) — potencialmente malicioso no conteúdo.
- **Usuários da empresa** (proprietário, gerente, atendente, operador).
- **Administrador interno da plataforma.**
- **Provedores externos** (WhatsApp, pagamentos, IA, banco).
- **Atacante externo** sem credenciais.
- **Insider abusivo** (funcionário da empresa ou da plataforma).

## Fronteiras de confiança

- Borda WhatsApp ↔ aplicação (mensagens não confiáveis).
- Borda navegador ↔ backend (parâmetros do cliente não confiáveis).
- Borda provedor ↔ webhooks (não confiável antes da verificação de assinatura).
- Borda modelo de IA ↔ backend (saída da IA não confiável para ações).
- Fronteira **entre empresas** (isolamento multiempresa).

## Superfícies de ataque

Webhooks (WhatsApp/pagamentos), endpoints de API, autenticação, uploads de
documentos, ferramentas da IA, painel administrativo interno, integrações e a
própria conversa (conteúdo do cliente).

## Ameaças, cenários e mitigações

Severidade (S) e Probabilidade (P): Baixa / Média / Alta.

| # | Ameaça | Cenário de abuso | S | P | Mitigações |
|---|--------|------------------|---|---|------------|
| 1 | **Vazamento entre empresas** | Requisição/consulta cruza `business_id` e lê dados de outra empresa | Alta | Média | Escopo da sessão, autorização no backend, RLS, constraints com `business_id`, testes de isolamento, auditoria |
| 2 | **Roubo de credenciais** | Segredo versionado, em log ou exposto ao navegador | Alta | Média | Sem segredos no repo; só `.env.example`; segredos no servidor; nunca em logs; rotação |
| 3 | **Prompt injection** | Mensagem/documento instrui a IA a ignorar regras ou vazar dados | Alta | Alta | Conteúdo não confiável; separação de instruções; autorização determinística no backend; escopo de dados |
| 4 | **Tool injection** | Conteúdo induz a IA a chamar ferramenta com efeito indevido | Alta | Média | Schema + validação; permissão/capacidade; contexto empresarial; idempotência; auditoria |
| 5 | **Ação não autorizada** | Usuário/IA executa ação sem permissão ou de módulo desativado | Alta | Média | Autorização por papel+permissão+módulo no backend; negar módulo desativado |
| 6 | **Webhook falso** | Terceiro envia webhook forjado de pagamento/WhatsApp | Alta | Média | Verificação de assinatura; origem; rejeição de payload inválido |
| 7 | **Replay** | Reenvio de webhook/evento válido para duplicar efeito | Alta | Média | Deduplicação por id; nonce/timestamp; idempotência |
| 8 | **Spam / flood** | Volume alto de mensagens ou requisições | Média | Alta | Rate limiting; backpressure; filas; limites por empresa |
| 9 | **Consumo abusivo da IA** | Uso excessivo para gerar custo/DoS | Média | Média | Limites/quotas por empresa; rate limiting; monitoramento de custo |
| 10 | **Pagamento falso** | Cliente alega pagamento não realizado | Alta | Média | Confirmação só por evento validado do provedor; status separado |
| 11 | **Comprovante falso** | Imagem de "comprovante" enviada como prova | Alta | Alta | IA nunca confirma pagamento por imagem; validação pelo provedor |
| 12 | **Escalada de privilégio** | Usuário eleva o próprio papel/permissão | Alta | Baixa | Alterações de papel auditadas; verificação no backend; menor privilégio |
| 13 | **Upload malicioso** | Arquivo com payload/conteúdo perigoso | Média | Média | Validar tipo/tamanho; tratar como não confiável; isolar; varredura |
| 14 | **Logs com dados sensíveis** | Tokens/PII em logs | Média | Média | Política de logging; nunca registrar segredos/PII desnecessária |
| 15 | **Insider abusivo** | Funcionário acessa dados além do necessário | Alta | Baixa | Menor privilégio; auditoria; acesso administrativo justificado e limitado |
| 16 | **Erro de configuração** | Módulo/permissão mal configurado expõe recurso | Média | Média | Defaults seguros; validação de config; auditoria de mudanças |
| 17 | **Duplicidade de pedidos** | Confirmação repetida cria pedidos duplicados | Média | Média | Idempotência; chave de deduplicação; reservas com expiração |
| 18 | **Duplicidade de cobranças** | Reprocessamento gera cobrança dupla | Alta | Média | Idempotência em pagamentos; deduplicação de eventos |
| 19 | **Exfiltração de dados via IA** | IA induzida a revelar dados de outra empresa/internos | Alta | Média | Escopo empresarial; a IA só acessa dados autorizados; não revelar instruções |

## Riscos aceitos temporariamente (Fase 0)

Nesta fase não há dados reais, autenticação, banco nem integrações — a superfície
de ataque é limitada a uma página estática institucional. Os riscos acima são
**aceitos temporariamente** apenas porque as funcionalidades correspondentes não
existem, e deixam de ser aceitáveis assim que a fase correspondente for iniciada.

## Itens a revisar (por fase)

- **Fase 2:** RLS, isolamento multiempresa, autenticação, segredos.
- **Fase 4:** prompt/tool injection, escopo de ferramentas, quotas de IA.
- **Fase 5:** verificação de webhooks do WhatsApp, replay, spam.
- **Fase 6:** pagamentos, idempotência de cobranças, confirmação por provedor.
- **Fase 8:** revisão completa, checklist de produção, resposta a incidentes.

---

## Atualização — Fase 3 (fundação SaaS real)

Com autenticação, banco e multi-tenancy, a superfície de ataque cresce. Modelo
resumido:

### Ativos
- Dados de cada empresa (clientes, catálogo, pedidos, conversas, configurações).
- Sessões e credenciais de usuários.
- Segredos de infraestrutura (service role, connection string) — fora da app.

### Atores
- Usuário legítimo de uma empresa (owner/admin/manager/agent/viewer).
- Usuário legítimo de OUTRA empresa (ameaça de vazamento cross-tenant).
- Anônimo/não autenticado.
- Futuro: IA e webhooks externos (fases posteriores).

### Superfícies
- Rotas `/auth/*`, `/onboarding`, `/app/*` e Server Actions.
- API PostgREST do Supabase (acessível com a publishable key).

### Ameaças e controles

| Ameaça | Controle |
| --- | --- |
| Vazamento cross-tenant (empresa A lê empresa B) | RLS em todas as tabelas; funções `SECURITY DEFINER` sem recursão; ver `MULTI_TENANCY.md` |
| IDOR por UUID | RLS exige membership; conhecer o ID não basta |
| Escalada de privilégio | Trigger anti-auto-elevação; escrita de membership só owner/admin |
| Mass assignment | Allowlists explícitas de campos nas atualizações |
| "Migração" de registro entre empresas | Trigger de imutabilidade de `organization_id` |
| Manipulação de total/frete no navegador | Recalculados no servidor a partir do banco |
| Exposição de segredo | Apenas `NEXT_PUBLIC_*` no cliente; service role nunca usada pela app |
| Vazamento em logs | Sanitização de metadados de auditoria |
| Enumeração de contas | Mensagens genéricas em login/recuperação |

### Riscos remanescentes (honestos)
- **Rate limiting** ainda não implementado (login, recuperação) — documentado
  em `SECURITY_LEARNING_NOTES.md`; depende da fase de webhooks/IA.
- **Testes de RLS (pgTAP)** criados mas não executados neste ambiente.
- **CSP/headers** de segurança ainda não endurecidos — item de fase de produção.
- O sistema **não** é certificado nem invulnerável; esta é uma fundação.
