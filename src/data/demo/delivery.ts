import type { DeliveryZone } from "@/modules/delivery/types";

/**
 * Zonas de entrega simuladas da Pizzaria Forno Alto. Taxas, prazos e pedido
 * mínimo são determinísticos e controlados pela aplicação — a IA só consulta.
 * Bairros fora destas zonas caem em "fora da área" (exigem atendente humano).
 */
export const demoDeliveryZones: readonly DeliveryZone[] = [
  {
    id: "zone-vila-bela",
    name: "Vila Bela",
    districts: ["Vila Bela"],
    feeCents: 600,
    etaMinMinutes: 35,
    etaMaxMinutes: 50,
    minOrderCents: 3000,
    freeAboveCents: 9000,
    active: true,
  },
  {
    id: "zone-jardim-aurora",
    name: "Jardim Aurora",
    districts: ["Jardim Aurora"],
    feeCents: 800,
    etaMinMinutes: 40,
    etaMaxMinutes: 55,
    minOrderCents: 3500,
    freeAboveCents: 11000,
    active: true,
  },
  {
    id: "zone-parque-flores",
    name: "Parque das Flores",
    districts: ["Parque das Flores"],
    feeCents: 900,
    etaMinMinutes: 45,
    etaMaxMinutes: 60,
    minOrderCents: 3500,
    active: true,
  },
  {
    id: "zone-centro",
    name: "Centro",
    districts: ["Centro"],
    feeCents: 800,
    etaMinMinutes: 40,
    etaMaxMinutes: 55,
    minOrderCents: 3500,
    active: true,
  },
];
