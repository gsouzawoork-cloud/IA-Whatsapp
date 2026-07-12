/**
 * Ferramenta determinística: solicitação de transferência para humano.
 *
 * As razões são padronizadas (allowlist). Registra quem solicitou e quando (a
 * persistência/auditoria acontece na camada de execução; aqui está a regra pura
 * e o schema).
 */

import { z } from "zod";

export const HANDOFF_REASONS = [
  "customer_request",
  "out_of_scope",
  "payment_issue",
  "complaint",
  "sensitive_topic",
  "manual_review",
] as const;

export type HandoffReason = (typeof HANDOFF_REASONS)[number];

export const HANDOFF_REASON_LABELS: Readonly<Record<HandoffReason, string>> = {
  customer_request: "Cliente solicitou atendente",
  out_of_scope: "Fora do escopo do agente",
  payment_issue: "Questão de pagamento",
  complaint: "Reclamação",
  sensitive_topic: "Assunto sensível",
  manual_review: "Revisão manual necessária",
};

export const handoffRequestInput = z.object({
  conversationId: z.string().uuid(),
  reason: z.enum(HANDOFF_REASONS),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
});
export type HandoffRequestInput = z.infer<typeof handoffRequestInput>;

export type HandoffStatus = "requested" | "already_pending";

export interface HandoffRequestResult {
  readonly status: HandoffStatus;
  readonly reasonLabel: string;
  readonly priority: "low" | "normal" | "high";
}

/**
 * Regra pura: dado se já existe transferência pendente, decide o novo estado.
 * Idempotente — pedir handoff duas vezes não cria duas solicitações.
 */
export function requestHandoff(
  input: HandoffRequestInput,
  alreadyPending: boolean,
): HandoffRequestResult {
  return {
    status: alreadyPending ? "already_pending" : "requested",
    reasonLabel: HANDOFF_REASON_LABELS[input.reason],
    priority: input.priority,
  };
}
