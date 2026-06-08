import Link from "next/link";
import { FileWarning, Megaphone, ShieldCheck, Users } from "lucide-react";

import { getAdminOverview } from "@/lib/dal/admin-overview";

const adminCards = [
  {
    title: "신고 대기",
    description: "검토가 필요한 신고",
    href: "/admin/reports",
    key: "pendingReports" as const,
    suffix: "건",
    icon: FileWarning,
  },
  {
    title: "활성 사용자",
    description: "로그인 가능한 계정",
    href: "/admin/users",
    key: "activeUsers" as const,
    suffix: "명",
    icon: Users,
  },
  {
    title: "공식 고정글",
    description: "게시판 상단 고정",
    href: "/admin/board",
    key: "pinnedOfficialPosts" as const,
    suffix: "개",
    icon: Megaphone,
  },
  {
    title: "활성 관리자",
    description: "운영 권한 보유",
    href: "/admin/users",
    key: "activeAdmins" as const,
    suffix: "명",
    icon: ShieldCheck,
  },
];

export default async function AdminPage() {
  const overview = await getAdminOverview();
  const values = {
    pendingReports: overview.pendingReports,
    activeUsers: overview.userStats.active,
    pinnedOfficialPosts: overview.boardStats.officialPinned,
    activeAdmins: overview.userStats.admins,
  };

  return (
    <section className="grid min-w-0 gap-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {adminCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.title}
              href={card.href}
              className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-muted/40"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </p>
                <Icon className="size-5 text-primary" aria-hidden="true" />
              </div>
              <p className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-semibold text-foreground">
                  {values[card.key]}
                </span>
                <span className="text-sm text-muted-foreground">{card.suffix}</span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {card.description}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-3">
        <div>
          <p className="text-sm text-muted-foreground">숨김 커뮤니티 글</p>
          <p className="mt-1 text-xl font-semibold">
            {overview.hiddenCommunityPosts}건
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">정지 사용자</p>
          <p className="mt-1 text-xl font-semibold">
            {overview.userStats.suspended}명
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">숨김 공식 글</p>
          <p className="mt-1 text-xl font-semibold">
            {overview.boardStats.officialHidden}건
          </p>
        </div>
      </div>
    </section>
  );
}
