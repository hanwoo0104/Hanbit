import Link from "next/link";

import { auth } from "@/auth";
import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const navItems = [
  ["마이페이지", "/mypage"],
  ["커뮤니티 글쓰기", "/community/write"],
  ["공식 글쓰기", "/board/write"],
  ["관리자", "/admin"],
];

export default async function Home() {
  const session = await auth();
  const user = session?.user;

  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <section className="mx-auto grid w-full max-w-3xl gap-6">
        <div className="grid gap-2">
          <p className="text-sm font-medium text-primary">한빛 MVP</p>
          <h1 className="text-3xl font-semibold text-foreground">
            인증과 권한 확인
          </h1>
          <p className="text-muted-foreground">
            TASK-05에서 홈 대시보드로 교체되기 전까지 로그인 상태와 보호 route를
            확인하는 화면입니다.
          </p>
        </div>
        <Card className="rounded-lg border border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              {user ? `${user.displayName}님` : "로그인이 필요합니다"}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {user ? (
              <>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <p>역할: {user.role}</p>
                  <p>상태: {user.status}</p>
                </div>
                <form action={logoutAction}>
                  <Button type="submit" variant="outline">
                    로그아웃
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/login"
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  회원가입
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="grid gap-2 sm:grid-cols-2">
          {navItems.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
