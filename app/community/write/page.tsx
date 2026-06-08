import { requireUser } from "@/lib/auth/permissions";
import { SiteHeader } from "@/components/common/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CommunityWritePage() {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader user={user} />
      <main className="px-4 py-12">
        <Card className="mx-auto w-full max-w-2xl rounded-lg border border-border">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              커뮤니티 글쓰기
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {user.displayName}님은 커뮤니티 글을 작성할 수 있습니다. 실제 작성 폼은
            TASK-07에서 구현합니다.
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
