import Link from "next/link";
import { MessageCircle, Pin, ThumbsUp, Eye } from "lucide-react";

import type { DashboardPostItem } from "@/lib/dal/dashboard";
import { cn } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "short",
  day: "numeric",
});

type PostListProps = {
  posts: DashboardPostItem[];
  emptyText: string;
  accent?: "official" | "community";
};

export function PostList({
  posts,
  emptyText,
  accent = "official",
}: PostListProps) {
  if (posts.length === 0) {
    return (
      <p className="rounded-lg border border-dashboard-border bg-dashboard-surface-raised px-3 py-4 text-sm text-dashboard-muted">
        {emptyText}
      </p>
    );
  }

  return (
    <ul className="grid gap-2">
      {posts.map((post) => (
        <li key={post.id} className="min-w-0">
          <Link
            href={post.href}
            className="block rounded-lg bg-dashboard-surface-raised px-3 py-3 transition-colors hover:bg-dashboard-border"
          >
            <div className="mb-2 flex min-w-0 items-center gap-2">
              {post.pinned ? (
                <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-warning text-dashboard-bg">
                  <Pin className="size-3" aria-hidden="true" />
                </span>
              ) : null}
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
                  accent === "official"
                    ? "bg-brand-soft text-brand"
                    : "bg-community-accent/20 text-violet-100",
                )}
              >
                {post.boardName}
              </span>
              <span className="min-w-0 truncate text-xs text-dashboard-muted">
                {dateFormatter.format(post.createdAt)}
              </span>
            </div>
            <p className="min-w-0 truncate text-sm font-semibold text-dashboard-text">
              {post.title}
            </p>
            <div className="mt-2 flex min-w-0 flex-wrap items-center gap-3 text-xs text-dashboard-muted">
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
  );
}
