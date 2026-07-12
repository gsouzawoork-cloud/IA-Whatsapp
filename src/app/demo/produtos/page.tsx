"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterTabs, type FilterOption } from "@/components/ui/FilterTabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pizza } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useDemo } from "@/modules/demo/state/DemoProvider";
import { isProductAvailable } from "@/modules/catalog/domain/availability";
import { ProductAvailabilityControl } from "@/modules/catalog/components/ProductAvailabilityControl";
import type { AvailabilityMode } from "@/modules/catalog/types";

const MODE_LABELS: Readonly<Record<AvailabilityMode, string>> = {
  always_available: "Sempre disponível",
  manual: "Controle manual",
  quantity: "Quantidade controlada",
};

type AvailFilter = "all" | "available" | "unavailable";

const AVAIL_FILTERS: readonly { value: AvailFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "available", label: "Disponíveis" },
  { value: "unavailable", label: "Indisponíveis" },
];

export default function ProdutosPage() {
  const { state } = useDemo();
  const [query, setQuery] = useState("");
  const [avail, setAvail] = useState<AvailFilter>("all");
  const [category, setCategory] = useState<string>("all");

  const normalized = query.trim().toLowerCase();
  const visibleProducts = useMemo(
    () =>
      state.data.products.filter((product) => {
        const matchesQuery = !normalized || product.name.toLowerCase().includes(normalized);
        const available = isProductAvailable(product);
        const matchesAvail =
          avail === "all" ||
          (avail === "available" && available) ||
          (avail === "unavailable" && !available);
        const matchesCategory = category === "all" || product.categoryId === category;
        return matchesQuery && matchesAvail && matchesCategory;
      }),
    [state.data.products, normalized, avail, category],
  );

  const categoryOptions: FilterOption<string>[] = [
    { value: "all", label: "Todas", count: state.data.products.length },
    ...state.data.categories.map((c) => ({
      value: c.id,
      label: c.name,
      count: state.data.products.filter((p) => p.categoryId === c.id).length,
    })),
  ];

  const visibleCategories = state.data.categories.filter((c) =>
    visibleProducts.some((p) => p.categoryId === c.id),
  );

  return (
    <div className="animate-rise mx-auto max-w-5xl space-y-4 p-4 lg:p-8">
      <PageHeader
        eyebrow="Módulo · Catálogo"
        title="Produtos e disponibilidade"
        description="Controle o que a IA pode oferecer agora — sempre disponível, manual ou por quantidade."
      />

      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SearchInput
              label="Buscar produtos por nome"
              value={query}
              onChange={setQuery}
              placeholder="Buscar produto"
            />
          </div>
          <FilterTabs
            ariaLabel="Filtrar por disponibilidade"
            options={AVAIL_FILTERS}
            value={avail}
            onChange={setAvail}
          />
        </div>
        <FilterTabs
          ariaLabel="Filtrar por categoria"
          options={categoryOptions}
          value={category}
          onChange={setCategory}
        />
      </div>

      {visibleCategories.length === 0 ? (
        <EmptyState icon={Pizza} title="Nenhum produto encontrado" />
      ) : (
        visibleCategories.map((cat) => {
          const products = visibleProducts.filter((p) => p.categoryId === cat.id);
          const availableCount = products.filter(isProductAvailable).length;
          return (
            <SectionCard
              key={cat.id}
              title={cat.name}
              action={
                <span className="num text-xs text-low">
                  {availableCount}/{products.length} disponíveis
                </span>
              }
              bodyClassName="p-2"
            >
              <ul className="divide-y divide-subtle">
                {products.map((product) => {
                  const available = isProductAvailable(product);
                  return (
                    <li
                      key={product.id}
                      className="flex flex-wrap items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-white/[0.02]"
                    >
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${available ? "bg-ok" : "bg-bad"}`}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-hi">{product.name}</p>
                        <p className="num text-xs text-low">
                          {formatCurrency(product.priceCents)} · {MODE_LABELS[product.availability.mode]}
                        </p>
                      </div>
                      <ProductAvailabilityControl product={product} />
                    </li>
                  );
                })}
              </ul>
            </SectionCard>
          );
        })
      )}
    </div>
  );
}
