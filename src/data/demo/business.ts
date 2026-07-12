import type { Business } from "@/modules/business/types";

/**
 * Empresa fictícia da demonstração: Pizzaria Forno Alto.
 * Dados realistas (pt-BR), sem qualquer relação com marcas reais.
 */
export const demoBusiness: Business = {
  name: "Pizzaria Forno Alto",
  monogram: "FA",
  tagline: "Forno a lenha · massa artesanal · delivery",
  unit: {
    name: "Unidade Vila Bela",
    address: "Rua das Oliveiras, 218 — Vila Bela, São Paulo/SP",
    serviceHours: "Terça a domingo, das 18h às 23h30",
    deliveryArea: "Vila Bela, Jardim Aurora e Parque das Flores",
  },
  defaultDeliveryFeeCents: 700,
  defaultPreparationMinutes: 30,
  acceptedPayments: ["pix_simulated", "card_on_delivery", "cash_on_delivery"],
};
