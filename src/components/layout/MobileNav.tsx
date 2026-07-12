"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS } from "@/modules/demo/navigation";

function isActive(pathname: string, href: string): boolean {
  if (href === "/demo") {
    return pathname === "/demo";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Rótulo curto para a barra inferior. */
function mobileLabel(href: string, label: string): string {
  return href === "/demo" ? "Início" : label;
}

/** Navegação inferior do celular, com um menu "Mais" para itens secundários. */
export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const primary = NAV_ITEMS.filter((item) => item.mobilePrimary);
  const secondary = NAV_ITEMS.filter((item) => !item.mobilePrimary);
  const secondaryActive = secondary.some((item) => isActive(pathname, item.href));

  return (
    <>
      {moreOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-strong bg-raised p-4 pb-24 elev-high">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="t-section text-sm">Mais</h2>
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setMoreOpen(false)}
                className="rounded-lg p-1.5 text-low hover:bg-white/[0.06] hover:text-hi"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="space-y-1">
              {secondary.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                      active
                        ? "bg-white/[0.06] font-semibold text-hi"
                        : "text-mid hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? "text-accent" : "text-low"}`} aria-hidden />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      <nav
        aria-label="Navegação inferior"
        className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-subtle bg-surface-1/95 backdrop-blur lg:hidden"
      >
        {primary.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
                active ? "text-accent" : "text-low"
              }`}
            >
              {active ? (
                <span className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-accent" aria-hidden />
              ) : null}
              <Icon className="h-5 w-5" aria-hidden />
              {mobileLabel(item.href, item.label)}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-expanded={moreOpen}
          className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
            secondaryActive ? "text-accent" : "text-low"
          }`}
        >
          <Menu className="h-5 w-5" aria-hidden />
          Mais
        </button>
      </nav>
    </>
  );
}
