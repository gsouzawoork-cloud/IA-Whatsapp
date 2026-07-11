/**
 * Contrato de módulos e capacidades da plataforma.
 *
 * Este é um artefato de FUNDAÇÃO, não uma funcionalidade. Ele define a fronteira
 * arquitetural entre o núcleo universal (sempre presente) e os módulos opcionais
 * (habilitados por empresa). Nesta fase não há banco, autenticação ou navegação
 * funcional: aqui existe apenas o catálogo tipado e uma verificação de capacidade
 * pura e determinística, que serve de base para a futura autorização por módulo.
 *
 * Regra de produto: a decisão de quais módulos uma empresa possui é sempre
 * determinística e controlada pela aplicação — nunca pela IA nem pelo frontend.
 */

/** Chave estável de um módulo do núcleo universal. */
export type CoreModuleKey =
  | "attendance"
  | "conversations"
  | "customers"
  | "knowledge"
  | "agent"
  | "audit";

/** Chave estável de um módulo opcional (habilitado por empresa). */
export type OptionalModuleKey =
  | "orders"
  | "catalog"
  | "availability"
  | "payments"
  | "preparation"
  | "delivery"
  | "appointments"
  | "quotes"
  | "requests"
  | "documents";

/** Qualquer chave de módulo conhecida pela plataforma. */
export type ModuleKey = CoreModuleKey | OptionalModuleKey;

/** Descrição estática de um módulo. */
export interface ModuleDefinition {
  readonly key: ModuleKey;
  /** Rótulo legível (pt-BR). */
  readonly label: string;
  /** O que o módulo habilita, em uma linha. */
  readonly description: string;
  /**
   * `true` para módulos do núcleo universal (sempre ativos).
   * `false` para módulos opcionais (habilitados por empresa).
   */
  readonly core: boolean;
}

/**
 * Catálogo canônico de módulos. Intencionalmente enxuto: apenas os módulos com
 * significado arquitetural definido nesta fase. Módulos adicionais previstos no
 * roadmap (ex.: fidelidade, relatórios por segmento) serão acrescentados quando
 * saírem do estado puramente conceitual.
 */
export const MODULE_CATALOG: readonly ModuleDefinition[] = [
  {
    key: "attendance",
    label: "Atendimento",
    description: "Núcleo da plataforma: conversas, filas e ciclo do atendimento.",
    core: true,
  },
  {
    key: "conversations",
    label: "Conversas e mensagens",
    description: "Histórico de mensagens recebidas e enviadas por conversa.",
    core: true,
  },
  {
    key: "customers",
    label: "Clientes",
    description: "Cadastro e histórico do cliente, com minimização de dados.",
    core: true,
  },
  {
    key: "knowledge",
    label: "Base de conhecimento",
    description: "Informações oficiais aprovadas que a IA pode consultar.",
    core: true,
  },
  {
    key: "agent",
    label: "Configuração da IA",
    description: "Comportamento, limites e ferramentas permitidas ao agente.",
    core: true,
  },
  {
    key: "audit",
    label: "Auditoria",
    description: "Registro de ações relevantes de usuários e da IA.",
    core: true,
  },
  {
    key: "orders",
    label: "Pedidos",
    description: "Pedidos estruturados ligados à conversa e ao cliente.",
    core: false,
  },
  {
    key: "catalog",
    label: "Catálogo",
    description: "Produtos e serviços oferecidos pela empresa.",
    core: false,
  },
  {
    key: "availability",
    label: "Produtos e disponibilidade",
    description: "O que a IA pode oferecer ou confirmar — não é um ERP de estoque.",
    core: false,
  },
  {
    key: "payments",
    label: "Pagamentos",
    description: "Cobranças e status de pagamento por provedores externos.",
    core: false,
  },
  {
    key: "preparation",
    label: "Fila de preparo",
    description: "Etapas de produção para negócios de delivery.",
    core: false,
  },
  {
    key: "delivery",
    label: "Entrega",
    description: "Área de entrega, taxa e prazo.",
    core: false,
  },
  {
    key: "appointments",
    label: "Agenda",
    description: "Agendamentos e confirmações para negócios de serviço.",
    core: false,
  },
  {
    key: "quotes",
    label: "Orçamentos",
    description: "Geração e acompanhamento de orçamentos.",
    core: false,
  },
  {
    key: "requests",
    label: "Solicitações",
    description: "Solicitações genéricas geradas durante o atendimento.",
    core: false,
  },
  {
    key: "documents",
    label: "Documentos",
    description: "Documentos autorizados vinculados ao cliente ou à empresa.",
    core: false,
  },
] as const;

/** Chaves dos módulos do núcleo universal (sempre ativos). */
export const CORE_MODULE_KEYS: readonly CoreModuleKey[] = MODULE_CATALOG.filter(
  (m): m is ModuleDefinition & { key: CoreModuleKey } => m.core,
).map((m) => m.key);

/**
 * Verificação de capacidade pura e determinística.
 *
 * Módulos do núcleo estão sempre habilitados. Módulos opcionais só estão
 * habilitados quando presentes em `enabledOptionalModules`.
 *
 * ATENÇÃO: nesta fase não há sessão nem empresa; `enabledOptionalModules` é um
 * parâmetro explícito. Quando a autenticação existir, a lista virá do contexto
 * empresarial validado no backend — nunca de parâmetros enviados pelo cliente.
 */
export function isModuleEnabled(
  key: ModuleKey,
  enabledOptionalModules: readonly OptionalModuleKey[],
): boolean {
  const definition = MODULE_CATALOG.find((m) => m.key === key);
  if (!definition) {
    return false;
  }
  if (definition.core) {
    return true;
  }
  return enabledOptionalModules.includes(key as OptionalModuleKey);
}
