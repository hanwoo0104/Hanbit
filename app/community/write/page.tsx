import { createCommunityPostAction } from "@/lib/actions/community";
import { requireUser } from "@/lib/auth/permissions";
import { getCommunityBoards } from "@/lib/dal/community";
import { PostEditor } from "@/components/common/post-editor";
import { SiteHeader } from "@/components/common/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CommunityWritePageProps = {
  searchParams: Promise<{
    boardSlug?: string;
  }>;
};

export default async function CommunityWritePage({
  searchParams,
}: CommunityWritePageProps) {
  const [user, boards, params] = await Promise.all([
    requireUser(),
    getCommunityBoards(),
    searchParams,
  ]);
  const initialBoardId =
    boards.find((board) => board.slug === params.boardSlug)?.id ?? boards[0]?.id;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader user={user} />
      <main className="px-4 py-10">
        {boards.length > 0 ? (
          <PostEditor
            title="커뮤니티 글쓰기"
            description="학생들과 나눌 이야기를 카테고리에 맞춰 작성합니다."
            action={createCommunityPostAction}
            boards={boards}
            submitLabel="게시하기"
            cancelHref="/community"
            initialBoardId={initialBoardId}
            showPinned={false}
          />
        ) : (
          <Card className="mx-auto w-full max-w-2xl rounded-lg border border-border">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                커뮤니티 게시판이 없습니다
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              seed 또는 관리자 게시판 관리에서 커뮤니티 카테고리를 먼저 생성해야 합니다.
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
