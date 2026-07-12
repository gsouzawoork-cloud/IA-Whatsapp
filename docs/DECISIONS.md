# DECISIONS.md — Registro de decisões (ADRs)

Formato: Decisão · Contexto · Alternativas · Escolha · Motivo · Consequências ·
Status.

---

## ADR-001 — Monólito modular

- **Contexto:** produto novo, equipe enxuta, domínios ainda em formação.
- **Alternativas:** microserviços; monólito não modular.
- **Escolha:** monólito modular (uma app, limites claros entre domínios).
- **Motivo:** simplicidade operacional e velocidade, preservando fronteiras para
  extração futura sem pagar o custo de sistemas distribuídos agora.
- **Consequências:** disciplina de dependências entre camadas/domínios; extração
  de serviços só sob critérios objetivos ([`ARCHITECTURE.md`](ARCHITECTURE.md)).
- **Status:** aceita.

## ADR-002 — Next.js (App Router)

- **Contexto:** precisamos de front e backend leves na mesma base, com boa DX.
- **Alternativas:** SPA + API separada; outro framework full-stack.
- **Escolha:** Next.js 16 com App Router.
- **Motivo:** full-stack coeso, roteamento moderno, ecossistema maduro.
- **Consequências:** o **domínio** não deve depender de Next.js; a apresentação
  passa pela camada de aplicação.
- **Status:** aceita.

## ADR-003 — TypeScript strict

- **Contexto:** segurança e manutenibilidade desde o início.
- **Alternativas:** TypeScript sem strict; JavaScript.
- **Escolha:** TypeScript `strict` (+ `noUncheckedIndexedAccess`,
  `noImplicitOverride`, `noFallthroughCasesInSwitch`).
- **Motivo:** capturar erros cedo; contratos explícitos.
- **Consequências:** sem `any` injustificado, sem `@ts-ignore`; script
  `typecheck` obrigatório.
- **Status:** aceita.

## ADR-004 — Atendimento como núcleo

- **Contexto:** risco de virar um ERP genérico.
- **Alternativas:** tratar todos os recursos como iguais.
- **Escolha:** atendimento (conversas, clientes, conhecimento, IA, transferência,
  histórico) é o núcleo universal.
- **Motivo:** é a base comum a todo segmento; foco no valor central.
- **Consequências:** demais recursos são módulos opcionais separados.
- **Status:** aceita.

## ADR-005 — Módulos opcionais e verificação de capacidade

- **Contexto:** segmentos diferentes precisam de recursos diferentes.
- **Alternativas:** um produto fixo por segmento; tudo sempre ligado.
- **Escolha:** módulos opcionais habilitados por empresa, com verificação de
  capacidade determinística no backend.
- **Motivo:** a plataforma se adapta ao negócio; evita expor recursos irrelevantes.
- **Consequências:** módulo desativado é bloqueado em autorização/rotas/serviços,
  não só no menu. Contrato inicial em [`src/core/modules.ts`](../src/core/modules.ts).
- **Status:** aceita.

## ADR-006 — Disponibilidade simplificada (não é ERP)

- **Contexto:** a IA precisa saber o que pode oferecer/confirmar.
- **Alternativas:** módulo completo de estoque (custo médio, fornecedores, curva ABC).
- **Escolha:** três modos — sempre disponível, manual, quantidade controlada.
- **Motivo:** simplicidade operacional; evita superdimensionamento.
- **Consequências:** sem estoque industrial/fiscal; backend valida na confirmação;
  reservas temporárias expiram; operações idempotentes.
- **Status:** aceita.

## ADR-007 — Sem microserviços na fundação

- **Contexto:** complexidade distribuída não se justifica agora.
- **Alternativas:** microserviços desde o início.
- **Escolha:** adiar; manter monólito modular.
- **Motivo:** custo operacional alto sem benefício atual.
- **Consequências:** extração futura condicionada a critérios objetivos.
- **Status:** aceita.

