import { requireOrganizationContext } from "@/core/context/current";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAgentRepository } from "@/core/data/supabase/agent";
import { canManageAgent } from "@/core/auth/authorize";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { AgentSettingsForm } from "@/components/app/AgentSettingsForm";
import type { AgentSettings } from "@/core/data/contracts";

const DEFAULTS: AgentSettings = {
  agentName: "Assistente",
  introductionMessage: "",
  tone: "friendly",
  formalityLevel: 2,
  emojiUsage: "moderate",
  automaticServiceEnabled: true,
  humanHandoffEnabled: true,
  canSearchCatalog: true,
  canCheckAvailability: true,
  canQuoteDelivery: true,
  canCreateOrderDraft: true,
  canInformOrderStatus: true,
  canSuggestAlternatives: true,
};

/** Configuração REAL do agente (persistida). */
export default async function ConfiguracaoIaPage() {
  const ctx = await requireOrganizationContext();
  const canManage = canManageAgent({ role: ctx.role, status: ctx.status });

  const supabase = await createSupabaseServerClient();
  const repo = createSupabaseAgentRepository(supabase, ctx.organizationId);
  const settings = (await repo.getSettings()) ?? DEFAULTS;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Configuração da IA"
        description="Comportamento, limites e capacidades permitidas ao agente."
      />
      <SectionCard title="Agente">
        <AgentSettingsForm settings={settings} canManage={canManage} />
      </SectionCard>
    </div>
  );
}
