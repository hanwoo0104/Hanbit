import type { DashboardTimetableItem } from "@/lib/dal/dashboard";

const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];

export function TimetableList({ items }: { items: DashboardTimetableItem[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashboard-border bg-dashboard-surface-raised px-3 py-4 text-sm text-dashboard-muted">
        등록된 시간표가 없습니다.
      </p>
    );
  }

  return (
    <ul className="grid gap-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex min-w-0 items-center gap-2 rounded-full bg-white px-3 py-2 text-sm text-dashboard-bg"
        >
          <span className="shrink-0 rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-white">
            {weekdayLabels[item.weekday] ?? `${item.weekday}`} {item.period}교시
          </span>
          <span className="min-w-0 flex-1 truncate font-semibold">
            {item.subject}
          </span>
          {item.location ? (
            <span className="shrink-0 text-xs text-slate-500">{item.location}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
