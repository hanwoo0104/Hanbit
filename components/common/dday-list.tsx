import type { DashboardTimelineItem } from "@/lib/dal/dashboard";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "short",
  day: "numeric",
});

export function DdayList({ items }: { items: DashboardTimelineItem[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashboard-border bg-dashboard-surface-raised px-3 py-4 text-sm text-dashboard-muted">
        표시할 D-day가 없습니다.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="min-w-0 rounded-full bg-white px-4 py-3 text-dashboard-bg"
        >
          <div className="flex min-w-0 items-center justify-between gap-3">
            <p className="min-w-0 truncate text-sm font-semibold">{item.title}</p>
            <span className="shrink-0 text-sm font-extrabold text-warning">
              {item.ddayLabel}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {dateFormatter.format(item.startDate)}
          </p>
        </li>
      ))}
    </ul>
  );
}
