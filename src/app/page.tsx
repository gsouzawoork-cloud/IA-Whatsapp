import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PillarCard } from "@/components/ui/PillarCard";

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
        <section aria-labelledby="hero-title">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {siteConfig.name}
          </p>
          <h1
            id="hero-title"
            className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            {siteConfig.tagline}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
            {siteConfig.description}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-emerald-400"
            >
              Abrir ambiente simulado
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Demonstração com dados fictícios — sem integrações reais.
            </span>
          </div>
        </section>

        <section aria-labelledby="pillars-title" className="mt-14">
          <h2 id="pillars-title" className="text-lg font-semibold">
            Pilares
          </h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-3">
            {siteConfig.pillars.map((pillar) => (
              <PillarCard
                key={pillar.title}
                title={pillar.title}
                description={pillar.description}
              />
            ))}
          </ul>
        </section>

        <section aria-labelledby="channel-title" className="mt-14 max-w-2xl">
          <h2 id="channel-title" className="text-lg font-semibold">
            WhatsApp é o canal. A plataforma é a central.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
            O cliente final conversa com a empresa pelo WhatsApp. A empresa não
            precisa operar pelo WhatsApp: acompanha tudo por uma central única,
            onde a inteligência artificial atende, a equipe assume quando
            necessário e cada negócio habilita apenas os módulos de que precisa.
          </p>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
