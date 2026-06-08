import type { DashboardMealItem } from "@/lib/dal/dashboard";
import type { MealType } from "@/lib/generated/prisma/enums";

const mealTypeLabels: Record<MealType, string> = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
};

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
});

export function MealList({ items }: { items: DashboardMealItem[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashboard-border bg-dashboard-surface-raised px-3 py-4 text-sm text-dashboard-muted">
        오늘 등록된 급식이 없습니다.
      </p>
    );
  }

  return (
    <ul className="grid gap-3">
      {items.map((item) => (
        <li key={item.id} className="min-w-0">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-dashboard-text">
              {mealTypeLabels[item.type]}
            </p>
            <p className="text-xs text-dashboard-muted">
              {dateFormatter.format(item.date)}
            </p>
          </div>
          <ul className="flex flex-wrap gap-2">
            {item.menus.map((menu) => (
              <li
                key={menu}
                className="rounded-full border border-dashboard-border bg-dashboard-surface-raised px-3 py-1 text-xs text-dashboard-text"
              >
                {menu}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
