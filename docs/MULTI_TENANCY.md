# Multi-tenancy — isolamento entre empresas

Cada empresa cliente é um **tenant** (`organizations`). O isolamento é a
propriedade de segurança mais importante desta fase: **nenhum usuário de uma
empresa pode ler, alterar ou inferir dados de outra**.

## Conceitos

- **organization** — a empresa cliente do SaaS (o tenant).
- **unit** — filial/unidade operacional de uma organização.
- **membership** — vínculo `usuário ↔ organização` com papel e situação.
- **membership_unit_access** — unidades que um membership pode acessar
  (owner/admin acessam todas; demais papéis, apenas as concedidas).

## `organization_id` em toda tabela de empresa

Toda tabela com dados de empresa carrega `organization_id uuid not null`. Tabelas
por unidade carregam também `unit_id`. Esses campos são **imutáveis**: um trigger
(`app_private.forbid_org_change`) impede alterar `organization_id` em `UPDATE` —
ninguém "migra" um registro de uma empresa para outra.

## Row Level Security (RLS)

RLS está **habilitada em todas as tabelas públicas** com dados de usuários ou
empresas (`0012_rls_policies.sql`). Não há policies universais (`USING (true)`).
Cada operação (SELECT/INSERT/UPDATE/DELETE) tem uma policy explícita que exige:

1. **membership ativo** na organização — via `app_private.is_active_member`;
2. quando aplicável, **acesso à unidade** — via `app_private.can_access_unit`;
3. para escrita, o **papel adequado** — via `app_private.has_org_role`.

### Por que as funções auxiliares são `SECURITY DEFINER`

As policies precisam consultar `organization_memberships` para saber o papel do
usuário. Se fizessem isso com um subselect direto na própria tabela protegida,
criariam **recursão de RLS**. Em vez disso, chamam funções `SECURITY DEFINER`
(que rodam com privilégio do dono e **ignoram RLS**), com `search_path` fixo.
Elas vivem no schema privado `app_private`, **não exposto** pela API REST.

## Ataques impedidos (exemplos)

| Ataque | Por que falha |
| --- | --- |
| Empresa A consulta `organizations` da empresa B | SELECT exige `is_active_member(id)` → 0 linhas |
| Inserir produto com `organization_id` de outra empresa | `WITH CHECK` do INSERT falha (não é membro) |
| Trocar `organization_id` de um registro para "migrar" dado | Trigger de imutabilidade lança `42501` |
| Agent altera preço de produto | Policy de escrita de `products` exige owner/admin/manager |
| Viewer atualiza um pedido | Viewer não tem papel de operação → escrita negada |
| Usuário eleva o próprio papel | Trigger `forbid_self_role_change` bloqueia |
| Usuário suspenso continua acessando | `is_active_member` exige `status = 'active'` |
| Manipular `organization_id` no navegador / chamar a API direto | A RLS valida no banco, independentemente do cliente |

## Frontend nunca é autorização

Esconder um item de menu **não** é segurança. A navegação é derivada de módulos
(`src/core/navigation/app-nav.ts`) apenas para UX. Toda leitura/escrita real
passa pela RLS. O cookie de "empresa/unidade ativa" apenas seleciona entre
opções já autorizadas; a resolução server-side revalida.

## Criação transacional da empresa

`create_organization_with_owner` (`0011_functions.sql`) cria empresa + owner +
unidade + módulos + configurações + progresso do onboarding em **uma
transação** (tudo ou nada). O `owner` é sempre `auth.uid()` — o cliente não
escolhe. É `SECURITY DEFINER` com `search_path` fixo e concedida apenas a
`authenticated`.
