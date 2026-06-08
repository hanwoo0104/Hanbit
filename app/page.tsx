import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
  Clock3,
  Megaphone,
  MessageSquareText,
  Soup,
  Sparkles,
  Target,
} from "lucide-react";

import { auth } from "@/auth";
import { DashboardSection } from "@/components/common/dashboard-section";
import { DdayList } from "@/components/common/dday-list";
import { MealList } from "@/components/common/meal-list";
import { PostList } from "@/components/common/post-list";
import { SiteHeader } from "@/components/common/site-header";
import { TimelineList } from "@/components/common/timeline-list";
import { TimetableList } from "@/components/common/timetable-list";
import { TodoList } from "@/components/common/todo-list";
import { getDashboardData } from "@/lib/dal/dashboard";

const todayFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "full",
});

export default async function Home() {
  const session = await auth();
  const user = session?.user;
  const data = await getDashboardData(user?.id);

  return (
    <div className="min-h-screen bg-dashboard-bg text-dashboard-text">
      <SiteHeader user={user} variant="dark" />
      <main className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
          <div className="min-w-0 rounded-lg border border-dashboard-border bg-dashboard-surface p-5 sm:p-6 lg:self-start">
            <p className="mb-3 flex items-center gap-2 text-sm font-medium text-accent-sky">
              <Sparkles className="size-4" aria-hidden="true" />
              {todayFormatter.format(new Date())}
            </p>
            <h1 className="max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              {user
                ? `안녕하세요, ${user.displayName}님 오늘도 좋은 하루 되세요!`
                : "한빛에서 오늘의 학교 생활을 한눈에 확인하세요."}
            </h1>
            <p className="mt-4 max-w-2xl break-words text-sm leading-6 text-dashboard-muted sm:text-base">
              학사일정, 시간표, 급식, 할 일, 공식 소식과 커뮤니티 흐름을 한 화면에서
              빠르게 훑어볼 수 있습니다.
            </p>
            {user ? (
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="/mypage"
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-white px-4 text-sm font-semibold text-brand transition-colors hover:bg-brand-soft"
                >
                  마이페이지
                </Link>
                <Link
                  href="/community/write"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-dashboard-border px-4 text-sm font-semibold text-dashboard-text transition-colors hover:bg-dashboard-surface-raised"
                >
                  커뮤니티 글쓰기
                </Link>
                {user.role === "council" || user.role === "admin" ? (
                  <Link
                    href="/board/write"
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-dashboard-border px-4 text-sm font-semibold text-dashboard-text transition-colors hover:bg-dashboard-surface-raised"
                  >
                    공식 글쓰기
                  </Link>
                ) : null}
              </div>
            ) : (
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="/login"
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-white px-4 text-sm font-semibold text-brand transition-colors hover:bg-brand-soft"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-dashboard-border px-4 text-sm font-semibold text-dashboard-text transition-colors hover:bg-dashboard-surface-raised"
                >
                  회원가입
                </Link>
              </div>
            )}
            {data.isGuestSample ? (
              <p className="mt-4 rounded-lg border border-dashboard-border bg-dashboard-surface-raised px-3 py-2 text-xs text-dashboard-muted">
                비로그인 상태라 seed 학생 계정의 샘플 데이터를 보여주고 있습니다.
              </p>
            ) : null}
          </div>
          <div className="grid min-w-0 gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <DashboardStat
              label="남은 할 일"
              value={data.stats.openTodoCount}
              suffix="개"
              tone="sky"
            />
            <DashboardStat
              label="공식 소식"
              value={data.stats.officialPostCount}
              suffix="건"
              tone="cyan"
            />
            <DashboardStat
              label="커뮤니티 글"
              value={data.stats.communityPostCount}
              suffix="건"
              tone="violet"
            />
          </div>
        </section>

        <section className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-12">
          <DashboardSection
            title="학사일정"
            description="주요 일정과 날짜"
            icon={<CalendarDays className="size-4" aria-hidden="true" />}
            className="lg:col-span-4"
          >
            <TimelineList items={data.timeline} />
          </DashboardSection>

          <DashboardSection
            id="class"
            title="시간표"
            description="학생 기준 오늘 이후 수업"
            icon={<Clock3 className="size-4" aria-hidden="true" />}
            className="lg:col-span-4"
          >
            <TimetableList items={data.timetable} />
          </DashboardSection>

          <DashboardSection
            title="급식"
            description="오늘 또는 최근 등록 메뉴"
            icon={<Soup className="size-4" aria-hidden="true" />}
            className="lg:col-span-4"
          >
            <MealList items={data.meals} />
          </DashboardSection>

          <DashboardSection
            title="D-day"
            description="중요 일정 기준 날짜"
            icon={<Target className="size-4" aria-hidden="true" />}
            className="lg:col-span-5"
          >
            <DdayList items={data.dday} />
          </DashboardSection>

          <DashboardSection
            title="할 일"
            description="내가 챙겨야 할 항목"
            icon={<ClipboardList className="size-4" aria-hidden="true" />}
            href="/mypage"
            className="lg:col-span-7"
          >
            <TodoList items={data.todos} />
          </DashboardSection>

          <DashboardSection
            title="최신 공식 글"
            description="학생회와 운영진 소식"
            icon={<Megaphone className="size-4" aria-hidden="true" />}
            href="/board"
            className="lg:col-span-6"
          >
            <PostList
              posts={data.latestOfficialPosts}
              emptyText="아직 공식 게시글이 없습니다."
              accent="official"
            />
          </DashboardSection>

          <DashboardSection
            title="인기 커뮤니티"
            description="학생들이 많이 본 이야기"
            icon={<MessageSquareText className="size-4" aria-hidden="true" />}
            href="/community"
            className="lg:col-span-6"
          >
            <PostList
              posts={data.popularCommunityPosts}
              emptyText="아직 커뮤니티 글이 없습니다."
              accent="community"
            />
          </DashboardSection>
        </section>
      </main>
    </div>
  );
}

function DashboardStat({
  label,
  value,
  suffix,
  tone,
}: {
  label: string;
  value: number;
  suffix: string;
  tone: "sky" | "cyan" | "violet";
}) {
  const toneClass = {
    sky: "text-accent-sky",
    cyan: "text-accent-cyan",
    violet: "text-community-accent",
  }[tone];

  return (
    <div className="min-w-0 rounded-lg border border-dashboard-border bg-dashboard-surface p-5">
      <p className="text-sm text-dashboard-muted">{label}</p>
      <p className="mt-2 flex min-w-0 items-baseline gap-1">
        <span className={`text-3xl font-extrabold ${toneClass}`}>{value}</span>
        <span className="text-sm font-medium text-dashboard-muted">{suffix}</span>
      </p>
    </div>
  );
}
