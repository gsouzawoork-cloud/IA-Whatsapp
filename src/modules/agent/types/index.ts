/**
 * Tipos da configuração simulada da IA.
 *
 * A IA nunca executa ações críticas: estas configurações apenas descrevem o
 * comportamento pretendido do agente na demonstração.
 */

/** Tom de voz do agente. */
export type AgentTone = "professional" | "friendly" | "direct";

/** Configuração do agente de IA (versão simulada). */
export interface AgentSettings {
  readonly name: string;
  /** Forma de apresentação ao iniciar uma conversa. */
  greeting: string;
  tone: AgentTone;
  /** Nível de formalidade de 1 (informal) a 5 (formal). */
  formality: number;
  useEmojis: boolean;
  /** Horário de atendimento automático (ex.: "18:00 – 23:30"). */
  serviceHours: string;
  offHoursMessage: string;
  /** Casos que exigem transferência para humano. */
  humanHandoffCases: string;
  /** Ações que a IA pode solicitar. */
  canQueryProducts: boolean;
  canDraftOrders: boolean;
  canSuggestAlternatives: boolean;
  canInformStatus: boolean;
  /** Bloqueios que a IA nunca pode contornar. */
  blockDiscounts: boolean;
  blockAutoCancellation: boolean;
  blockPriceChange: boolean;
  blockRefunds: boolean;
  /** ISO da última alteração simulada. */
  updatedAt: string;
}
