import { ChefHat } from "lucide-react";
import { requireOrganizationContext } from "@/core/context/current";
import { RealEmptyPage } from "@/components/app/RealEmptyPage";

/** Fila de preparo real: estado vazio até existirem pedidos em preparo. */
export default async function FilaPage() {
  await requireOrganizationContext();
  return (
    <RealEmptyPage
      title="Fila de preparo"
      description="Etapas de produção dos pedidos em andamento."
      icon={ChefHat}
      emptyTitle="Fila vazia"
      emptyDescription="Pedidos em preparo aparecerão aqui. Ainda não há itens na fila desta empresa."
    />
  );
}
