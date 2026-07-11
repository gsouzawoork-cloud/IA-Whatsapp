"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useDemo } from "@/modules/demo/state/DemoProvider";
import type { Order, OrderAddress } from "../types";

const FIELDS: readonly {
  key: keyof OrderAddress;
  label: string;
  required: boolean;
}[] = [
  { key: "street", label: "Rua", required: true },
  { key: "number", label: "Número", required: true },
  { key: "complement", label: "Complemento", required: false },
  { key: "district", label: "Bairro", required: true },
  { key: "city", label: "Cidade", required: true },
  { key: "reference", label: "Referência", required: false },
];

/** Endereço de entrega: resumo e edição inline (apenas em rascunho). */
export function AddressEditor({ order }: { order: Order }) {
  const { actions } = useDemo();
  const editable = order.status === "draft";
  const [open, setOpen] = useState(!order.address);
  const [form, setForm] = useState<OrderAddress>(
    order.address ?? {
      street: "",
      number: "",
      district: "",
      city: "",
    },
  );

  if (!editable) {
    return (
      <p className="text-sm text-neutral-200">
        {order.address
          ? `${order.address.street}, ${order.address.number} — ${order.address.district}, ${order.address.city}`
          : "Sem endereço."}
      </p>
    );
  }

  const canSave = form.street && form.number && form.district && form.city;

  return (
    <div className="space-y-2">
      {order.address && !open ? (
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-neutral-200">
            {order.address.street}, {order.address.number}
            {order.address.complement ? ` (${order.address.complement})` : ""} —{" "}
            {order.address.district}, {order.address.city}
          </p>
          <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
            Editar
          </Button>
        </div>
      ) : (
        <form
          className="grid grid-cols-2 gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!canSave) {
              return;
            }
            actions.setOrderAddress(order.id, form);
            setOpen(false);
          }}
        >
          {FIELDS.map((field) => (
            <label
              key={field.key}
              className={field.key === "street" || field.key === "reference" ? "col-span-2" : ""}
            >
              <span className="text-[11px] text-neutral-500">
                {field.label}
                {field.required ? " *" : ""}
              </span>
              <input
                value={form[field.key] ?? ""}
                required={field.required}
                onChange={(event) =>
                  setForm((current) => ({ ...current, [field.key]: event.target.value }))
                }
                className="mt-0.5 w-full rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-sm text-neutral-100 focus:border-emerald-500/50 focus:outline-none"
              />
            </label>
          ))}
          <div className="col-span-2 flex justify-end">
            <Button type="submit" size="sm" variant="primary" disabled={!canSave}>
              Salvar endereço
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
