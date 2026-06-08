import Link from "next/link";
import { Eye, EyeOff, Pin, Search } from "lucide-react";

import {
  hideOfficialPostAdminAction,
  restoreOfficialPostAdminAction,
  toggleOfficialPostPinnedAction,
} from "@/lib/actions/admin-board";
import { getAdminBoardStats, getAdminOfficialPosts } from "@/lib/dal/admin-board";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AdminBoardPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
});

export default async function AdminBoardPage({
  searchParams,
}: AdminBoardPageProps) {
  const params = await searchParams;
  const query = params.q ?? "";
  const [posts, stats] = await Promise.all([
    getAdminOfficialPosts(query),
    getAdminBoardStats(),
  ]);

  return (
    <section className="grid min-w-0 gap-4">
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-3 sm:gap-6">
          <span>전체 {stats.officialTotal}건</span>
          <span>고정 {stats.officialPinned}건</span>
          <span>숨김 {stats.officialHidden}건</span>
        </div>
        <Link
          href="/board/write"
          className="inline-flex h-10 w-fit items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          공식 글쓰기
        </Link>
      </div>

      <form
        action="/admin/board"
        className="grid gap-3 rounded-lg border border-border bg-card p-3 sm:grid-cols-[minmax(0,1fr)_auto]"
      >
        <label className="relative min-w-0">
          <span className="sr-only">공식 글 검색</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            name="q"
            defaultValue={query}
            placeholder="제목 또는 본문 검색"
            className="h-10 pl-9"
          />
        </label>
        <Button type="submit" className="h-10">
          검색
        </Button>
      </form>

      <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-card p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>게시글</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>작성</TableHead>
              <TableHead>조회</TableHead>
              <TableHead>관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <div className="grid gap-1">
                    <p className="max-w-md truncate font-medium">{post.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {post.boardName} · {dateFormatter.format(post.createdAt)}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {post.pinned ? (
                      <Badge variant="secondary">
                        <Pin className="size-3" aria-hidden="true" />
                        고정
                      </Badge>
                    ) : null}
                    {post.hidden ? (
                      <Badge variant="destructive">숨김</Badge>
                    ) : (
                      <Badge variant="outline">공개</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="grid gap-1 text-xs text-muted-foreground">
                    <span>{post.authorName}</span>
                    <span>수정 {dateFormatter.format(post.updatedAt)}</span>
                  </div>
                </TableCell>
                <TableCell>{post.viewCount}</TableCell>
                <TableCell>
                  <div className="flex min-w-[20rem] flex-wrap gap-2">
                    {!post.hidden ? (
                      <Link
                        href={`/board/${post.id}`}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        <Eye className="size-4" aria-hidden="true" />
                        보기
                      </Link>
                    ) : null}
                    <Link
                      href={`/board/${post.id}/edit`}
                      className="inline-flex h-9 items-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      수정
                    </Link>
                    <form action={toggleOfficialPostPinnedAction.bind(null, post.id)}>
                      <Button type="submit" variant="outline" className="h-9">
                        <Pin className="size-4" aria-hidden="true" />
                        {post.pinned ? "고정 해제" : "고정"}
                      </Button>
                    </form>
                    {post.hidden ? (
                      <form action={restoreOfficialPostAdminAction.bind(null, post.id)}>
                        <Button type="submit" variant="outline" className="h-9">
                          복구
                        </Button>
                      </form>
                    ) : (
                      <form action={hideOfficialPostAdminAction.bind(null, post.id)}>
                        <Button type="submit" variant="destructive" className="h-9">
                          <EyeOff className="size-4" aria-hidden="true" />
                          숨김
                        </Button>
                      </form>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
