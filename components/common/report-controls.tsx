import Link from "next/link";
import { Flag } from "lucide-react";

import { createReportAction } from "@/lib/actions/reports";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ReportControlsProps = {
  targetId: string;
  targetType: "post" | "comment";
  authenticated: boolean;
  loginHref: string;
};

export function ReportControls({
  targetId,
  targetType,
  authenticated,
  loginHref,
}: ReportControlsProps) {
  if (!authenticated) {
    return (
      <Link
        href={loginHref}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Flag className="size-4" aria-hidden="true" />
        신고
      </Link>
    );
  }

  return (
    <details id="reports" className="group/report min-w-0">
      <summary className="inline-flex h-9 cursor-pointer list-none items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&::-webkit-details-marker]:hidden">
        <Flag className="size-4" aria-hidden="true" />
        신고
      </summary>
      <form
        action={createReportAction}
        className="mt-3 grid gap-2 rounded-lg border border-border bg-muted/50 p-3"
      >
        <input type="hidden" name="targetType" value={targetType} />
        <input type="hidden" name="targetId" value={targetId} />
        <Textarea
          name="reason"
          minLength={5}
          maxLength={1000}
          required
          placeholder="신고 사유를 적어 주세요."
          className="min-h-24 bg-card"
        />
        <Button type="submit" variant="destructive" className="h-9 w-fit px-3">
          신고 접수
        </Button>
      </form>
    </details>
  );
}
