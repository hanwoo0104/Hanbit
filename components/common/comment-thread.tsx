import Link from "next/link";
import { MessageCircle } from "lucide-react";

import {
  createCommentAction,
  deleteCommentAction,
  updateCommentAction,
} from "@/lib/actions/community";
import type { CommunityCommentItem } from "@/lib/dal/community";
import { Button } from "@/components/ui/button";
import { ReportControls } from "@/components/common/report-controls";
import { Textarea } from "@/components/ui/textarea";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
});

type CommentThreadProps = {
  postId: string;
  comments: CommunityCommentItem[];
  authenticated: boolean;
  loginHref: string;
};

export function CommentThread({
  postId,
  comments,
  authenticated,
  loginHref,
}: CommentThreadProps) {
  return (
    <section
      id="comments"
      className="grid gap-4 rounded-lg border border-border bg-card p-4 sm:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <MessageCircle className="size-5 text-community-accent" aria-hidden="true" />
          댓글 {comments.length}
        </h2>
      </div>

      {authenticated ? (
        <form action={createCommentAction.bind(null, postId)} className="grid gap-3">
          <label className="grid gap-2">
            <span className="sr-only">댓글 내용</span>
            <Textarea
              name="content"
              minLength={2}
              maxLength={2000}
              required
              placeholder="댓글을 입력하세요."
              className="min-h-24"
            />
          </label>
          <Button type="submit" className="h-10 w-fit px-4">
            댓글 등록
          </Button>
        </form>
      ) : (
        <div className="rounded-lg border border-border bg-muted px-4 py-4 text-sm text-muted-foreground">
          댓글을 작성하려면{" "}
          <Link href={loginHref} className="font-medium text-primary hover:underline">
            로그인
          </Link>
          이 필요합니다.
        </div>
      )}

      {comments.length > 0 ? (
        <ul className="grid gap-3">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="grid gap-3 rounded-lg border border-border bg-background p-4"
            >
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <p className="font-medium">{comment.authorName}</p>
                    {comment.hidden ? (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                        숨김
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {dateFormatter.format(comment.createdAt)}
                    {comment.updatedAt.getTime() !== comment.createdAt.getTime()
                      ? ` · 수정 ${dateFormatter.format(comment.updatedAt)}`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {comment.canEdit ? (
                    <>
                      <details className="group/edit">
                        <summary className="inline-flex h-9 cursor-pointer list-none items-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted [&::-webkit-details-marker]:hidden">
                          수정
                        </summary>
                        <form
                          action={updateCommentAction.bind(null, comment.id)}
                          className="mt-3 grid min-w-[min(22rem,75vw)] gap-2 rounded-lg border border-border bg-muted/50 p-3"
                        >
                          <Textarea
                            name="content"
                            defaultValue={comment.content}
                            minLength={2}
                            maxLength={2000}
                            required
                            className="min-h-24 bg-card"
                          />
                          <Button type="submit" className="h-9 w-fit px-3">
                            저장
                          </Button>
                        </form>
                      </details>
                      <form action={deleteCommentAction.bind(null, comment.id)}>
                        <Button type="submit" variant="destructive" className="h-9">
                          삭제
                        </Button>
                      </form>
                    </>
                  ) : null}
                  <ReportControls
                    targetId={comment.id}
                    targetType="comment"
                    authenticated={authenticated}
                    loginHref={loginHref}
                  />
                </div>
              </div>
              <p className="whitespace-pre-wrap break-words text-sm leading-7 text-foreground">
                {comment.content}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border border-border bg-muted px-4 py-8 text-center text-sm text-muted-foreground">
          아직 댓글이 없습니다. 첫 댓글을 남겨보세요.
        </div>
      )}
    </section>
  );
}
