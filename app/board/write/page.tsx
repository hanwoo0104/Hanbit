import { requireRole } from "@/lib/auth/permissions";
import { createOfficialPostAction } from "@/lib/actions/official-board";
import { getOfficialBoards } from "@/lib/dal/official-board";
import { PostEditor } from "@/components/common/post-editor";
import { SiteHeader } from "@/components/common/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BoardWritePage() {
  const [user, boards] = await Promise.all([
    requireRole(["council", "admin"]),
    getOfficialBoards(),
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader user={user} />
      <main className="px-4 py-10">
        {boards.length > 0 ? (
          <PostEditor
            title="공식 글쓰기"
            description="학생들에게 전달할 공식 공지를 작성합니다."
            action={createOfficialPostAction}
            boards={boards}
            submitLabel="게시하기"
            cancelHref="/board"
          />
        ) : (
          <Card className="mx-auto w-full max-w-2xl rounded-lg border border-border">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                공식 게시판이 없습니다
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              관리자 seed 또는 게시판 관리에서 공식 게시판을 먼저 생성해야 합니다.
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
