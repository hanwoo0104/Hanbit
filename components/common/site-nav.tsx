"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type SiteNavProps = {
  items: [string, string][];
  dark: boolean;
};

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  if (href.includes("?") || href.includes("#")) {
    return false;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav({ items, dark }: SiteNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="주요 메뉴"
      className="flex min-w-0 gap-1 overflow-x-auto whitespace-nowrap"
    >
      {items.map(([label, href]) => {
        const active = isActivePath(pathname, href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? dark
                  ? "bg-dashboard-surface-raised text-dashboard-text"
                  : "bg-brand-soft text-primary"
                : dark
                  ? "text-dashboard-muted hover:bg-dashboard-surface-raised hover:text-dashboard-text"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
