"use client";

import { ChevronsUpDown } from "lucide-react";
import { setActiveOrganization, setActiveUnit } from "@/app/app/context-actions";

interface Props {
  organizations: readonly { id: string; displayName: string }[];
  activeOrgId: string;
  units: readonly { id: string; name: string }[];
  activeUnitId: string | null;
}

/**
 * Seletor de empresa e unidade ativas. Cada troca envia a preferência ao
 * servidor (cookie) — a autorização real permanece na resolução server-side e na
 * RLS. Quando há apenas uma opção, mostra apenas o rótulo (sem select).
 */
export function OrgSwitcher(props: Props) {
  const monogram = props.organizations
    .find((o) => o.id === props.activeOrgId)
    ?.displayName.slice(0, 2)
    .toUpperCase() ?? "IA";

  return (
    <div className="rounded-xl border border-line bg-white/[0.03] p-2.5 elev-low">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-accent to-info text-xs font-extrabold text-[#052733]">
          {monogram}
        </span>
        <div className="min-w-0 flex-1">
          {props.organizations.length > 1 ? (
            <form action={setActiveOrganization}>
              <select
                name="organizationId"
                defaultValue={props.activeOrgId}
                onChange={(e) => e.currentTarget.form?.requestSubmit()}
                aria-label="Empresa ativa"
                className="w-full truncate bg-transparent text-[13px] font-bold text-hi outline-none"
              >
                {props.organizations.map((o) => (
                  <option key={o.id} value={o.id} className="bg-neutral-900">
                    {o.displayName}
                  </option>
                ))}
              </select>
            </form>
          ) : (
            <p className="truncate text-[13px] font-bold text-hi">
              {props.organizations[0]?.displayName ?? "Empresa"}
            </p>
          )}

          {props.units.length > 1 ? (
            <form action={setActiveUnit}>
              <select
                name="unitId"
                defaultValue={props.activeUnitId ?? undefined}
                onChange={(e) => e.currentTarget.form?.requestSubmit()}
                aria-label="Unidade ativa"
                className="w-full truncate bg-transparent text-[11px] text-low outline-none"
              >
                {props.units.map((u) => (
                  <option key={u.id} value={u.id} className="bg-neutral-900">
                    {u.name}
                  </option>
                ))}
              </select>
            </form>
          ) : (
            <p className="truncate text-[11px] text-low">
              {props.units[0]?.name ?? "Sem unidade"}
            </p>
          )}
        </div>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-dim" aria-hidden />
      </div>
    </div>
  );
}
