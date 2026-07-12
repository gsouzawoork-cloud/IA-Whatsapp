import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getOrganizationContextCached } from "@/core/context/current";
import { FormShell } from "@/components/auth/FormShell";
import { AccessDenied } from "@/components/system/AccessDenied";
import { CreateCompanyForm } from "@/components/onboarding/CreateCompanyForm";
import { MODULE_LABELS } from "@/core/business/modules";
import { completeOnboardingAction } from "./actions";

/**
 * Onboarding progressivo:
 *  - sem empresa → criar empresa (transacional);
 *  - empresa criada mas não concluída → revisão + concluir;
 *  - concluída → segue para a aplicação.
 */
export default async function OnboardingPage() {
  const result = await getOrganizationContextCached();

  if (result.kind === "unauthenticated") {
    redirect("/auth/login");
  }
  if (result.kind === "suspended") {
    return <AccessDenied title="Acesso suspenso" description="Fale com um administrador da organização." />;
  }

  // Ainda não tem empresa: passo de criação.
  if (result.kind === "no-organization") {
    return (
      <FormShell
        title="Vamos criar sua empresa"
        subtitle="Este é o primeiro passo para configurar a Central IA."
      >
        <CreateCompanyForm />
      </FormShell>
    );
  }

  const { context } = result;
  if (context.onboardingStatus === "completed") {
    redirect("/app");
  }

  // Empresa criada, onboarding pendente: revisão + conclusão.
  return (
    <FormShell
      title="Revisão"
      subtitle={`Empresa "${context.organizationName}" criada. Confira e conclua para entrar na aplicação.`}
    >
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-semibold text-mid">Módulos habilitados</p>
          <div className="flex flex-wrap gap-2">
            {context.enabledModules.map((m) => (
              <span key={m} className="inline-flex items-center gap-1 rounded-full border border-line bg-white/[0.03] px-3 py-1 text-xs text-mid">
                <CheckCircle2 className="h-3 w-3 text-good" aria-hidden />
                {MODULE_LABELS[m]}
              </span>
            ))}
          </div>
        </div>
        <p className="text-xs leading-relaxed text-low">
          Após concluir, você poderá cadastrar produtos, zonas de entrega e ajustar a IA nas configurações da aplicação.
        </p>
        <form action={completeOnboardingAction}>
          <input type="hidden" name="organizationId" value={context.organizationId} />
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-[#052733] hover:bg-accent-hi"
          >
            Concluir e entrar
          </button>
        </form>
      </div>
    </FormShell>
  );
}