## ADR-008 — Sem integrações externas na Fase 0

- **Contexto:** fundação deve ser hermética e segura.
- **Alternativas:** já preparar SDKs/conexões de banco, IA, WhatsApp, pagamentos.
- **Escolha:** nenhuma integração; `.env.example` apenas documenta variáveis
  futuras (vazias). A página institucional usa fontes do sistema para não
  depender de rede em build.
- **Motivo:** evitar "preparação" especulativa e superfície de ataque prematura.
- **Consequências:** integrações entram nas fases correspondentes do roadmap.
- **Status:** aceita.

## ADR-009 — IA sem acesso direto ao banco

- **Contexto:** a IA não é a fonte da verdade.
- **Alternativas:** dar à IA acesso amplo a dados/ações.
- **Escolha:** a IA age apenas por ferramentas com schema, validação, permissão,
  capacidade, contexto empresarial, auditoria e idempotência.
- **Motivo:** segurança, determinismo e controle humano.
- **Consequências:** o backend valida e executa; a IA interpreta e solicita. Ver
  [`AI_GOVERNANCE.md`](AI_GOVERNANCE.md).
- **Status:** aceita.

## ADR-010 — Multiempresa preparada conceitualmente

- **Contexto:** SaaS multiempresa desde a visão.
- **Alternativas:** adicionar multiempresa depois.
- **Escolha:** preparar conceitualmente desde já (documentação e contrato de
  módulos), implementar isolamento na Fase 2 (RLS + escopo + testes).
- **Motivo:** decisões atuais não podem inviabilizar o isolamento futuro.
- **Consequências:** toda entidade de empresa terá `business_id`; escopo derivado
  da sessão; nunca confiar em parâmetro do cliente.
- **Status:** aceita.

## ADR-011 — `src/modules/` não criado vazio na Fase 0

- **Contexto:** a estrutura sugerida inclui `modules/`, mas nenhum domínio é
  implementado nesta fase.
- **Alternativas:** criar a pasta vazia ou com placeholders fictícios.
- **Escolha:** não criar `src/modules/` ainda; manter o contrato de módulos em
  `src/core/modules.ts` e documentar que domínios virão sob `src/modules/<domínio>`.
- **Motivo:** a própria tarefa proíbe pastas vazias e interfaces fictícias.
- **Consequências:** o diretório de domínios nasce com o primeiro domínio (Fase 3).
- **Status:** aceita.

## ADR-012 — Estado da demonstração com Context + `useReducer` (Fase 1)

- **Contexto:** o protótipo simulado precisa de estado compartilhado e reativo
  (conversas, pedidos, disponibilidade) sem backend.
- **Alternativas:** Zustand/Redux/Jotai; estado local espalhado por página.
- **Escolha:** React Context + `useReducer`, com reducer raiz delegando a
  sub-reducers coesos por domínio (`conversations`, `orders`, `catalog`, `agent`).
- **Motivo:** recursos nativos bastam; evita dependência de estado global e mantém
  as fronteiras de domínio. O reducer é puro (recebe `meta` com horário/id gerados
  na borda), o que o torna determinístico e testável.
- **Consequências:** feedback de ações é determinístico (campo no estado) e a
  interface o traduz em toasts. `src/modules/demo/state/` separa estado, ações,
  reducer, seletores, métricas e persistência.
- **Status:** aceita.

## ADR-013 — Dados simulados centralizados e regras puras de domínio (Fase 1)

- **Contexto:** o protótipo exige dados realistas e regras determinísticas (preço,
  total, disponibilidade, transições) fora dos componentes.
- **Alternativas:** arrays dentro de componentes; lógica em JSX.
- **Escolha:** dados em `src/data/demo/` (fonte `readonly`, cópia mutável via
  `structuredClone`); regras puras em `src/modules/<domínio>/domain`, tipadas e
  testadas com Vitest.
