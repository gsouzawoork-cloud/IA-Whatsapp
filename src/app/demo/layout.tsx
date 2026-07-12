import type { Metadata } from "next";
import { DemoProvider } from "@/modules/demo/state/DemoProvider";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Central de atendimento — Demonstração | IA WhatsApp",
  description:
    "Ambiente demonstrativo e simulado da central de atendimento IA WhatsApp.",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoProvider>
      <AppShell>{children}</AppShell>
    </DemoProvider>
  );
}
