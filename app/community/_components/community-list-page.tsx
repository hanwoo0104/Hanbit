import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Eye,
  MessageCircle,
  PenLine,
  Search,
  ThumbsUp,
  UserRound,
} from "lucide-react";

import { auth } from "@/auth";
import { SiteHeader } from "@/components/common/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCommunityPostList } from "@/lib/dal/community";
import type { CommunitySort } from "@/lib/dal/community";

type CommunitySearchParams = Promise<{
  q?: string;
  sort?: string;
  page?: string;
  category?: string;
}>;

type CommunityListPageProps = {
  boardSlug?: string;
  strictBoard?: boolean;
  searchParams: CommunitySearchParams;
};

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
});

function communityListHref({
  basePath,
  q,
  sort,
  page,
  category,
}: {
  basePath: string;
  q?: string;
  sort?: CommunitySort;
  page?: number;
  category?: string;
}) {
  const params = new URLSearchParams();

  if (q) {
    params.set("q", q);
  }

  if (sort && sort !== "latest") {
    params.set("sort", sort);
  }

  if (page && page > 1) {
    params.set("page", String(page));
  }

  if (category && basePath === "/community") {
    params.set("category", category);
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export async function CommunityListPage({
  boardSlug,
  strictBoard = false,
  searchParams,
}: CommunityListPageProps) {
  const [session, params] = await Promise.all([auth(), searchParams]);
  const user = session?.user ?? null;
  const queryBoardSlug = boardSlug ?? params.category;
  const data = await getCommunityPostList({
    boardSlug: queryBoardSlug,
    query: params.q,
    sort: params.sort,
    page: Number(params.page ?? "1"),
    viewer: user,
  });

  if (strictBoard && !data.activeBoard) {
    notFound();
  }

  const activeBoard = data.activeBoard;
  const basePath = boardSlug ? `/community/${boardSlug}` : "/community";
  const writeHref = activeBoard
    ? `/community/write?boardSlug=${activeBoard.slug}`
    : "/community/write";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader user={user} />
      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-community-accent">커뮤니티</p>
            <h1 className="mt-2 text-3xl font-semibold">
              {activeBoard ? activeBoard.name : "학생 커뮤니티"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {activeBoard?.description ??
                "카테고리별로 학교 생활 이야기를 나누고 질문, 분실물, 스터디 정보를 빠르게 찾습니다."}
            </p>
          </div>
          {user ? (
            <Link
              href={writeHref}
              className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
            >
              <PenLine className="size-4" aria-hidden="true" />
              글쓰기
            </Link>
          ) : (
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(writeHref)}`}
              className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <UserRound className="size-4" aria-hidden="true" />
              로그인 후 글쓰기
            </Link>
          )}
        </section>

        <nav
          aria-label="커뮤니티 카테고리"
          className="flex min-w-0 gap-2 overflow-x-auto rounded-lg border border-border bg-card p-2"
        >
          <Link
            href="/community"
            className={`inline-flex h-9 shrink-0 items-center rounded-lg px-3 text-sm font-medium transition-colors ${
              activeBoard
                ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                : "bg-brand-soft text-primary"
            }`}
          >
            전체
          </Link>
          {data.boards.map((board) => (
            <Link
              key={board.id}
              href={`/community/${board.slug}`}
              className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${
                activeBoard?.slug === board.slug
                  ? "bg-brand-soft text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {board.name}
              <span className="font-mono text-xs text-muted-foreground">
                {board.postCount}
              </span>
            </Link>
          ))}
        </nav>

        <form
          action={basePath}
          className="grid gap-3 rounded-lg border border-border bg-card p-3 sm:grid-cols-[minmax(0,1fr)_180px_auto]"
        >
          {!boardSlug && queryBoardSlug ? (
            <input type="hidden" name="category" value={queryBoardSlug} />
          ) : null}
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
            <span className="sr-only">정렬</span>
            <select
              name="sort"
              defaultValue={data.sort}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="latest">최신순</option>
              <option value="popular">인기순</option>
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
                  className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-community-accent/40"
                >
                  <Link
                    href={`/community/${post.boardSlug}/${post.id}`}
                    className="grid min-w-0 gap-3"
                  >
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="rounded-full bg-community-accent/10 px-2 py-0.5 text-xs font-semibold text-community-accent">
                        {post.boardName}
                      </span>
                      {post.hidden ? (
                        <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                          숨김
                        </span>
                      ) : null}
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
                      <span className="min-w-0 truncate">{post.authorName}</span>
                      <span className="inline-flex items-center gap-1">
                        <Eye className="size-3" aria-hidden="true" />
                        {post.viewCount}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle className="size-3" aria-hidden="true" />
                        {post.commentCount}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ThumbsUp className="size-3" aria-hidden="true" />
                        {post.reactionCount}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-lg border border-border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
              조건에 맞는 커뮤니티 글이 없습니다.
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
              href={communityListHref({
                basePath,
                q: data.query,
                sort: data.sort,
                page: data.page - 1,
                category: !boardSlug ? queryBoardSlug : undefined,
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
              href={communityListHref({
                basePath,
                q: data.query,
                sort: data.sort,
                page: data.page + 1,
                category: !boardSlug ? queryBoardSlug : undefined,
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
