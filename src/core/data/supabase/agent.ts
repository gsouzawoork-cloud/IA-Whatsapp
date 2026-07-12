/**
 * Implementação Supabase do AgentRepository (sob RLS).
 *
 * Persiste comportamento e capacidades PERMITIDAS do agente. Ações críticas
 * (preço, desconto, pagamento, reembolso, cancelamento, taxa de entrega)
 * permanecem fora do alcance do agente por design — não há coluna para
 * habilitá-las.
 */

import type { Database } from "@/lib/supabase/database.types";
import type { TypedSupabaseClient } from "@/lib/supabase/types";
import type { AgentRepository, AgentSettings } from "../contracts";

export function createSupabaseAgentRepository(
  supabase: TypedSupabaseClient,
  organizationId: string,
): AgentRepository {
  return {
    async getSettings() {
      const { data, error } = await supabase
        .from("agent_settings")
        .select("*")
        .eq("organization_id", organizationId)
        .is("unit_id", null)
        .maybeSingle();
      if (error) {
        throw new Error("Não foi possível carregar a configuração do agente.");
      }
      if (!data) {
        return null;
      }
      return {
        agentName: data.agent_name,
        introductionMessage: data.introduction_message,
        tone: data.tone,
        formalityLevel: data.formality_level,
        emojiUsage: data.emoji_usage,
        automaticServiceEnabled: data.automatic_service_enabled,
        humanHandoffEnabled: data.human_handoff_enabled,
        canSearchCatalog: data.can_search_catalog,
        canCheckAvailability: data.can_check_availability,
        canQuoteDelivery: data.can_quote_delivery,
        canCreateOrderDraft: data.can_create_order_draft,
        canInformOrderStatus: data.can_inform_order_status,
        canSuggestAlternatives: data.can_suggest_alternatives,
      };
    },

    async updateSettings(patch: Partial<AgentSettings>) {
      // Allowlist explícita de campos atualizáveis (anti mass-assignment).
      const update: Database["public"]["Tables"]["agent_settings"]["Update"] = {};
      if (patch.agentName !== undefined) update.agent_name = patch.agentName;
      if (patch.introductionMessage !== undefined) update.introduction_message = patch.introductionMessage;
      if (patch.tone !== undefined) update.tone = patch.tone;
      if (patch.formalityLevel !== undefined) update.formality_level = patch.formalityLevel;
      if (patch.emojiUsage !== undefined) update.emoji_usage = patch.emojiUsage;
      if (patch.automaticServiceEnabled !== undefined) update.automatic_service_enabled = patch.automaticServiceEnabled;
      if (patch.humanHandoffEnabled !== undefined) update.human_handoff_enabled = patch.humanHandoffEnabled;
      if (patch.canSearchCatalog !== undefined) update.can_search_catalog = patch.canSearchCatalog;
      if (patch.canCheckAvailability !== undefined) update.can_check_availability = patch.canCheckAvailability;
      if (patch.canQuoteDelivery !== undefined) update.can_quote_delivery = patch.canQuoteDelivery;
      if (patch.canCreateOrderDraft !== undefined) update.can_create_order_draft = patch.canCreateOrderDraft;
      if (patch.canInformOrderStatus !== undefined) update.can_inform_order_status = patch.canInformOrderStatus;
      if (patch.canSuggestAlternatives !== undefined) update.can_suggest_alternatives = patch.canSuggestAlternatives;

      const { error } = await supabase
        .from("agent_settings")
        .update(update)
        .eq("organization_id", organizationId)
        .is("unit_id", null);
      if (error) {
        throw new Error("Não foi possível salvar a configuração do agente.");
      }
    },
  };
}
