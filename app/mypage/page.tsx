import { logoutAction } from "@/lib/actions/auth";
import { requireUser } from "@/lib/auth/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/common/site-header";

export default async function MyPage() {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader user={user} />
      <main className="px-4 py-12">
        <Card className="mx-auto w-full max-w-2xl rounded-lg border border-border">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">마이페이지</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <dl className="grid gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">이름</dt>
                <dd className="font-medium">{user.displayName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">학번</dt>
                <dd className="font-mono">{user.studentNumber ?? "-"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">역할</dt>
                <dd className="font-medium">{user.role}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">상태</dt>
                <dd className="font-medium">{user.status}</dd>
              </div>
            </dl>
            <form action={logoutAction}>
              <Button type="submit" variant="outline">
                로그아웃
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
