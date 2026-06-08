import "server-only";

import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

export type AdminOfficialPostItem = {
  id: string;
  title: string;
  pinned: boolean;
  hidden: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  boardName: string;
  authorName: string;
};

export async function getAdminOfficialPosts(query = "") {
  const trimmedQuery = query.trim();
  const posts = await prisma.post.findMany({
    where: {
      type: "official",
      ...(trimmedQuery
        ? {
            OR: [
              {
                title: {
                  contains: trimmedQuery,
                  mode: "insensitive" as const,
                },
              },
              {
                content: {
                  contains: trimmedQuery,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    },
    orderBy: [
      {
        pinned: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    take: 50,
    include: {
      board: {
        select: {
          name: true,
        },
      },
      author: {
        select: {
          displayName: true,
        },
      },
    },
  });

  return posts.map((post): AdminOfficialPostItem => ({
    id: post.id,
    title: post.title,
    pinned: post.pinned,
    hidden: post.hidden,
    viewCount: post.viewCount,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    boardName: post.board.name,
    authorName: post.author.displayName,
  }));
}

async function findOfficialPost(postId: string) {
  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      type: "official",
    },
    select: {
      id: true,
      pinned: true,
      hidden: true,
    },
  });

  if (!post) {
    notFound();
  }

  return post;
}

export async function toggleOfficialPostPinned(postId: string) {
  const post = await findOfficialPost(postId);

  await prisma.post.update({
    where: {
      id: post.id,
    },
    data: {
      pinned: !post.pinned,
    },
  });

  return {
    postId: post.id,
  };
}

export async function setOfficialPostHidden(postId: string, hidden: boolean) {
  const post = await findOfficialPost(postId);

  await prisma.post.update({
    where: {
      id: post.id,
    },
    data: {
      hidden,
    },
  });

  return {
    postId: post.id,
  };
}

export async function getAdminBoardStats() {
  const [officialTotal, officialHidden, officialPinned] = await Promise.all([
    prisma.post.count({
      where: {
        type: "official",
      },
    }),
    prisma.post.count({
      where: {
        type: "official",
        hidden: true,
      },
    }),
    prisma.post.count({
      where: {
        type: "official",
        hidden: false,
        pinned: true,
      },
    }),
  ]);

  return {
    officialTotal,
    officialHidden,
    officialPinned,
  };
}
