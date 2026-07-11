"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Painel lateral (drawer) com entrada discreta (animação CSS), fecho por
 * Esc/overlay e foco controlado. Respeita `prefers-reduced-motion`.
 */
export function Drawer({
  open,
  onClose,
  title,
  headerExtra,
  children,
  width = "max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  headerExtra?: ReactNode;
  children: ReactNode;
  width?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }
    panelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="animate-fade-in absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`animate-drawer-in absolute inset-y-0 right-0 flex w-full ${width} flex-col border-l border-strong bg-raised shadow-[-30px_0_60px_rgba(0,0,0,0.5)] outline-none`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-subtle px-4 py-3">
          <h2 id={titleId} className="t-section text-sm">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            {headerExtra}
            <button
              type="button"
              aria-label="Fechar"
              onClick={onClose}
              className="rounded-lg p-1.5 text-low transition-colors hover:bg-white/[0.06] hover:text-hi"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
        <div className="scroll-slim flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
