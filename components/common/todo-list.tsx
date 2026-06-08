import { CheckCircle2, Circle } from "lucide-react";

import type { DashboardTodoItem } from "@/lib/dal/dashboard";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "short",
  day: "numeric",
});

export function TodoList({ items }: { items: DashboardTodoItem[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashboard-border bg-dashboard-surface-raised px-3 py-4 text-sm text-dashboard-muted">
        오늘 확인할 할 일이 없습니다.
      </p>
    );
  }

  return (
    <ul className="grid gap-2">
      {items.map((item) => {
        const Icon = item.completed ? CheckCircle2 : Circle;

        return (
          <li
            key={item.id}
            className="flex min-w-0 items-start gap-3 rounded-lg bg-dashboard-surface-raised px-3 py-2.5"
          >
            <Icon
              className={
                item.completed
                  ? "mt-0.5 size-4 shrink-0 text-success"
                  : "mt-0.5 size-4 shrink-0 text-accent-sky"
              }
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="break-words text-sm font-medium text-dashboard-text">
                {item.title}
              </p>
              <p className="mt-1 text-xs text-dashboard-muted">
                {item.dueDate ? dateFormatter.format(item.dueDate) : "마감 없음"}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
