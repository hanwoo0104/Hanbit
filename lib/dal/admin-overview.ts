import "server-only";

import { getAdminBoardStats } from "@/lib/dal/admin-board";
import { getAdminUserStats } from "@/lib/dal/admin-users";
import { prisma } from "@/lib/prisma";

export async function getAdminOverview() {
  const [pendingReports, hiddenCommunityPosts, userStats, boardStats] =
    await Promise.all([
      prisma.report.count({
        where: {
          status: "pending",
        },
      }),
      prisma.post.count({
        where: {
          type: "community",
          hidden: true,
        },
      }),
      getAdminUserStats(),
      getAdminBoardStats(),
    ]);

  return {
    pendingReports,
    hiddenCommunityPosts,
    userStats,
    boardStats,
  };
}
