/**
 * Tipos da empresa fictícia da demonstração.
 *
 * Uma empresa, uma unidade. Sem multiempresa funcional nesta fase — apenas os
 * dados necessários para operar a central de atendimento simulada.
 */

import type { PaymentMethod } from "@/modules/payments/types";

/** Unidade (filial) da empresa. */
export interface BusinessUnit {
  readonly name: string;
  readonly address: string;
  readonly serviceHours: string;
  readonly deliveryArea: string;
}

/** Empresa fictícia (tenant único da demonstração). */
export interface Business {
  readonly name: string;
  /** Logotipo tipográfico: iniciais exibidas em destaque. */
  readonly monogram: string;
  readonly tagline: string;
  readonly unit: BusinessUnit;
  /** Taxa de entrega padrão em centavos. */
  readonly defaultDeliveryFeeCents: number;
  /** Tempo padrão de preparo em minutos. */
  readonly defaultPreparationMinutes: number;
  readonly acceptedPayments: readonly PaymentMethod[];
}
