"use client";

import { CheckCircle2, Info, XCircle } from "lucide-react";
import type { FeedbackKind } from "@/modules/demo/state/types";

/** Um toast em exibição. */
export interface ToastItem {
  readonly seq: number;
  readonly kind: FeedbackKind;
  readonly message: string;
}

const KIND_STYLES: Readonly<Record<FeedbackKind, string>> = {
  success: "border-ok/40 text-ok",
  error: "border-bad/40 text-bad",
  info: "border-info/40 text-info",
};

function ToastIcon({ kind }: { kind: FeedbackKind }) {
  const className = "h-4 w-4 shrink-0";
  if (kind === "success") {
    return <CheckCircle2 className={className} aria-hidden />;
  }
  if (kind === "error") {
    return <XCircle className={className} aria-hidden />;
  }
  return <Info className={className} aria-hidden />;
}

/** Área fixa que empilha os toasts ativos. */
export function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: readonly ToastItem[];
  onDismiss: (seq: number) => void;
}) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-4 sm:bottom-6"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <button
          key={toast.seq}
          type="button"
          onClick={() => onDismiss(toast.seq)}
          className={`panel-priority pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-xl border px-3.5 py-3 text-left text-sm text-hi ${KIND_STYLES[toast.kind]}`}
        >
          <span className={KIND_STYLES[toast.kind]}>
            <ToastIcon kind={toast.kind} />
          </span>
          <span className="flex-1 text-mid">{toast.message}</span>
        </button>
      ))}
    </div>
  );
}
