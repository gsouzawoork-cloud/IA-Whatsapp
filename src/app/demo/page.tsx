import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, FlaskConical, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "Demonstração simulada | IA WhatsApp",
  description:
    "Ambiente demonstrativo da central de atendimento IA WhatsApp, com dados fictícios de uma pizzaria.",
};

const NOTES: readonly { icon: typeof Bot; text: string }[] = [
  {
    icon: FlaskConical,
    text: "Todos os dados são fictícios (Pizzaria Forno Alto) e ficam apenas no seu navegador.",
  },
  {
    icon: Bot,
    text: "A IA é simulada: respostas e ações seguem regras determinísticas locais, sem Claude API.",
  },
  {
    icon: ShieldCheck,
    text: "Sem WhatsApp, banco, login ou pagamentos reais. Nada sai do seu dispositivo.",
  },
];

export default function DemoEntryPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-300">
          <FlaskConical className="h-3.5 w-3.5" aria-hidden />
          Ambiente simulado
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Central de atendimento — demonstração
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
          Explore como uma empresa operaria a plataforma sem precisar do WhatsApp:
          receba mensagens simuladas, deixe a IA conduzir, assuma o atendimento,
          monte pedidos, valide disponibilidade e acompanhe a fila de preparo.
        </p>

        <ul className="mt-8 space-y-3">
          {NOTES.map((note) => {
            const Icon = note.icon;
            return (
              <li
                key={note.text}
                className="flex items-start gap-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
              >
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                <span className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                  {note.text}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-8">
          <Link
            href="/app"
            className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-emerald-400"
          >
            Entrar na demonstração
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
