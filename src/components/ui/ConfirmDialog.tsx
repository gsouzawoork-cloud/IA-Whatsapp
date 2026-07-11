"use client";

import { useEffect, useId, useRef } from "react";
import { Button, type ButtonVariant } from "./Button";

/**
 * Diálogo de confirmação para ações perigosas.
 *
 * Controla o foco (move para o botão de confirmação ao abrir), fecha com Esc e
 * associa título/descrição via `aria`. Sem animações pesadas.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  confirmVariant = "danger",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ButtonVariant;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }
    confirmRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onCancel}
        className="absolute inset-0 bg-neutral-950/70"
        tabIndex={-1}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="relative w-full max-w-sm rounded-lg border border-neutral-800 bg-neutral-900 p-5 shadow-xl"
      >
        <h2 id={titleId} className="text-sm font-semibold text-neutral-100">
          {title}
        </h2>
        {description ? (
          <p id={descriptionId} className="mt-2 text-sm text-neutral-400">
            {description}
          </p>
        ) : null}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button ref={confirmRef} variant={confirmVariant} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
