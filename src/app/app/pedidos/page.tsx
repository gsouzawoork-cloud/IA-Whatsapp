import { ShoppingBag } from "lucide-react";
import { requireOrganizationContext } from "@/core/context/current";
import { RealEmptyPage } from "@/components/app/RealEmptyPage";

/** Pedidos reais: estado vazio até existirem pedidos criados. */
export default async function PedidosPage() {
  await requireOrganizationContext();
  return (
    <RealEmptyPage
      title="Pedidos"
      description="Pedidos reais da sua empresa (totais calculados no servidor)."
      icon={ShoppingBag}
      emptyTitle="Nenhum pedido ainda"
      emptyDescription="Os pedidos usam snapshot de preço e frete determinístico. Ainda não há pedidos registrados nesta empresa."
    />
  );
}
