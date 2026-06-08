import { requireRole } from "@/lib/auth/permissions";
import { updateOfficialPostAction } from "@/lib/actions/official-board";
import {
  getOfficialBoards,
  getOfficialPostOrNotFound,
} from "@/lib/dal/official-board";
import { PostEditor } from "@/components/common/post-editor";
import { SiteHeader } from "@/components/common/site-header";

type OfficialPostEditPageProps = {
  params: Promise<{
    postId: string;
  }>;
};

export default async function OfficialPostEditPage({
  params,
}: OfficialPostEditPageProps) {
  const { postId } = await params;
  const [user, post, boards] = await Promise.all([
    requireRole(["council", "admin"]),
    getOfficialPostOrNotFound(postId),
    getOfficialBoards(),
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader user={user} />
      <main className="px-4 py-10">
        <PostEditor
          title="공식 글 수정"
          description="공식 게시글의 제목, 본문, 고정 상태를 수정합니다."
          action={updateOfficialPostAction.bind(null, post.id)}
          boards={boards}
          submitLabel="수정 저장"
          cancelHref={`/board/${post.id}`}
          initialPost={post}
        />
      </main>
    </div>
  );
}
