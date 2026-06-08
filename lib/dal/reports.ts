import "server-only";

import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import type { ReportInput } from "@/lib/validators/post";
import type { ReportStatusFilter } from "@/lib/validators/admin";
import type {
  PostType,
  ReportStatus,
  TargetType,
} from "@/lib/generated/prisma/enums";

export type AdminReportTarget = {
  id: string;
  title: string;
  content: string;
  hidden: boolean;
  href: string;
  authorName: string;
  boardName: string;
  postType: PostType;
};

export type AdminReportItem = {
  id: string;
  status: ReportStatus;
  targetType: TargetType;
  reason: string;
  createdAt: Date;
  reviewedAt: Date | null;
  reporterName: string;
  reporterEmail: string | null;
  target: AdminReportTarget | null;
};

export type AdminReportListResult = {
  reports: AdminReportItem[];
  status: ReportStatusFilter;
  counts: {
    all: number;
    pending: number;
    reviewed: number;
    dismissed: number;
  };
};

function postHref(post: {
  id: string;
  type: PostType;
  board: {
    slug: string;
  };
}) {
  if (post.type === "official") {
    return `/board/${post.id}`;
  }

  return `/community/${post.board.slug}/${post.id}`;
}

function mapReport(report: {
  id: string;
  status: ReportStatus;
  targetType: TargetType;
  reason: string;
  createdAt: Date;
  reviewedAt: Date | null;
  reporter: {
    displayName: string;
    email: string | null;
  };
  post: null | {
    id: string;
    type: PostType;
    title: string;
    content: string;
    hidden: boolean;
    author: {
      displayName: string;
    };
    board: {
      name: string;
      slug: string;
    };
  };
  comment: null | {
    id: string;
    content: string;
    hidden: boolean;
    author: {
      displayName: string;
    };
    post: {
      id: string;
      type: PostType;
      title: string;
      board: {
        name: string;
        slug: string;
      };
    };
  };
}): AdminReportItem {
  const target =
    report.targetType === "post" && report.post
      ? {
          id: report.post.id,
          title: report.post.title,
          content: report.post.content,
          hidden: report.post.hidden,
          href: postHref(report.post),
          authorName: report.post.author.displayName,
          boardName: report.post.board.name,
          postType: report.post.type,
        }
      : report.comment
        ? {
            id: report.comment.id,
            title: report.comment.post.title,
            content: report.comment.content,
            hidden: report.comment.hidden,
            href: `${postHref(report.comment.post)}#comments`,
            authorName: report.comment.author.displayName,
            boardName: report.comment.post.board.name,
            postType: report.comment.post.type,
          }
        : null;

  return {
    id: report.id,
    status: report.status,
    targetType: report.targetType,
    reason: report.reason,
    createdAt: report.createdAt,
    reviewedAt: report.reviewedAt,
    reporterName: report.reporter.displayName,
    reporterEmail: report.reporter.email,
    target,
  };
}

export async function createReport(input: ReportInput, reporterId: string) {
  if (input.targetType === "post") {
    const post = await prisma.post.findFirst({
      where: {
        id: input.targetId,
        type: "community",
        hidden: false,
      },
      select: {
        id: true,
        board: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (!post) {
      notFound();
    }

    await prisma.report.create({
      data: {
        reporterId,
        targetType: "post",
        postId: post.id,
        reason: input.reason,
      },
    });

    return {
      postId: post.id,
      boardSlug: post.board.slug,
    };
  }

  const comment = await prisma.comment.findFirst({
    where: {
      id: input.targetId,
      hidden: false,
      post: {
        type: "community",
        hidden: false,
      },
    },
    select: {
      id: true,
      postId: true,
      post: {
        select: {
          board: {
            select: {
              slug: true,
            },
          },
        },
      },
    },
  });

  if (!comment) {
    notFound();
  }

  await prisma.report.create({
    data: {
      reporterId,
      targetType: "comment",
      commentId: comment.id,
      reason: input.reason,
    },
  });

  return {
    postId: comment.postId,
    boardSlug: comment.post.board.slug,
  };
}

export async function getAdminReports(
  status: ReportStatusFilter,
): Promise<AdminReportListResult> {
  const where = status === "all" ? {} : { status };
  const [reports, all, pending, reviewed, dismissed] = await Promise.all([
    prisma.report.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
      include: {
        reporter: {
          select: {
            displayName: true,
            email: true,
          },
        },
        post: {
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
          },
        },
        comment: {
          include: {
            author: {
              select: {
                displayName: true,
              },
            },
            post: {
              include: {
                board: {
                  select: {
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.report.count(),
    prisma.report.count({
      where: {
        status: "pending",
      },
    }),
    prisma.report.count({
      where: {
        status: "reviewed",
      },
    }),
    prisma.report.count({
      where: {
        status: "dismissed",
      },
    }),
  ]);

  return {
    reports: reports.map(mapReport),
    status,
    counts: {
      all,
      pending,
      reviewed,
      dismissed,
    },
  };
}

async function getReportTargetPath(reportId: string) {
  const report = await prisma.report.findUnique({
    where: {
      id: reportId,
    },
    include: {
      post: {
        include: {
          board: {
            select: {
              slug: true,
            },
          },
        },
      },
      comment: {
        include: {
          post: {
            include: {
              board: {
                select: {
                  slug: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!report) {
    notFound();
  }

  if (report.post) {
    return {
      report,
      path:
        report.post.type === "official"
          ? `/board/${report.post.id}`
          : `/community/${report.post.board.slug}/${report.post.id}`,
      boardPath:
        report.post.type === "official"
          ? "/board"
          : `/community/${report.post.board.slug}`,
    };
  }

  if (report.comment) {
    return {
      report,
      path: `/community/${report.comment.post.board.slug}/${report.comment.postId}`,
      boardPath: `/community/${report.comment.post.board.slug}`,
    };
  }

  return {
    report,
    path: "/admin/reports",
    boardPath: "/community",
  };
}

export async function markReportReviewed(reportId: string) {
  const { path, boardPath } = await getReportTargetPath(reportId);

  await prisma.report.update({
    where: {
      id: reportId,
    },
    data: {
      status: "reviewed",
      reviewedAt: new Date(),
    },
  });

  return {
    path,
    boardPath,
  };
}

export async function dismissReport(reportId: string) {
  const { path, boardPath } = await getReportTargetPath(reportId);

  await prisma.report.update({
    where: {
      id: reportId,
    },
    data: {
      status: "dismissed",
      reviewedAt: new Date(),
    },
  });

  return {
    path,
    boardPath,
  };
}

export async function hideReportedTarget(reportId: string) {
  const { report, path, boardPath } = await getReportTargetPath(reportId);

  await prisma.$transaction(async (tx) => {
    if (report.postId) {
      await tx.post.update({
        where: {
          id: report.postId,
        },
        data: {
          hidden: true,
        },
      });
    }

    if (report.commentId) {
      await tx.comment.update({
        where: {
          id: report.commentId,
        },
        data: {
          hidden: true,
        },
      });
    }

    await tx.report.update({
      where: {
        id: reportId,
      },
      data: {
        status: "reviewed",
        reviewedAt: new Date(),
      },
    });
  });

  return {
    path,
    boardPath,
  };
}
