/**
 * Ponto único de acesso aos dados simulados da demonstração.
 *
 * As coleções exportadas pelos arquivos vizinhos são `readonly` (fonte imutável).
 * `createInitialDemoData` produz uma cópia profunda e mutável, usada como estado
 * inicial do reducer e para a ação "Restaurar demonstração".
 */

import type { Business } from "@/modules/business/types";
import type { Product, ProductCategory } from "@/modules/catalog/types";
import type { Customer } from "@/modules/customers/types";
import type { Conversation, Message } from "@/modules/conversations/types";
import type { Order } from "@/modules/orders/types";
import type { AgentSettings } from "@/modules/agent/types";

import { demoBusiness } from "./business";
import { demoCategories, demoProducts } from "./products";
import { demoCustomers } from "./customers";
import { demoConversations } from "./conversations";
import { demoMessages } from "./messages";
import { demoOrders } from "./orders";
import { demoAgentSettings } from "./agent-settings";

/** Conjunto completo de dados operáveis da demonstração. */
export interface DemoData {
  readonly business: Business;
  readonly categories: readonly ProductCategory[];
  products: Product[];
  readonly customers: readonly Customer[];
  conversations: Conversation[];
  messages: Message[];
  orders: Order[];
  agentSettings: AgentSettings;
}

/** Versão do formato dos dados persistidos, para invalidar cache incompatível. */
export const DEMO_DATA_VERSION = 1;

/** Cria uma cópia profunda e mutável dos dados simulados iniciais. */
export function createInitialDemoData(): DemoData {
  return structuredClone({
    business: demoBusiness,
    categories: demoCategories,
    products: demoProducts,
    customers: demoCustomers,
    conversations: demoConversations,
    messages: demoMessages,
    orders: demoOrders,
    agentSettings: demoAgentSettings,
  }) as DemoData;
}
