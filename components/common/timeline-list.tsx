import type { DashboardTimelineItem } from "@/lib/dal/dashboard";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "short",
  day: "numeric",
});

function formatRange(item: DashboardTimelineItem) {
  const start = dateFormatter.format(item.startDate);

  if (!item.endDate) {
    return start;
  }

  return `${start} - ${dateFormatter.format(item.endDate)}`;
}

export function TimelineList({ items }: { items: DashboardTimelineItem[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashboard-border bg-dashboard-surface-raised px-3 py-4 text-sm text-dashboard-muted">
        등록된 학사일정이 없습니다.
      </p>
    );
  }

  return (
    <ol className="grid gap-3">
      {items.map((item) => (
        <li key={item.id} className="grid grid-cols-[auto_1fr] gap-3">
          <span className="mt-1 size-2 rounded-full bg-accent-cyan" />
          <div className="min-w-0 border-b border-dashboard-border pb-3 last:border-b-0 last:pb-0">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-medium text-dashboard-text">
                {item.title}
              </p>
              {item.ddayLabel ? (
                <span className="shrink-0 rounded-full bg-warning px-2 py-0.5 text-xs font-semibold text-dashboard-bg">
                  {item.ddayLabel}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-dashboard-muted">{formatRange(item)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
