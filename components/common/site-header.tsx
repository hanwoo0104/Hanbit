import Link from "next/link";
import { LogIn, LogOut, UserRound } from "lucide-react";
import type { Session } from "next-auth";

import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/common/site-nav";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  user?: Session["user"] | null;
  variant?: "dark" | "light";
};

const navItems: [string, string][] = [
  ["홈", "/"],
  ["게시판", "/board"],
  ["커뮤니티", "/community"],
  ["기숙사", "/community?category=dorm"],
  ["스터디", "/community?category=study"],
  ["학급", "/#class"],
];

export function SiteHeader({ user, variant = "light" }: SiteHeaderProps) {
  const dark = variant === "dark";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b backdrop-blur",
        dark
          ? "border-dashboard-border bg-dashboard-bg/90 text-dashboard-text"
          : "border-border bg-background/90 text-foreground",
      )}
    >
      <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex min-w-0 items-center justify-between gap-4">
          <Link
            href="/"
            className={cn(
              "text-xl font-extrabold leading-none",
              dark ? "text-white" : "text-primary",
            )}
          >
            한빛.
          </Link>
          <div className="lg:hidden">
            {user ? (
              <Link
                href="/mypage"
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium",
                  dark
                    ? "bg-dashboard-surface-raised text-dashboard-text"
                    : "bg-card text-foreground",
                )}
              >
                <UserRound className="size-4" aria-hidden="true" />
                내 정보
              </Link>
            ) : (
              <Link
                href="/login"
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium",
                  dark
                    ? "bg-white text-brand"
                    : "bg-primary text-primary-foreground",
                )}
              >
                <LogIn className="size-4" aria-hidden="true" />
                로그인
              </Link>
            )}
          </div>
        </div>
        <SiteNav items={navItems} dark={dark} />
        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              <Link
                href="/mypage"
                className={cn(
                  "inline-flex h-9 max-w-48 items-center gap-2 rounded-lg px-3 text-sm font-medium",
                  dark
                    ? "bg-dashboard-surface-raised text-dashboard-text"
                    : "bg-card text-foreground ring-1 ring-border",
                )}
              >
                <UserRound className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{user.displayName}</span>
              </Link>
              <form action={logoutAction}>
                <Button
                  type="submit"
                  variant={dark ? "secondary" : "outline"}
                  className={cn(
                    "h-9",
                    dark &&
                      "bg-dashboard-surface text-dashboard-text hover:bg-dashboard-surface-raised",
                  )}
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  로그아웃
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors",
                  dark
                    ? "bg-white text-brand hover:bg-brand-soft"
                    : "bg-primary text-primary-foreground hover:bg-primary/80",
                )}
              >
                <LogIn className="size-4" aria-hidden="true" />
                로그인
              </Link>
              <Link
                href="/signup"
                className={cn(
                  "inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium transition-colors",
                  dark
                    ? "border border-dashboard-border text-dashboard-text hover:bg-dashboard-surface-raised"
                    : "border border-border text-foreground hover:bg-muted",
                )}
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
