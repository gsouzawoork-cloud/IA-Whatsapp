import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getOrganizationContextCached } from "@/core/context/current";
import { RealAppShell } from "@/components/app/RealAppShell";
import { ConfigMissing } from "@/components/system/ConfigMissing";
import { AccessDenied } from "@/components/system/AccessDenied";

export const metadata: Metadata = {
  title: "Central IA — Aplicação",
  description: "Central de atendimento inteligente multiempresa.",
};

/**
 * A aplicação real depende sempre da sessão (cookies) e do banco: nunca é
 * pré-renderizada estaticamente. Isso também garante que o build sem Supabase
 * configurado não tente executar consultas — as rotas renderizam sob demanda.
 */
export const dynamic = "force-dynamic";

/**
 * Layout da aplicação REAL (protegida).
 *
 * Ordem das barreiras:
 *  1. Supabase não configurado → estado de configuração ausente (sem dados falsos).
 *  2. Não autenticado          → login (o middleware já cobre; dupla checagem).
 *  3. Vínculo suspenso         → acesso negado.
 *  4. Sem organização          → onboarding.
 *  5. Onboarding incompleto    → onboarding.
 *  6. Tudo certo               → shell real com navegação derivada dos módulos.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return <ConfigMissing />;
  }

  const result = await getOrganizationContextCached();

  if (result.kind === "unauthenticated") {
    redirect("/auth/login?redirectTo=/app");
  }
  if (result.kind === "suspended") {
    return (
      <AccessDenied
        title="Acesso suspenso"
        description="Seu acesso a esta empresa está suspenso. Fale com um administrador da organização."
      />
    );
  }
  if (result.kind === "no-organization") {
    redirect("/onboarding");
  }

  const { context } = result;
  if (context.onboardingStatus !== "completed") {
    redirect("/onboarding");
  }

  return (
    <RealAppShell context={context} userLabel={context.userName}>
      {children}
    </RealAppShell>
  );
}
