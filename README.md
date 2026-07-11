# IA WhatsApp

Central inteligente de atendimento por inteligência artificial conectada ao
WhatsApp — uma plataforma **SaaS multiempresa** onde a IA atende clientes,
organiza solicitações e apoia a operação, com controle humano e módulos que se
adaptam a cada negócio.

## Proposta

A empresa conecta seu WhatsApp, ensina como seu negócio funciona e passa a usar
uma plataforma centralizada onde a inteligência artificial atende clientes,
enquanto a equipe acompanha tudo, assume conversas quando necessário e habilita
apenas os módulos de que precisa (pedidos, catálogo, agenda, orçamentos, etc.).

O WhatsApp é o **canal**. A plataforma é a **central de operação** da empresa.

> O produto **não** é um chatbot: é uma central de atendimento e operação em que
> a IA interpreta necessidades, consulta informações oficiais e usa ferramentas
> controladas pela aplicação — que valida e executa cada ação.

## Estado atual

**Fase 0 — Fundação.** Este repositório contém apenas a fundação técnica e
documental: o projeto Next.js inicializado, a estrutura modular mínima, uma
página institucional e a documentação completa da visão do produto.

**Ainda não há** banco de dados, autenticação, dashboard, conversas, pedidos,
integração com WhatsApp, Claude API ou pagamentos. Nada disso foi implementado —
apenas documentado. Veja [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Stack

- [Next.js](https://nextjs.org) 16 (App Router)
- React 19
- TypeScript (modo `strict`)
- Tailwind CSS v4
- ESLint 9 (flat config, `eslint-config-next`)
- npm

## Requisitos

- Node.js 20+ (validado com Node 22)
- npm 10+

## Instalação

```bash
npm install
```

## Execução

```bash
npm run dev      # ambiente de desenvolvimento (http://localhost:3000)
npm run build    # build de produção
npm run start    # serve o build de produção
```

## Qualidade

```bash
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit (TypeScript strict)
npm run build      # build completo (inclui verificação de tipos)
```

## Estrutura resumida

```
src/
  app/                 # App Router: layout, página institucional, estilos globais
  components/
    layout/            # cabeçalho e rodapé institucionais
    ui/                # componentes de apresentação reutilizáveis
  core/                # fundação transversal (contrato de módulos e capacidades)
  lib/                 # configuração e utilitários da aplicação
  types/               # tipos compartilhados
docs/                  # documentação de produto, arquitetura e segurança
```

Os domínios de negócio (conversas, pedidos, catálogo, etc.) viverão sob
`src/modules/<domínio>` quando forem implementados. Eles ainda **não** existem
como código e por isso a pasta não foi criada — consulte
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## O que está implementado

- Projeto Next.js com TypeScript strict, Tailwind e ESLint
- Script explícito de `typecheck`
- Estrutura inicial mínima do monólito modular
- Contrato tipado de módulos e uma verificação de capacidade pura
- Página institucional simples e responsiva (pt-BR)
- Documentação completa da visão do produto

## O que ainda NÃO está implementado

Banco de dados · autenticação · RLS · dashboard · conversas · clientes ·
pedidos · produtos · disponibilidade · pagamentos · Claude API · WhatsApp Cloud
API · webhooks · RAG/embeddings · upload de documentos · onboarding · realtime ·
notificações · relatórios · PWA · testes automatizados · deploy.

> **Aviso:** nenhuma integração externa existe neste repositório. Não há
> credenciais versionadas. O arquivo [`.env.example`](.env.example) apenas
> documenta variáveis previstas para fases futuras.

## Documentação

| Documento | Conteúdo |
| --- | --- |
| [`docs/PRODUCT.md`](docs/PRODUCT.md) | Problema, visão, princípios, público, MVP e escopo |
| [`docs/USER_FLOWS.md`](docs/USER_FLOWS.md) | Fluxos conceituais de empresa, atendimento e pizzaria |
| [`docs/MODULES.md`](docs/MODULES.md) | Núcleo universal, módulos opcionais e capacidades |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Monólito modular, camadas, domínios e fronteiras |
| [`docs/DATABASE.md`](docs/DATABASE.md) | Modelo conceitual de dados (sem migrations) |
| [`docs/AI_GOVERNANCE.md`](docs/AI_GOVERNANCE.md) | Papel, limites e governança da IA |
| [`docs/SECURITY.md`](docs/SECURITY.md) | Princípios e requisitos de segurança |
| [`docs/THREAT_MODEL.md`](docs/THREAT_MODEL.md) | Ativos, ameaças e mitigações |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Fases 0 a 8 com critérios de conclusão |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | Registro de decisões arquiteturais |
| [`CLAUDE.md`](CLAUDE.md) | Regras de trabalho para agentes neste repositório |

## Licença

Projeto privado. Todos os direitos reservados.
