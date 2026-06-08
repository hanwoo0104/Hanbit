import Link from "next/link";
import { ThumbsUp } from "lucide-react";

import { togglePostReactionAction } from "@/lib/actions/community";
import { Button } from "@/components/ui/button";

type LikeButtonProps = {
  postId: string;
  count: number;
  liked: boolean;
  loginHref: string;
  authenticated: boolean;
};

export function LikeButton({
  postId,
  count,
  liked,
  loginHref,
  authenticated,
}: LikeButtonProps) {
  if (!authenticated) {
    return (
      <Link
        href={loginHref}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        <ThumbsUp className="size-4" aria-hidden="true" />
        좋아요 {count}
      </Link>
    );
  }

  return (
    <form action={togglePostReactionAction.bind(null, postId)}>
      <Button
        type="submit"
        variant={liked ? "secondary" : "outline"}
        className="h-10 px-4"
      >
        <ThumbsUp className="size-4" aria-hidden="true" />
        {liked ? "좋아요 취소" : "좋아요"} {count}
      </Button>
    </form>
  );
}
