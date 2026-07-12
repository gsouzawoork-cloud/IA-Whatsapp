import { MessagesSquare } from "lucide-react";
import { requireOrganizationContext } from "@/core/context/current";
import { RealEmptyPage } from "@/components/app/RealEmptyPage";

/** Atendimento real: sem canal integrado nesta fase (WhatsApp virá depois). */
export default async function AtendimentoPage() {
  await requireOrganizationContext();
  return (
    <RealEmptyPage
      title="Atendimento"
      description="Conversas reais aparecerão aqui quando um canal for integrado."
      icon={MessagesSquare}
      emptyTitle="Nenhuma conversa ainda"
      emptyDescription="Nesta fase não há canal de mensagens conectado. A estrutura de conversas já existe no banco, sob isolamento por empresa."
    />
  );
}
