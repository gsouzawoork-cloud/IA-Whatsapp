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
  success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  error: "border-red-500/40 bg-red-500/10 text-red-200",
  info: "border-sky-500/40 bg-sky-500/10 text-sky-200",
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
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-6"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <button
          key={toast.seq}
          type="button"
          onClick={() => onDismiss(toast.seq)}
          className={`pointer-events-auto flex w-full max-w-sm items-start gap-2 rounded-lg border px-3.5 py-2.5 text-left text-sm shadow-lg backdrop-blur ${KIND_STYLES[toast.kind]}`}
        >
          <ToastIcon kind={toast.kind} />
          <span className="flex-1">{toast.message}</span>
        </button>
      ))}
    </div>
  );
}
