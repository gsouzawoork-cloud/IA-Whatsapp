# MODULES.md — Módulos e capacidades

A plataforma se organiza em um **núcleo universal** (sempre presente) e
**módulos opcionais** (habilitados por empresa). O contrato tipado que
materializa esta fronteira já existe em código: [`src/core/modules.ts`](../src/core/modules.ts).

> O contrato de capacidade e a verificação pura vivem em `src/core/modules.ts`.
> Na **Fase 1 (protótipo simulado)** a navegação passou a refletir apenas os
> módulos ativos da demonstração — mas a autorização real (backend) continua
> prevista para as Fases 2+.

## Módulos ativos na demonstração (Fase 1)

A demonstração da pizzaria (Pizzaria Forno Alto) habilita os módulos opcionais
`orders`, `catalog`, `availability`, `payments`, `preparation` e `delivery`
(ver `DEMO_ENABLED_MODULES` em `src/modules/demo/navigation.ts`), além de todo o
núcleo (atendimento, conversas, clientes, configuração da IA). A navegação do
painel expõe: Visão geral, Atendimento, Pedidos, Fila de preparo, Produtos,
Clientes e Configuração da IA. Módulos não habilitados (ex.: agenda, orçamentos)
**não** aparecem na navegação. Pagamentos são **simulados dentro do pedido** —
não há gestão financeira independente. A verificação de capacidade continua
determinística; a simulação apenas antecipa como a navegação adaptável se
comportará quando a autorização real existir.

## Núcleo universal

Independente do segmento. Compõe a base da plataforma:

- Empresas e unidades da empresa
- Usuários, papéis e permissões
- Atendimento, conversas e mensagens
- Clientes e histórico do cliente
- Base de conhecimento
- Configuração da IA
- Transferência para humano
- Setores e filas de atendimento
- Histórico de alterações e auditoria
- Configurações gerais e integrações
- Controle de módulos ativos

## Módulos opcionais

Existem para permitir que a IA conclua tipos específicos de atendimento:

Pedidos · Catálogo · Produtos · Serviços · Disponibilidade · Pagamentos · Fila
de preparo · Entrega · Agenda · Profissionais · Orçamentos · Solicitações ·
Documentos · Fidelidade · Relatórios por segmento.

## Capacidades (capabilities)

Cada empresa possui um conjunto de módulos habilitados. A verificação de
capacidade é a pergunta "esta empresa tem o módulo X ativo?" e deve ser:

- **Determinística e no backend.** Nunca decidida pela IA nem pelo frontend.
- **Aplicada em todas as camadas relevantes:** navegação, rotas, serviços,
  autorização e regras de negócio — não apenas ocultar item no menu.

A função pura `isModuleEnabled(key, enabledOptionalModules)` em
[`src/core/modules.ts`](../src/core/modules.ts) é o embrião determinístico dessa
verificação: módulos do núcleo estão sempre habilitados; módulos opcionais só
quando presentes na lista de habilitados. Quando houver autenticação, a lista de
módulos virá do **contexto empresarial validado**, nunca de parâmetros do cliente.

## Matriz por segmento (exemplos conceituais)

| Módulo | Pizzaria / Delivery | Clínica | Escritório contábil |
| --- | :---: | :---: | :---: |
| Atendimento (núcleo) | ✅ | ✅ | ✅ |
| Clientes (núcleo) | ✅ | ✅ | ✅ |
| Base de conhecimento (núcleo) | ✅ | ✅ | ✅ |
| Catálogo | ✅ | — | — |
| Produtos e disponibilidade | ✅ | — | — |
| Pedidos | ✅ | — | — |
| Pagamentos | ✅ | opcional | opcional |
| Fila de preparo | ✅ | — | — |
| Entrega | ✅ | — | — |
| Serviços | — | ✅ | — |
| Profissionais | — | ✅ | — |
| Agenda | — | ✅ | ✅ |
| Solicitações | — | — | ✅ |
| Documentos | — | — | ✅ |

Uma clínica não vê estoque ou pedidos de delivery; um escritório não vê
cardápio; uma pizzaria não vê agenda médica.

## Dependências entre módulos

Regras conceituais (a formalizar quando os módulos existirem):

- **Pedidos** depende de **Catálogo** (o que pedir).
- **Disponibilidade** complementa **Catálogo** (o que pode ser oferecido/confirmado).
- **Fila de preparo** depende de **Pedidos**.
- **Entrega** depende de **Pedidos** e complementa o cálculo de taxa/prazo.
- **Pagamentos** relaciona-se a **Pedidos** (ou a outra operação cobrável), mas
  mantém status de pagamento **separado** do status operacional.
- **Agenda** depende de **Serviços** e **Profissionais**.
- **Orçamentos** depende de **Catálogo/Serviços**.

## Regras de ativação

- Módulos são sugeridos no onboarding e **confirmados por um responsável**.
- A IA nunca ativa módulos nem concede permissões.
- Ativar/desativar módulo é ação auditada.

## Regras de autorização

- Uma requisição a um recurso de módulo desativado deve ser **negada no backend**
  (não apenas ausente do menu).
- A autorização combina: papel do usuário + permissões + módulo ativo + contexto
  empresarial. Ver [`SECURITY.md`](SECURITY.md).

## Navegação adaptável

A interface renderiza navegação, páginas e ações apenas para os módulos ativos.
No desktop, a central de atendimento tende a três áreas (lista de conversas ·
mensagens · painel do cliente); no celular, a navegação é adaptada, sem tentar
mostrar as três colunas ao mesmo tempo. Ver [`ARCHITECTURE.md`](ARCHITECTURE.md)
e a seção de design em [`PRODUCT.md`](PRODUCT.md).

## Dados de módulos desativados

- Dados de um módulo desativado **não** são expostos por rotas ou serviços.
- Desativar um módulo não implica apagar dados; implica bloquear acesso conforme
  política de retenção ([`SECURITY.md`](SECURITY.md)).

## Evolução futura

Novos módulos e segmentos (comércio, oficinas, orçamentos, agendamento) entram
adicionando definições ao catálogo e implementando o domínio correspondente sob
`src/modules/<domínio>`, sem quebrar o núcleo. Módulos previstos mas ainda
conceituais (ex.: fidelidade, relatórios por segmento) serão adicionados ao
catálogo tipado quando saírem do estado puramente conceitual.
