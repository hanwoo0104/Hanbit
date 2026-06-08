import Link from "next/link";
import type { ReactNode } from "react";
import {
  CheckCircle2,
  Circle,
  ClipboardList,
  MessageCircle,
  PenLine,
  Plus,
  UserRound,
} from "lucide-react";

import { logoutAction } from "@/lib/actions/auth";
import {
  createTodoAction,
  deleteTodoAction,
  toggleTodoAction,
  updateTodoAction,
} from "@/lib/actions/todos";
import { requireUser } from "@/lib/auth/permissions";
import { getMyPageData } from "@/lib/dal/mypage";
import type {
  MyPageCommentItem,
  MyPagePostItem,
  MyPageTodoItem,
} from "@/lib/dal/mypage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/common/site-header";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
});

const roleLabels = {
  student: "학생",
  council: "운영진",
  admin: "관리자",
};

const statusLabels = {
  active: "활성",
  pending: "대기",
  suspended: "정지",
};

const postTypeLabels = {
  official: "공식",
  community: "커뮤니티",
};

function formatDateInput(date: Date | null) {
  if (!date) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function statusVariant(status: "active" | "pending" | "suspended") {
  if (status === "suspended") {
    return "destructive";
  }

  return status === "pending" ? "outline" : "secondary";
}

export default async function MyPage() {
  const user = await requireUser();
  const data = await getMyPageData(user);
  const canWriteOfficial = user.role === "council" || user.role === "admin";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader user={user} />
      <main className="mx-auto grid min-w-0 w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="rounded-lg border border-border">
            <CardHeader>
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-brand-soft text-primary">
                  <UserRound className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h1 className="text-2xl font-semibold">
                    {data.profile.displayName}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {data.profile.email ?? "등록된 이메일 없음"}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="flex flex-wrap gap-2">
                <Badge variant={user.role === "admin" ? "default" : "outline"}>
                  {roleLabels[data.profile.role]}
                </Badge>
                <Badge variant={statusVariant(data.profile.status)}>
                  {statusLabels[data.profile.status]}
                </Badge>
                <Badge variant="secondary">
                  학번 {data.profile.studentNumber ?? "-"}
                </Badge>
              </div>
              <dl className="grid gap-3 text-sm sm:grid-cols-3">
                <ProfileStat label="작성 글" value={data.profile.postCount} />
                <ProfileStat label="댓글" value={data.profile.commentCount} />
                <ProfileStat label="할 일" value={data.profile.todoCount} />
              </dl>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/community/write"
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
                >
                  <PenLine className="size-4" aria-hidden="true" />
                  커뮤니티 글쓰기
                </Link>
                {canWriteOfficial ? (
                  <Link
                    href="/board/write"
                    className="inline-flex h-10 items-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    공식 글쓰기
                  </Link>
                ) : null}
                {user.role === "admin" ? (
                  <Link
                    href="/admin"
                    className="inline-flex h-10 items-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    관리자
                  </Link>
                ) : null}
                <form action={logoutAction}>
                  <Button type="submit" variant="outline" className="h-10">
                    로그아웃
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          <nav
            aria-label="마이페이지 섹션"
            className="grid gap-2 rounded-lg border border-border bg-card p-3 lg:self-start"
          >
            <SectionAnchor href="#posts" label="내 글" count={data.posts.length} />
            <SectionAnchor
              href="#comments"
              label="내 댓글"
              count={data.comments.length}
            />
            <SectionAnchor href="#todos" label="할 일" count={data.todos.length} />
          </nav>
        </section>

        <section id="posts" className="grid scroll-mt-24 gap-3">
          <SectionTitle
            icon={<PenLine className="size-5" aria-hidden="true" />}
            title="내 글"
            description="내가 작성한 공식 글과 커뮤니티 글입니다."
          />
          {data.posts.length > 0 ? (
            <ul className="grid gap-3 lg:grid-cols-2">
              {data.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </ul>
          ) : (
            <EmptyState
              title="아직 작성한 글이 없습니다"
              description="커뮤니티에서 첫 글을 작성해 학교 생활 이야기를 나눠보세요."
              href="/community/write"
              action="글쓰기"
            />
          )}
        </section>

        <section id="comments" className="grid scroll-mt-24 gap-3">
          <SectionTitle
            icon={<MessageCircle className="size-5" aria-hidden="true" />}
            title="내 댓글"
            description="내가 참여한 커뮤니티 대화를 다시 확인합니다."
          />
          {data.comments.length > 0 ? (
            <ul className="grid gap-3 lg:grid-cols-2">
              {data.comments.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))}
            </ul>
          ) : (
            <EmptyState
              title="아직 작성한 댓글이 없습니다"
              description="관심 있는 커뮤니티 글에 의견을 남기면 여기에 표시됩니다."
              href="/community"
              action="커뮤니티 보기"
            />
          )}
        </section>

        <section id="todos" className="grid scroll-mt-24 gap-3">
          <SectionTitle
            icon={<ClipboardList className="size-5" aria-hidden="true" />}
            title="할 일"
            description="홈 대시보드와 연결되는 개인 할 일 목록입니다."
          />
          <Card className="rounded-lg border border-border">
            <CardContent className="grid gap-4 pt-4">
              <form
                action={createTodoAction}
                className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px_auto]"
              >
                <label>
                  <span className="sr-only">새 할 일</span>
                  <Input
                    name="title"
                    minLength={2}
                    maxLength={120}
                    required
                    placeholder="새 할 일"
                    className="h-10"
                  />
                </label>
                <label>
                  <span className="sr-only">마감일</span>
                  <Input name="dueDate" type="date" className="h-10" />
                </label>
                <Button type="submit" className="h-10">
                  <Plus className="size-4" aria-hidden="true" />
                  추가
                </Button>
              </form>

              {data.todos.length > 0 ? (
                <ul className="grid gap-2">
                  {data.todos.map((todo) => (
                    <TodoItem key={todo.id} todo={todo} />
                  ))}
                </ul>
              ) : (
                <div className="rounded-lg border border-border bg-muted px-4 py-8 text-center text-sm text-muted-foreground">
                  등록된 할 일이 없습니다. 제출, 준비물, 약속을 추가해보세요.
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

function ProfileStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-muted/50 px-3 py-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold">{value}</dd>
    </div>
  );
}

