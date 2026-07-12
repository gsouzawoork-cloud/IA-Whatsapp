/**
 * Schemas de validação de dados de negócio (Zod).
 *
 * Valores monetários chegam do formulário em reais (string) e são normalizados
 * para CENTAVOS inteiros. Quantidades e tempos são inteiros não-negativos.
 */

import { z } from "zod";

/** Converte "49,90" / "49.90" em centavos inteiros. */
export const moneyToCents = z
  .string()
  .trim()
  .transform((v) => v.replace(/\./g, "").replace(",", "."))
  .pipe(z.coerce.number().nonnegative("Valor inválido."))
  .transform((reais) => Math.round(reais * 100));

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do produto.").max(160),
  category: z.string().trim().max(80).optional().default(""),
  priceCents: moneyToCents,
  availabilityMode: z
    .enum(["always_available", "manual", "quantity"])
    .default("always_available"),
});

export const createZoneSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da zona.").max(120),
  neighborhoods: z
    .string()
    .trim()
    .transform((v) =>
      v
        .split(",")
        .map((n) => n.trim())
        .filter((n) => n.length > 0),
    ),
  deliveryFeeCents: moneyToCents,
  minimumOrderCents: moneyToCents,
  estimatedMinMinutes: z.coerce.number().int().nonnegative().default(0),
  estimatedMaxMinutes: z.coerce.number().int().nonnegative().default(0),
});

export const agentSettingsSchema = z.object({
  agentName: z.string().trim().min(1).max(80),
  introductionMessage: z.string().trim().max(500).default(""),
  tone: z.string().trim().max(40).default("friendly"),
  formalityLevel: z.coerce.number().int().min(1).max(5).default(2),
  emojiUsage: z.enum(["none", "moderate", "frequent"]).default("moderate"),
  automaticServiceEnabled: z.boolean().default(true),
  humanHandoffEnabled: z.boolean().default(true),
  canSearchCatalog: z.boolean().default(true),
  canCheckAvailability: z.boolean().default(true),
  canQuoteDelivery: z.boolean().default(true),
  canCreateOrderDraft: z.boolean().default(true),
  canInformOrderStatus: z.boolean().default(true),
  canSuggestAlternatives: z.boolean().default(true),
});
