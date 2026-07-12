import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * Página real com estado vazio honesto. Usada onde ainda não há canal/dados
 * integrados nesta fase — NUNCA exibe dados fictícios no modo real.
 */
export function RealEmptyPage({
  title,
  description,
  icon,
  emptyTitle,
  emptyDescription,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
}) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title={title} description={description} />
      <SectionCard>
        <EmptyState icon={icon} title={emptyTitle} description={emptyDescription} />
      </SectionCard>
    </div>
  );
}