function SectionAnchor({
  href,
  label,
  count,
}: {
  href: string;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className="flex h-10 items-center justify-between gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <span>{label}</span>
      <span className="font-mono text-xs">{count}</span>
    </Link>
  );
}

function SectionTitle({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-primary">
        {icon}
      </span>
      <div className="min-w-0">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-10 text-center">
      <p className="text-base font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <Link
        href={href}
        className="mt-4 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
      >
        {action}
      </Link>
    </div>
  );
}

function PostCard({ post }: { post: MyPagePostItem }) {
  return (
    <li className="grid min-w-0 gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <Badge variant={post.type === "official" ? "default" : "outline"}>
          {postTypeLabels[post.type]}
        </Badge>
        <Badge variant="secondary">{post.boardName}</Badge>
        {post.hidden ? <Badge variant="destructive">숨김</Badge> : null}
      </div>
      <div className="min-w-0">
        {post.href ? (
          <Link
            href={post.href}
            className="block truncate text-lg font-semibold hover:text-primary"
          >
            {post.title}
          </Link>
        ) : (
          <p className="truncate text-lg font-semibold text-muted-foreground">
            {post.title}
          </p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          {dateFormatter.format(post.createdAt)} · 조회 {post.viewCount} · 댓글{" "}
          {post.commentCount} · 좋아요 {post.reactionCount}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {post.href ? (
          <Link
            href={post.href}
            className="inline-flex h-9 items-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            보기
          </Link>
        ) : null}
        {post.editHref ? (
          <Link
            href={post.editHref}
            className="inline-flex h-9 items-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            수정
          </Link>
        ) : null}
      </div>
    </li>
  );
}

function CommentCard({ comment }: { comment: MyPageCommentItem }) {
  return (
    <li className="grid min-w-0 gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <Badge variant="secondary">{comment.boardName}</Badge>
        {comment.hidden ? <Badge variant="destructive">댓글 숨김</Badge> : null}
        {comment.postHidden ? <Badge variant="destructive">글 숨김</Badge> : null}
      </div>
      <div className="min-w-0">
        {comment.href ? (
          <Link
            href={comment.href}
            className="block truncate text-base font-semibold hover:text-primary"
          >
            {comment.postTitle}
          </Link>
        ) : (
          <p className="truncate text-base font-semibold text-muted-foreground">
            {comment.postTitle}
          </p>
        )}
        <p className="mt-2 line-clamp-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
          {comment.content}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {dateFormatter.format(comment.createdAt)}
        </p>
      </div>
    </li>
  );
}

function TodoItem({ todo }: { todo: MyPageTodoItem }) {
  const Icon = todo.completed ? CheckCircle2 : Circle;

  return (
    <li className="grid gap-3 rounded-lg border border-border bg-background p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
      <div className="flex min-w-0 gap-3">
        <form action={toggleTodoAction.bind(null, todo.id)}>
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            aria-label={todo.completed ? "미완료로 표시" : "완료로 표시"}
            className="size-8"
          >
            <Icon
              className={todo.completed ? "size-4 text-success" : "size-4"}
              aria-hidden="true"
            />
          </Button>
        </form>
        <div className="min-w-0">
          <p
            className={
              todo.completed
                ? "break-words text-sm font-medium text-muted-foreground line-through"
                : "break-words text-sm font-medium text-foreground"
            }
          >
            {todo.title}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {todo.dueDate ? dateFormatter.format(todo.dueDate) : "마감 없음"}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 sm:justify-end">
        <details className="group/edit">
          <summary className="inline-flex h-9 cursor-pointer list-none items-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted [&::-webkit-details-marker]:hidden">
            수정
          </summary>
          <form
            action={updateTodoAction.bind(null, todo.id)}
            className="mt-3 grid min-w-[min(22rem,75vw)] gap-2 rounded-lg border border-border bg-muted/50 p-3"
          >
            <Input
              name="title"
              defaultValue={todo.title}
              minLength={2}
              maxLength={120}
              required
              aria-label="할 일 수정 제목"
              className="h-10 bg-card"
            />
            <Input
              name="dueDate"
              type="date"
              defaultValue={formatDateInput(todo.dueDate)}
              aria-label="할 일 수정 마감일"
              className="h-10 bg-card"
            />
            <Button type="submit" className="h-9 w-fit">
              저장
            </Button>
          </form>
        </details>
        <form action={deleteTodoAction.bind(null, todo.id)}>
          <Button type="submit" variant="destructive" className="h-9">
            삭제
          </Button>
        </form>
      </div>
    </li>
  );
}
