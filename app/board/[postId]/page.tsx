import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, Pin } from "lucide-react";

import { auth } from "@/auth";
import { deleteOfficialPostAction } from "@/lib/actions/official-board";
import { canManageOfficialPost } from "@/lib/auth/permissions";
import { getOfficialPost } from "@/lib/dal/official-board";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/common/site-header";

type OfficialPostPageProps = {
  params: Promise<{
    postId: string;
  }>;
};

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function OfficialPostPage({
  params,
}: OfficialPostPageProps) {
  const [{ postId }, session] = await Promise.all([params, auth()]);
  const post = await getOfficialPost(postId, {
    incrementView: true,
  });

  if (!post) {
    notFound();
  }

  const user = session?.user ?? null;
  const canManage = canManageOfficialPost(user);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader user={user} />
      <main className="mx-auto grid w-full max-w-4xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/board" className="text-sm font-medium text-primary">
            공식 게시판
          </Link>
          {canManage ? (
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/board/${post.id}/edit`}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                수정
              </Link>
              <form action={deleteOfficialPostAction.bind(null, post.id)}>
                <Button type="submit" variant="destructive" className="h-9">
                  삭제
                </Button>
              </form>
            </div>
          ) : null}
        </div>

        <article className="rounded-lg border border-border bg-card p-5 sm:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {post.pinned ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-warning px-2 py-0.5 text-xs font-semibold text-white">
                <Pin className="size-3" aria-hidden="true" />
                고정 공지
              </span>
            ) : null}
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-primary">
              {post.boardName}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="size-3" aria-hidden="true" />
              {post.viewCount}
            </span>
          </div>
          <h1 className="break-words text-3xl font-semibold leading-tight">
            {post.title}
          </h1>
          <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex gap-1">
              <dt>작성</dt>
              <dd>{post.authorName}</dd>
            </div>
            <div className="flex gap-1">
              <dt>등록</dt>
              <dd>{dateFormatter.format(post.createdAt)}</dd>
            </div>
            <div className="flex gap-1">
              <dt>수정</dt>
              <dd>{dateFormatter.format(post.updatedAt)}</dd>
            </div>
          </dl>
          <div className="mt-8 whitespace-pre-wrap break-words text-base leading-8 text-foreground">
            {post.content}
          </div>
        </article>

        <section className="rounded-lg border border-border bg-muted px-4 py-4 text-sm text-muted-foreground">
          공식 게시글 댓글은 MVP에서 비활성화되어 있습니다.
        </section>
      </main>
    </div>
  );
}
