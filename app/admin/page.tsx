import { requireRole } from "@/lib/auth/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminPage() {
  const user = await requireRole(["admin"]);

  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <Card className="mx-auto w-full max-w-2xl rounded-lg border border-border">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">관리자</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {user.displayName} 계정으로 관리자 기능에 접근했습니다. 신고/사용자/게시판
          관리는 TASK-08에서 구현합니다.
        </CardContent>
      </Card>
    </main>
  );
}
