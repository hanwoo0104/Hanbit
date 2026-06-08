import Link from "next/link";
import { CheckCircle2, EyeOff, XCircle } from "lucide-react";

import {
  dismissReportAction,
  hideReportedTargetAction,
  markReportReviewedAction,
} from "@/lib/actions/reports";
import { getAdminReports } from "@/lib/dal/reports";
import { reportStatusFilterSchema } from "@/lib/validators/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type AdminReportsPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
});

const statusLabels = {
  all: "전체",
  pending: "대기",
  reviewed: "처리",
  dismissed: "기각",
};

const reportStatusLabels = {
  pending: "대기",
  reviewed: "처리",
  dismissed: "기각",
};

const targetTypeLabels = {
  post: "글",
  comment: "댓글",
};

function statusHref(status: string) {
  return status === "pending" ? "/admin/reports" : `/admin/reports?status=${status}`;
}

export default async function AdminReportsPage({
  searchParams,
}: AdminReportsPageProps) {
  const params = await searchParams;
  const status = reportStatusFilterSchema.parse(params.status ?? "pending");
  const data = await getAdminReports(status);

  return (
    <section className="grid min-w-0 gap-4">
      <div className="flex min-w-0 gap-2 overflow-x-auto rounded-lg border border-border bg-card p-2">
        {(["pending", "reviewed", "dismissed", "all"] as const).map((item) => (
          <Link
            key={item}
            href={statusHref(item)}
            className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${
              status === item
                ? "bg-brand-soft text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {statusLabels[item]}
            <span className="font-mono text-xs">
              {item === "all" ? data.counts.all : data.counts[item]}
            </span>
          </Link>
        ))}
      </div>

      {data.reports.length > 0 ? (
        <ul className="grid gap-3">
          {data.reports.map((report) => (
            <li
              key={report.id}
              className="grid gap-4 rounded-lg border border-border bg-card p-4"
            >
              <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <Badge
                      variant={
                        report.status === "pending"
                          ? "default"
                          : report.status === "dismissed"
                            ? "outline"
                            : "secondary"
                      }
                    >
                      {reportStatusLabels[report.status]}
                    </Badge>
                    <Badge variant="outline">
                      {targetTypeLabels[report.targetType]}
                    </Badge>
                    {report.target?.hidden ? (
                      <Badge variant="destructive">숨김</Badge>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    신고자 {report.reporterName}
                    {report.reporterEmail ? ` · ${report.reporterEmail}` : ""} ·{" "}
                    {dateFormatter.format(report.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {report.status === "pending" ? (
                    <>
                      <form action={markReportReviewedAction.bind(null, report.id)}>
                        <Button type="submit" variant="outline" className="h-9">
                          <CheckCircle2 className="size-4" aria-hidden="true" />
                          검토 완료
                        </Button>
                      </form>
                      <form action={dismissReportAction.bind(null, report.id)}>
                        <Button type="submit" variant="outline" className="h-9">
                          <XCircle className="size-4" aria-hidden="true" />
                          기각
                        </Button>
                      </form>
                    </>
                  ) : null}
                  {report.target && !report.target.hidden ? (
                    <form action={hideReportedTargetAction.bind(null, report.id)}>
                      <Button type="submit" variant="destructive" className="h-9">
                        <EyeOff className="size-4" aria-hidden="true" />
                        대상 숨김
                      </Button>
                    </form>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-3 rounded-lg border border-border bg-muted/50 p-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">신고 사유</p>
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">
                    {report.reason}
                  </p>
                </div>
                {report.target ? (
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">
                      신고 대상
                    </p>
                    <Link
                      href={report.target.href}
                      className="mt-1 block min-w-0 text-sm font-semibold text-primary hover:underline"
                    >
                      <span className="break-words">{report.target.title}</span>
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {report.target.boardName} · 작성 {report.target.authorName}
                    </p>
                    <p className="mt-2 line-clamp-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                      {report.target.content}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    삭제되었거나 찾을 수 없는 대상입니다.
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border border-border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
          조건에 맞는 신고가 없습니다.
        </div>
      )}
    </section>
  );
}
