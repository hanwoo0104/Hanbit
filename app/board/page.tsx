import Link from "next/link";
import { Eye, Pin, Search } from "lucide-react";

import { auth } from "@/auth";
import { SiteHeader } from "@/components/common/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { canManageOfficialPost } from "@/lib/auth/permissions";
import { getOfficialPostList } from "@/lib/dal/official-board";

type BoardPageProps = {
  searchParams: Promise<{
    q?: string;
    boardId?: string;
    page?: string;
  }>;
};

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
});

function boardPageHref({
  q,
  boardId,
  page,
}: {
  q?: string;
  boardId?: string;
  page?: number;
}) {
  const params = new URLSearchParams();

  if (q) {
    params.set("q", q);
  }

  if (boardId) {
    params.set("boardId", boardId);
  }

  if (page && page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/board?${query}` : "/board";
}

export default async function BoardPage({ searchParams }: BoardPageProps) {
  const [session, params] = await Promise.all([auth(), searchParams]);
  const user = session?.user ?? null;
  const data = await getOfficialPostList({
    query: params.q,
    boardId: params.boardId,
    page: Number(params.page ?? "1"),
  });
  const canWrite = canManageOfficialPost(user);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader user={user} />
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary">공식 게시판</p>
            <h1 className="mt-2 text-3xl font-semibold">학교 공식 소식</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              학생회와 운영진이 등록한 공지성 글을 모아 봅니다. 일반 학생은 조회만
              가능하고 공식 글 작성은 운영진 권한으로 제한됩니다.
            </p>
          </div>
          {canWrite ? (
            <Link
              href="/board/write"
              className="inline-flex h-10 w-fit items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
            >
              공식 글쓰기
            </Link>
          ) : null}
        </section>

        <form
          action="/board"
          className="grid gap-3 rounded-lg border border-border bg-card p-3 sm:grid-cols-[minmax(0,1fr)_220px_auto]"
        >
          <label className="relative min-w-0">
            <span className="sr-only">검색어</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              name="q"
              defaultValue={data.query}
              placeholder="제목 또는 본문 검색"
              className="h-10 pl-9"
            />
          </label>
          <label>
            <span className="sr-only">게시판</span>
            <select
              name="boardId"
              defaultValue={data.boardId ?? ""}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">전체 공식 게시판</option>
              {data.boards.map((board) => (
                <option key={board.id} value={board.id}>
                  {board.name}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" className="h-10">
            검색
          </Button>
        </form>

        <section className="grid gap-3">
          <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
            <p>총 {data.totalCount}건</p>
            <p>
              {data.page} / {data.pageCount}
            </p>
          </div>
          {data.posts.length > 0 ? (
            <ul className="grid gap-3">
              {data.posts.map((post) => (
                <li
                  key={post.id}
                  className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30"
                >
                  <Link href={`/board/${post.id}`} className="grid min-w-0 gap-3">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      {post.pinned ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-warning px-2 py-0.5 text-xs font-semibold text-white">
                          <Pin className="size-3" aria-hidden="true" />
                          고정
                        </span>
                      ) : null}
                      <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-primary">
                        {post.boardName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {dateFormatter.format(post.createdAt)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold text-foreground">
                        {post.title}
                      </h2>
                      <p className="mt-2 line-clamp-2 break-words text-sm leading-6 text-muted-foreground">
                        {post.excerpt}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>{post.authorName}</span>
                      <span className="inline-flex items-center gap-1">
                        <Eye className="size-3" aria-hidden="true" />
                        {post.viewCount}
                      </span>
                      <span>수정 {dateFormatter.format(post.updatedAt)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-lg border border-border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
              조건에 맞는 공식 게시글이 없습니다.
            </div>
          )}
        </section>

        <nav className="flex items-center justify-between gap-3" aria-label="페이지">
          {data.page <= 1 ? (
            <span className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-muted-foreground opacity-50">
              이전
            </span>
          ) : (
            <Link
              href={boardPageHref({
                q: data.query,
                boardId: data.boardId,
                page: data.page - 1,
              })}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              이전
            </Link>
          )}
          {data.page >= data.pageCount ? (
            <span className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-muted-foreground opacity-50">
              다음
            </span>
          ) : (
            <Link
              href={boardPageHref({
                q: data.query,
                boardId: data.boardId,
                page: data.page + 1,
              })}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              다음
            </Link>
          )}
        </nav>
      </main>
    </div>
  );
}
