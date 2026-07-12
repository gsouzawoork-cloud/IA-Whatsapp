"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AppNavItem } from "@/core/navigation/app-nav";

function isActive(pathname: string, href: string): boolean {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Navegação inferior (celular) da aplicação real: itens primários por módulo. */
export function RealMobileNav({ items }: { items: readonly AppNavItem[] }) {
  const pathname = usePathname();
  const primary = items.filter((i) => i.mobilePrimary).slice(0, 5);

  return (
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
            {active ? <span className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-accent" aria-hidden /> : null}
            <Icon className="h-5 w-5" aria-hidden />
            {item.href === "/app" ? "Início" : item.label}
          </Link>
        );
      })}
    </nav>
  );
}
