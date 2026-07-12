/**
 * Registro central das ferramentas operacionais.
 *
 * Fonte única e tipada dos metadados de cada ferramenta: nome estável,
 * descrição interna, schema de entrada e a permissão exigida. A futura IA
 * escolherá ferramentas por este registro; a execução real valida a permissão
 * (ver `context.ts`) e o tenant vem sempre do contexto autenticado.
 */

import type { ZodTypeAny } from "zod";
import type { Permission } from "@/core/auth/permissions";
import { catalogSearchInput } from "./catalog/search";
import { checkAvailabilityInput } from "./catalog/checkAvailability";
import { deliveryQuoteInput } from "./delivery/quote";
import { calculateTotalsInput } from "./orders/calculateTotals";
import { createDraftInput, getStatusInput } from "./orders/draft";
import { handoffRequestInput } from "./handoff/request";

/** Nome estável de cada ferramenta. */
export type ToolName =
  | "catalog.search"
  | "catalog.checkAvailability"
  | "delivery.quote"
  | "order.calculateTotals"
  | "order.createDraft"
  | "order.getStatus"
  | "handoff.request";

export interface RegisteredTool {
  readonly name: ToolName;
  readonly description: string;
  readonly input: ZodTypeAny;
  /** Permissão exigida; `null` = leitura permitida a qualquer membro ativo. */
  readonly permission: Permission | null;
}

export const TOOL_REGISTRY: Readonly<Record<ToolName, RegisteredTool>> = {
  "catalog.search": {
    name: "catalog.search",
    description: "Busca produtos ativos do catálogo com preço oficial e disponibilidade.",
    input: catalogSearchInput,
    permission: null,
  },
  "catalog.checkAvailability": {
    name: "catalog.checkAvailability",
    description: "Verifica se um produto está disponível na quantidade pedida.",
    input: checkAvailabilityInput,
    permission: null,
  },
  "delivery.quote": {
    name: "delivery.quote",
    description: "Cota o frete a partir das zonas cadastradas (nunca inventa taxa).",
    input: deliveryQuoteInput,
    permission: null,
  },
  "order.calculateTotals": {
    name: "order.calculateTotals",
    description: "Recalcula subtotal, frete, desconto e total do pedido no servidor.",
    input: calculateTotalsInput,
    permission: null,
  },
  "order.createDraft": {
    name: "order.createDraft",
    description: "Cria um rascunho de pedido; nunca confirma pagamento.",
    input: createDraftInput,
    permission: "orders:operate",
  },
  "order.getStatus": {
    name: "order.getStatus",
    description: "Consulta o status permitido de um pedido.",
    input: getStatusInput,
    permission: null,
  },
  "handoff.request": {
    name: "handoff.request",
    description: "Solicita transferência para atendimento humano (razões padronizadas).",
    input: handoffRequestInput,
    permission: "conversations:operate",
  },
};

/** Lista os nomes de todas as ferramentas registradas. */
export function listToolNames(): readonly ToolName[] {
  return Object.keys(TOOL_REGISTRY) as ToolName[];
}
