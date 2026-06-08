import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, MessageCircle, ThumbsUp } from "lucide-react";

import { auth } from "@/auth";
import { CommentThread } from "@/components/common/comment-thread";
import { LikeButton } from "@/components/common/like-button";
import { ReportControls } from "@/components/common/report-controls";
import { SiteHeader } from "@/components/common/site-header";
import { Button } from "@/components/ui/button";
import { deleteCommunityPostAction } from "@/lib/actions/community";
import { getCommunityPostDetail } from "@/lib/dal/community";

type CommunityPostPageProps = {
  params: Promise<{
    boardSlug: string;
    postId: string;
  }>;
};

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function CommunityPostPage({
  params,
}: CommunityPostPageProps) {
  const [{ boardSlug, postId }, session] = await Promise.all([params, auth()]);
  const user = session?.user ?? null;
  const data = await getCommunityPostDetail({
    boardSlug,
    postId,
    viewer: user,
    incrementView: true,
  });

  if (!data) {
    notFound();
  }

  const { post, comments } = data;
  const postHref = `/community/${post.boardSlug}/${post.id}`;
  const loginHref = `/login?callbackUrl=${encodeURIComponent(postHref)}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader user={user} />
      <main className="mx-auto grid w-full max-w-4xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/community/${post.boardSlug}`}
            className="text-sm font-medium text-community-accent"
          >
            {post.boardName}
          </Link>
          {post.canEdit ? (
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/community/${post.boardSlug}/${post.id}/edit`}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                수정
              </Link>
              <form action={deleteCommunityPostAction.bind(null, post.id)}>
                <Button type="submit" variant="destructive" className="h-9">
                  삭제
                </Button>
              </form>
            </div>
          ) : null}
        </div>

        <article className="rounded-lg border border-border bg-card p-5 sm:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-community-accent/10 px-2 py-0.5 text-xs font-semibold text-community-accent">
              {post.boardName}
            </span>
            {post.hidden ? (
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                숨김
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="size-3" aria-hidden="true" />
              {post.viewCount}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <MessageCircle className="size-3" aria-hidden="true" />
              {post.commentCount}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <ThumbsUp className="size-3" aria-hidden="true" />
              {post.reactionCount}
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
          <div className="mt-8 flex flex-wrap items-start gap-2">
            <LikeButton
              postId={post.id}
              count={post.reactionCount}
              liked={post.likedByViewer}
              authenticated={Boolean(user)}
              loginHref={loginHref}
            />
            <ReportControls
              targetId={post.id}
              targetType="post"
              authenticated={Boolean(user)}
              loginHref={loginHref}
            />
          </div>
        </article>

        <CommentThread
          postId={post.id}
          comments={comments}
          authenticated={Boolean(user)}
          loginHref={loginHref}
        />
      </main>
    </div>
  );
}
