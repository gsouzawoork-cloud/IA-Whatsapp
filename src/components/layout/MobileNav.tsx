"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS } from "@/modules/demo/navigation";

function isActive(pathname: string, href: string): boolean {
  if (href === "/app") {
    return pathname === "/app";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Rótulo curto para a barra inferior. */
function mobileLabel(href: string, label: string): string {
  return href === "/app" ? "Início" : label;
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
            className="absolute inset-0 bg-neutral-950/70"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-neutral-800 bg-neutral-900 p-4 pb-20">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-100">Mais</h2>
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setMoreOpen(false)}
                className="rounded-md p-1 text-neutral-400 hover:bg-neutral-800"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="space-y-1">
              {secondary.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    aria-current={isActive(pathname, item.href) ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm ${
                      isActive(pathname, item.href)
                        ? "bg-neutral-800 font-medium text-neutral-100"
                        : "text-neutral-300 hover:bg-neutral-800"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
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
        className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-neutral-800 bg-neutral-950/95 backdrop-blur lg:hidden"
      >
        {primary.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-1 flex-col items-center gap-1 py-2 text-[11px] ${
                active ? "text-emerald-400" : "text-neutral-400"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden />
              {mobileLabel(item.href, item.label)}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-expanded={moreOpen}
          className={`flex flex-1 flex-col items-center gap-1 py-2 text-[11px] ${
            secondaryActive ? "text-emerald-400" : "text-neutral-400"
          }`}
        >
          <Menu className="h-5 w-5" aria-hidden />
          Mais
        </button>
      </nav>
    </>
  );
}
