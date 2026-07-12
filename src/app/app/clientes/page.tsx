import { Users } from "lucide-react";
import { requireOrganizationContext } from "@/core/context/current";
import { RealEmptyPage } from "@/components/app/RealEmptyPage";

/** Clientes reais: estado vazio até existirem cadastros. */
export default async function ClientesPage() {
  await requireOrganizationContext();
  return (
    <RealEmptyPage
      title="Clientes"
      description="Cadastro de clientes da sua empresa, com minimização de dados."
      icon={Users}
      emptyTitle="Nenhum cliente ainda"
      emptyDescription="Os clientes serão criados durante o atendimento. Ainda não há cadastros nesta empresa."
    />
  );
}
