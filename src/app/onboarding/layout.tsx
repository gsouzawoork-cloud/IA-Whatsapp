import type { ReactNode } from "react";
import Link from "next/link";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { PlatformBrand } from "@/components/layout/PlatformBrand";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ConfigMissing } from "@/components/system/ConfigMissing";

/** Onboarding depende da sessão/banco: renderização dinâmica sob demanda. */
export const dynamic = "force-dynamic";

/** Layout do onboarding: ambientação da plataforma; protegido pelo middleware. */
export default function OnboardingLayout({ children }: { children: ReactNode }) {
  if (!isSupabaseConfigured()) {
    return <ConfigMissing />;
  }
  return (
    <div className="relative flex min-h-dvh flex-col text-hi">
      <AmbientBackground />
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/" aria-label="Central IA — início">
          <PlatformBrand />
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-6 py-6">
        <div className="w-full max-w-lg">{children}</div>
      </main>
    </div>
  );
}
