import "server-only";

import { ForbiddenError } from "@/lib/auth/permissions";
import type { UserRole, UserStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import type { AdminUserUpdateInput } from "@/lib/validators/admin";

const PAGE_SIZE = 50;

export type AdminUserItem = {
  id: string;
  displayName: string;
  email: string | null;
  studentNumber: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  postCount: number;
  commentCount: number;
  reportCount: number;
};

export async function getAdminUsers(query = ""): Promise<AdminUserItem[]> {
  const trimmedQuery = query.trim();
  const users = await prisma.user.findMany({
    where: trimmedQuery
      ? {
          OR: [
            {
              displayName: {
                contains: trimmedQuery,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: trimmedQuery,
                mode: "insensitive",
              },
            },
            {
              studentNumber: {
                contains: trimmedQuery,
                mode: "insensitive",
              },
            },
          ],
        }
      : {},
    orderBy: [
      {
        role: "desc",
      },
      {
        createdAt: "asc",
      },
    ],
    take: PAGE_SIZE,
    select: {
      id: true,
      displayName: true,
      email: true,
      studentNumber: true,
      role: true,
      status: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          comments: true,
          reports: true,
        },
      },
    },
  });

  return users.map((user) => ({
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    studentNumber: user.studentNumber,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    postCount: user._count.posts,
    commentCount: user._count.comments,
    reportCount: user._count.reports,
  }));
}

async function assertActiveAdminRemains(
  targetUser: {
    id: string;
    role: UserRole;
    status: UserStatus;
  },
  input: AdminUserUpdateInput,
) {
  const removesActiveAdmin =
    targetUser.role === "admin" &&
    targetUser.status === "active" &&
    (input.role !== "admin" || input.status !== "active");

  if (!removesActiveAdmin) {
    return;
  }

  const otherActiveAdminCount = await prisma.user.count({
    where: {
      id: {
        not: targetUser.id,
      },
      role: "admin",
      status: "active",
    },
  });

  if (otherActiveAdminCount === 0) {
    throw new ForbiddenError("마지막 활성 관리자 권한은 제거할 수 없습니다.");
  }
}

export async function updateAdminUser(
  input: AdminUserUpdateInput,
  currentAdminId: string,
) {
  const targetUser = await prisma.user.findUnique({
    where: {
      id: input.userId,
    },
    select: {
      id: true,
      role: true,
      status: true,
    },
  });

  if (!targetUser) {
    throw new Error("사용자를 찾을 수 없습니다.");
  }

  await assertActiveAdminRemains(targetUser, input);

  if (
    targetUser.id === currentAdminId &&
    (input.role !== "admin" || input.status !== "active")
  ) {
    throw new ForbiddenError("현재 로그인한 관리자 계정은 직접 낮출 수 없습니다.");
  }

  return prisma.user.update({
    where: {
      id: targetUser.id,
    },
    data: {
      role: input.role,
      status: input.status,
    },
    select: {
      id: true,
      role: true,
      status: true,
    },
  });
}

export async function getAdminUserStats() {
  const [total, active, pending, suspended, admins] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        status: "active",
      },
    }),
    prisma.user.count({
      where: {
        status: "pending",
      },
    }),
    prisma.user.count({
      where: {
        status: "suspended",
      },
    }),
    prisma.user.count({
      where: {
        role: "admin",
        status: "active",
      },
    }),
  ]);

  return {
    total,
    active,
    pending,
    suspended,
    admins,
  };
}