- **Motivo:** separação interface × regra de negócio; as mesmas fronteiras da versão
  real (backend valida/calcula) são respeitadas na simulação.
- **Consequências:** 50 testes cobrem disponibilidade, pedidos, pagamento, fila e
  conversas. A IA simulada apenas consulta/solicita — nunca decide preço/estoque.
- **Status:** aceita.

## ADR-014 — Persistência local opcional com `localStorage` (Fase 1)

- **Contexto:** manter a demonstração após recarregar a página, sem banco.
- **Alternativas:** somente estado de sessão (memória).
- **Escolha:** persistir os dados em `localStorage` (chave com namespace e versão),
  com validação de formato e fallback aos dados iniciais; botão "Restaurar
  demonstração" limpa e recarrega.
- **Motivo:** melhora a experiência de teste sem introduzir backend.
- **Consequências:** persistência é best-effort (falhas de cota toleradas); nada
  sensível é gravado; hidratação ocorre só no cliente para evitar divergência.
- **Status:** aceita.

## ADR-015 — Limite Client/Server e dependências da Fase 1

- **Contexto:** o painel é interativo e compartilha estado em memória; a página
  institucional e o layout raiz não precisam de interação.
- **Alternativas:** tudo Client; ou forçar Server onde exigiria contornos.
- **Escolha:** `/` e `/demo` e o layout raiz permanecem Server Components; a subárvore
  `/app/*` é um limite Client (envolta pelo `DemoProvider`). Dependências adicionadas:
  `lucide-react` (ícones, consistência visual) e `vitest` (testes de regras puras) —
  ambas permitidas pelo escopo.
- **Motivo:** manter o máximo de conteúdo estático, isolando a interatividade do
  protótipo em um provider único. Valores monetários trafegam em centavos (inteiros)
  para cálculos determinísticos.
- **Consequências:** a demonstração roda no cliente; a Fase 2 substituirá o estado em
  memória por persistência real com isolamento multiempresa.
- **Status:** aceita.

## ADR-016 — Redesign visual premium da central operacional (Fase 1)

- **Contexto:** a interface funcional da Fase 1 estava chapada, com pouca
  profundidade e hierarquia fraca — parecia uma ferramenta interna, não uma
  plataforma SaaS premium. Refatoração puramente visual, sem alterar lógica.
- **Direção visual:** central operacional escura, tecnológica e tridimensional;
  profundidade por camadas e contraste, não por sombras pesadas uniformes.
- **Sistema de tokens (`globals.css`, Tailwind v4 `@theme`):** superfícies em quatro
  níveis (`app` → `surface-1/2/3` → `surface-active`), bordas graduadas
  (`subtle`/`line`/`strong`), texto hierárquico (`hi`/`mid`/`low`/`dim`), acento
  verde-azulado seletivo (`accent`) e semânticos (`ok`/`warn`/`bad`/`info`).
  Substitui hexadecimais espalhados por utilitários (`bg-surface-2`, `text-mid`, …).
- **Profundidade/elevação:** sombras multicamada em três níveis
  (`--shadow-low/medium/high`) expostas como `.elev-low/medium/high`; painéis
  `.panel` (Nível 2) e `.panel-priority` (Nível 3, com luz interna) para elementos
  prioritários; canvas `.app-canvas` com iluminação radial discreta. Sem glow global.
- **Tipografia:** Manrope (variável) via `next/font/google` — auto-hospedada no
  build, **sem arquivos de fonte no repositório** e sem requisição em runtime;
  exposta como `--font-manrope` e consumida pelo token `--font-sans`. Escala de
  pesos fortes com `tabular-nums` para números/KPIs (`.t-page-title`, `.t-kpi`, …).
- **Identidade dupla:** marca da plataforma (`PlatformBrand` — "Central IA") separada
  da empresa conectada (cápsula da Pizzaria Forno Alto) na sidebar.
