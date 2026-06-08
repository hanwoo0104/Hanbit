import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

type DashboardSectionProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  href?: string;
  children: ReactNode;
  className?: string;
  id?: string;
};

export function DashboardSection({
  title,
  description,
  icon,
  href,
  children,
  className,
  id,
}: DashboardSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "min-w-0 rounded-lg border border-dashboard-border bg-dashboard-surface p-4 text-dashboard-text",
        className,
      )}
    >
      <div className="mb-4 flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          {icon ? (
            <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-dashboard-surface-raised text-accent-sky">
              {icon}
            </span>
          ) : null}
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold">{title}</h2>
            {description ? (
              <p className="mt-1 text-xs text-dashboard-muted">{description}</p>
            ) : null}
          </div>
        </div>
        {href ? (
          <Link
            href={href}
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-dashboard-muted transition-colors hover:bg-dashboard-surface-raised hover:text-dashboard-text"
            aria-label={`${title} 더 보기`}
          >
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}
