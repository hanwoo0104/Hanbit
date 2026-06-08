import { updateCommunityPostAction } from "@/lib/actions/community";
import { requireUser } from "@/lib/auth/permissions";
import { getCommunityBoards, getEditableCommunityPost } from "@/lib/dal/community";
import { PostEditor } from "@/components/common/post-editor";
import { SiteHeader } from "@/components/common/site-header";

type CommunityPostEditPageProps = {
  params: Promise<{
    boardSlug: string;
    postId: string;
  }>;
};

export default async function CommunityPostEditPage({
  params,
}: CommunityPostEditPageProps) {
  const { boardSlug, postId } = await params;
  const user = await requireUser();
  const [post, boards] = await Promise.all([
    getEditableCommunityPost(boardSlug, postId, user),
    getCommunityBoards(),
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader user={user} />
      <main className="px-4 py-10">
        <PostEditor
          title="커뮤니티 글 수정"
          description="작성한 커뮤니티 글의 카테고리, 제목, 본문을 수정합니다."
          action={updateCommunityPostAction.bind(null, post.id)}
          boards={boards}
          submitLabel="수정 저장"
          cancelHref={`/community/${post.boardSlug}/${post.id}`}
          initialPost={post}
          showPinned={false}
        />
      </main>
    </div>
  );
}
