import Link from "next/link";
import type { ReactNode } from "react";
import { FileWarning, LayoutDashboard, Megaphone, Users } from "lucide-react";

import { requireRole } from "@/lib/auth/permissions";
import { SiteHeader } from "@/components/common/site-header";

const adminNavItems = [
  {
    label: "요약",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "신고",
    href: "/admin/reports",
    icon: FileWarning,
  },
  {
    label: "사용자",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "공식 게시판",
    href: "/admin/board",
    icon: Megaphone,
  },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireRole(["admin"]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader user={user} />
      <main className="mx-auto grid min-w-0 w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary">관리자</p>
            <h1 className="mt-2 text-3xl font-semibold">운영 관리</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              신고된 콘텐츠, 사용자 역할과 상태, 공식 게시판 글을 관리합니다.
            </p>
          </div>
          <nav
            aria-label="관리자 메뉴"
            className="flex min-w-0 gap-2 overflow-x-auto rounded-lg border border-border bg-card p-2"
          >
            {adminNavItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </section>
        {children}
      </main>
    </div>
  );
}
