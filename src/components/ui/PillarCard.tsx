import type { Pillar } from "@/types/site";

/** Cartão compacto de um pilar de valor. */
export function PillarCard({ title, description }: Pillar) {
  return (
    <li className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        {description}
      </p>
    </li>
  );
}