- **Responsividade:** grid de três áreas no atendimento (desktop), drawer de contexto
  no mobile; tabelas com container de rolagem próprio; navegação inferior no celular.
- **Microinterações:** hover elevando 1–2px, transições de 150–200ms, entradas de
  drawer/overlay por keyframes CSS; `prefers-reduced-motion` encurta todas as durações.
- **Acessibilidade:** foco visível baseado no acento, selos com ponto além da cor,
  switches/tabs como botões reais, drawers com `aria-modal`/foco, alvos de toque
  adequados; contraste elevado sobre o fundo escuro.
- **Dependências:** adicionada `next/font` (Manrope, sem custo de runtime); `lucide-react`
  reutilizada. Nenhuma biblioteca de UI, animação, gráficos ou tabelas foi adicionada.
- **Preservação:** rotas, estado, reducers, seletores, regras de domínio, dados
  simulados e os 50 testes permanecem intactos — nenhuma lógica foi alterada.
- **Status:** aceita.

## ADR-017 — Elevação para experiência enterprise de IA (Fase 1)

- **Contexto:** o dark premium ainda lembrava um dashboard escuro genérico — pouca
  atmosfera, elevação discreta e ausência de motion. Objetivo: percepção de produto
  enterprise de IA, sem alterar lógica nem adicionar dependências pesadas.
- **Atmosfera ambiental:** `.app-canvas` combina base grafite verde-petróleo,
  halos radiais (verde + teal), grade de pontos técnica quase imperceptível e
  vinheta — tudo em camadas de background CSS estáticas (sem custo de runtime).
- **Superfícies tingidas:** tokens de superfície ganharam leve tom verde-petróleo
  (fim do "preto chapado"); cinco níveis de profundidade e novo `.card-object`
  (Nível 3) além de `.panel`/`.panel-priority`.
- **Sombras:** cinco níveis (`--shadow-ambient/low/medium/high` + `--glow-accent`),
  com brilho interno; aplicadas por hierarquia, não uniformemente.
- **Cromática:** acento `#69D9A4` (verde-teal) com papéis definidos + apoios teal
  (`--color-support`) e roxo (`--color-purple`); off-white levemente quente.
- **Motion:** tokens (`--motion-*`, `--ease-premium`) e utilitários `animate-rise`
  (entrada de página), `breathe` (IA viva) e `pulse-dot`/`pulse-ring` (operação ao
  vivo); apenas ~3 elementos com animação infinita, animando só `opacity`/`box-shadow`;
  `prefers-reduced-motion` desativa todas as animações.
- **Identidade de IA:** componente `AiAmbient` (SVG inline leve, malha de nós + halo,
  `aria-hidden`) no header da visão geral, no estado vazio do atendimento e no painel
  de autonomia. Sem WebGL/Canvas/imagens.
- **Telas:** visão geral vira "sala de comando" (header ambiental + KPI de atenção
  dominante); estado vazio do atendimento premium com atalho de prioridade; painel de
  autonomia da IA imersivo com resumo (habilitadas/bloqueadas); afford. de ação nas
  tabelas (Abrir/Perfil como pílula com ícone).
- **Performance/deps:** nenhuma dependência nova; apenas CSS, SVG inline e Tailwind.
- **Status:** aceita.

## ADR-018 — Base mais clara, fundo vivo e frete determinístico por zona (Fase 1)

- **Contexto:** a base ainda parecia quase-preta e estática, e o frete do pedido
  era uma taxa fixa sem explicação — pouco crível ("a IA inventa o frete?").
- **Base cromática mais clara:** superfícies subiram de #08→#0d/#10/#15/#19 (grafite
  verde-petróleo), bordas levemente esverdeadas, off-white mais quente e acento
  `#72d6ad`. Mantém dark mode, mas sai do preto chapado.
