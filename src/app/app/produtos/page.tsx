"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { SectionCard } from "@/components/ui/SectionCard";
import { formatCurrency } from "@/lib/format";
import { useDemo } from "@/modules/demo/state/DemoProvider";
import { isProductAvailable } from "@/modules/catalog/domain/availability";
import { ProductAvailabilityControl } from "@/modules/catalog/components/ProductAvailabilityControl";
import type { AvailabilityMode } from "@/modules/catalog/types";

const MODE_LABELS: Readonly<Record<AvailabilityMode, string>> = {
  always_available: "Sempre disponível",
  manual: "Manual",
  quantity: "Quantidade",
};

export default function ProdutosPage() {
  const { state } = useDemo();

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 lg:p-6">
      <PageHeader
        title="Produtos e disponibilidade"
        description="Controle o que a IA pode oferecer — sempre disponível, manual ou por quantidade."
      />

      {state.data.categories.map((category) => {
        const products = state.data.products.filter(
          (p) => p.categoryId === category.id,
        );
        if (products.length === 0) {
          return null;
        }
        return (
          <SectionCard key={category.id} title={category.name}>
            <ul className="divide-y divide-neutral-800">
              {products.map((product) => {
                const available = isProductAvailable(product);
                return (
                  <li
                    key={product.id}
                    className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-neutral-100">
                          {product.name}
                        </p>
                        <Badge tone={available ? "success" : "danger"}>
                          {available ? "Disponível" : "Indisponível"}
                        </Badge>
                      </div>
                      <p className="text-xs text-neutral-500">
                        {formatCurrency(product.priceCents)} ·{" "}
                        {MODE_LABELS[product.availability.mode]}
                      </p>
                    </div>
                    <ProductAvailabilityControl product={product} />
                  </li>
                );
              })}
            </ul>
          </SectionCard>
        );
      })}
    </div>
  );
}
