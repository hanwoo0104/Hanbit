import "server-only";

import { prisma } from "@/lib/prisma";
import type { MealType } from "@/lib/generated/prisma/enums";

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export type DashboardTimelineItem = {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date | null;
  ddayLabel: string | null;
};

export type DashboardTimetableItem = {
  id: string;
  weekday: number;
  period: number;
  subject: string;
  location: string | null;
};

export type DashboardMealItem = {
  id: string;
  date: Date;
  type: MealType;
  menus: string[];
};

export type DashboardTodoItem = {
  id: string;
  title: string;
  dueDate: Date | null;
  completed: boolean;
};

export type DashboardPostItem = {
  id: string;
  title: string;
  href: string;
  createdAt: Date;
  pinned: boolean;
  boardName: string;
  authorName: string;
  viewCount: number;
  commentCount: number;
  reactionCount: number;
};

export type DashboardData = {
  isGuestSample: boolean;
  timeline: DashboardTimelineItem[];
  timetable: DashboardTimetableItem[];
  meals: DashboardMealItem[];
  dday: DashboardTimelineItem[];
  todos: DashboardTodoItem[];
  latestOfficialPosts: DashboardPostItem[];
  popularCommunityPosts: DashboardPostItem[];
  stats: {
    openTodoCount: number;
    officialPostCount: number;
    communityPostCount: number;
  };
};

function getKstDateParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
}

function getKstDayRange(date: Date) {
  const { year, month, day } = getKstDateParts(date);
  const start = new Date(Date.UTC(year, month - 1, day) - KST_OFFSET_MS);

  return {
    start,
    end: new Date(start.getTime() + DAY_MS),
  };
}

function getDdayLabel(startDate: Date) {
  const today = getKstDayRange(new Date()).start;
  const target = getKstDayRange(startDate).start;
  const diff = Math.round((target.getTime() - today.getTime()) / DAY_MS);

  if (diff === 0) {
    return "D-day";
  }

  return diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
}

async function getDashboardUserId(userId?: string) {
  if (userId) {
    return userId;
  }

  const sampleUser = await prisma.user.findFirst({
    where: {
      role: "student",
      status: "active",
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
    },
  });

  return sampleUser?.id ?? null;
}

async function getMealsForToday() {
  const { start, end } = getKstDayRange(new Date());
  const todayMeals = await prisma.meal.findMany({
    where: {
      date: {
        gte: start,
        lt: end,
      },
    },
    orderBy: {
      type: "asc",
    },
    take: 3,
  });

  if (todayMeals.length > 0) {
    return todayMeals;
  }

  return prisma.meal.findMany({
    orderBy: {
      date: "desc",
    },
    take: 1,
  });
}

function mapOfficialPost(post: Awaited<ReturnType<typeof getOfficialPosts>>[number]) {
  return {
    id: post.id,
    title: post.title,
    href: `/board/${post.id}`,
    createdAt: post.createdAt,
    pinned: post.pinned,
    boardName: post.board.name,
    authorName: post.author.displayName,
    viewCount: post.viewCount,
    commentCount: post._count.comments,
    reactionCount: post._count.reactions,
  };
}

function mapCommunityPost(
  post: Awaited<ReturnType<typeof getCommunityPosts>>[number],
) {
  return {
    id: post.id,
    title: post.title,
    href: `/community/${post.board.slug}/${post.id}`,
    createdAt: post.createdAt,
    pinned: post.pinned,
    boardName: post.board.name,
    authorName: post.author.displayName,
    viewCount: post.viewCount,
    commentCount: post._count.comments,
    reactionCount: post._count.reactions,
  };
}

function getOfficialPosts() {
  return prisma.post.findMany({
    where: {
      type: "official",
      hidden: false,
    },
    orderBy: [
      {
        pinned: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    take: 4,
    include: {
      author: {
        select: {
          displayName: true,
        },
      },
      board: {
        select: {
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          comments: true,
          reactions: true,
        },
      },
    },
  });
}

function getCommunityPosts() {
  return prisma.post.findMany({
    where: {
      type: "community",
      hidden: false,
    },
    orderBy: [
      {
        viewCount: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    take: 4,
    include: {
      author: {
        select: {
          displayName: true,
        },
      },
      board: {
        select: {
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          comments: true,
          reactions: true,
        },
      },
    },
  });
}

export async function getDashboardData(userId?: string): Promise<DashboardData> {
  const dashboardUserId = await getDashboardUserId(userId);

  const [
    timeline,
    timetable,
    meals,
    todos,
    officialPosts,
    communityPosts,
    openTodoCount,
    officialPostCount,
    communityPostCount,
  ] = await Promise.all([
    prisma.academicEvent.findMany({
      orderBy: {
        startDate: "asc",
      },
      take: 5,
    }),
    dashboardUserId
      ? prisma.timetableItem.findMany({
          where: {
            userId: dashboardUserId,
          },
          orderBy: [
            {
              weekday: "asc",
            },
            {
              period: "asc",
            },
          ],
          take: 8,
        })
      : Promise.resolve([]),
    getMealsForToday(),
    dashboardUserId
      ? prisma.todo.findMany({
          where: {
            userId: dashboardUserId,
          },
          orderBy: [
            {
              completed: "asc",
            },
            {
              dueDate: "asc",
            },
          ],
          take: 5,
        })
      : Promise.resolve([]),
    getOfficialPosts(),
    getCommunityPosts(),
    dashboardUserId
      ? prisma.todo.count({
          where: {
            userId: dashboardUserId,
            completed: false,
          },
        })
      : Promise.resolve(0),
    prisma.post.count({
      where: {
        type: "official",
        hidden: false,
      },
    }),
    prisma.post.count({
      where: {
        type: "community",
        hidden: false,
      },
    }),
  ]);

  const timelineItems = timeline.map((event) => ({
    id: event.id,
    title: event.title,
    startDate: event.startDate,
    endDate: event.endDate,
    ddayLabel: event.showDday ? getDdayLabel(event.startDate) : null,
  }));

  return {
    isGuestSample: !userId && Boolean(dashboardUserId),
    timeline: timelineItems,
    timetable,
    meals,
    dday: timelineItems.filter((event) => event.ddayLabel).slice(0, 4),
    todos,
    latestOfficialPosts: officialPosts.map(mapOfficialPost),
    popularCommunityPosts: communityPosts.map(mapCommunityPost),
    stats: {
      openTodoCount,
      officialPostCount,
      communityPostCount,
    },
  };
}