- **Fundo vivo (`AmbientBackground`):** camada fixa atrás do conteúdo com base em
  gradiente, grade técnica mascarada, malha de IA e **auroras difusas** que se
  deslocam/respiram muito lentamente (16–34s), animando só transform/opacity;
  `prefers-reduced-motion` desliga o movimento. Sem WebGL/Canvas/imagens.
- **Cards premium:** `.card-object` + `.card-object-hover` (elevação de 2px, troca
  de superfície e sombra no hover) aplicados a KPIs e tiles de inteligência.
- **Frete determinístico (módulo `delivery`):** zonas configuráveis simuladas
  (`demoDeliveryZones`) e regras puras `resolveDeliveryZone`/`getDeliveryQuote`/
  `resolveOrderDeliveryFee`. O reducer recalcula a taxa do pedido pela zona a cada
  mudança de itens/endereço/entrega; a confirmação bloqueia região fora da área e
  pedido abaixo do mínimo. A UI mostra zona, prazo, mínimo e "frete calculado pelo
  sistema · a IA apenas informa"; o painel de autonomia reforça "calcula frete pelo
  sistema" / "não inventa frete / não confirma região indisponível". Uma seção
  "Entrega e regiões" documenta as zonas. +10 testes (total 60). `DEMO_DATA_VERSION`
  subiu para 2 (invalida cache antigo sem zonas).
- **Anti-placar:** hero renomeado para "Central operacional"; bloco "Inteligência da
  operação" (gargalos/pendências derivados de forma determinística) para leitura de
  operação, não pontuação.
- **Preservação:** rotas, estado, seletores, regras existentes e persistência
  intactos; nenhuma dependência nova.
- **Status:** aceita.

## ADR-019 — Reequilíbrio cromático (ciano tecnológico) e remoção da estética esportiva

- **Contexto:** o acento único (`--color-accent`) era verde e usado em quase todo
  elemento interativo (botões, navegação, seleção, foco, KPIs, indicador "ao
  vivo"), fazendo a interface "verde demais". A malha de nós conectados do fundo
  de IA também lembrava um campo/tática esportiva, e o rótulo "Ao vivo" soava a
  transmissão de jogo.
- **Escolha:** o **verde deixou de ser o acento de interação**. `--color-accent`
  passa a ser **ciano tecnológico** (`#4ec5e0`) — usado em botões primários, item
  ativo da navegação, foco, seleção e links. O **verde (`--color-ok`, `#5fd0a2`)
  é reservado exclusivamente** a: sucesso, disponibilidade de produto e status
  "IA ativa" (badge da conversa, indicador de responsável, balão de mensagem da
  IA, toggle de disponibilidade manual). **Violeta (`--color-purple`)** passa a
  representar automação/inteligência (painel de autonomia da IA, bloco
  "Inteligência da operação"). Azul-índigo (`--color-info`) permanece para
  atendimento humano/informação; âmbar e vermelho continuam para atenção e
  criticidade. Base de superfícies migrou para grafite **azulado** (menos verde
  residual nas bordas/sombras).
- **Fim da estética esportiva:** `AiAmbient` foi reescrito — trocou a malha de
  nós grandes conectados por linhas (que lembrava campo/formação tática) por
  **fluxos de sinal abstratos** (curvas sobrepostas + partículas discretas),
  linguagem de processamento/dados. O rótulo "Ao vivo" foi renomeado para
  **"Monitorando" / "Monitoramento ativo"** (linguagem de monitoramento de
  sistema, não transmissão).
- **Motivo:** um único acento dominante em tudo (interação + IA + sucesso)
  cria monotonia cromática e lê como "verde demais"; separar papéis por cor
  cria equilíbrio e reforça semântica (o verde agora *significa* algo
  específico, em vez de decorar tudo).
- **Preservação:** nenhuma mudança de lógica, dados, rotas ou testes; apenas
  reclassificação de tokens/classes de cor e um componente decorativo (SVG).
- **Status:** aceita.
