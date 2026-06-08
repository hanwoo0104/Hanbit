import "server-only";

import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import type { OfficialPostInput } from "@/lib/validators/post";

const PAGE_SIZE = 10;

export type OfficialBoardItem = {
  id: string;
  name: string;
  slug: string;
};

export type OfficialPostListItem = {
  id: string;
  title: string;
  excerpt: string;
  pinned: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  boardName: string;
  authorName: string;
};

export type OfficialPostDetail = {
  id: string;
  boardId: string;
  title: string;
  content: string;
  pinned: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  boardName: string;
  authorName: string;
};

export type OfficialPostListResult = {
  boards: OfficialBoardItem[];
  posts: OfficialPostListItem[];
  page: number;
  pageCount: number;
  totalCount: number;
  query: string;
  boardId?: string;
};

type OfficialPostListOptions = {
  query?: string;
  boardId?: string;
  page?: number;
};

function clampPage(page?: number) {
  if (!page || Number.isNaN(page) || page < 1) {
    return 1;
  }

  return Math.floor(page);
}

function makeExcerpt(content: string) {
  const normalized = content.replace(/\s+/g, " ").trim();

  if (normalized.length <= 110) {
    return normalized;
  }

  return `${normalized.slice(0, 110)}...`;
}

function mapPostListItem(post: {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  board: {
    name: string;
  };
  author: {
    displayName: string;
  };
}): OfficialPostListItem {
  return {
    id: post.id,
    title: post.title,
    excerpt: makeExcerpt(post.content),
    pinned: post.pinned,
    viewCount: post.viewCount,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    boardName: post.board.name,
    authorName: post.author.displayName,
  };
}

function mapPostDetail(post: {
  id: string;
  boardId: string;
  title: string;
  content: string;
  pinned: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  board: {
    name: string;
  };
  author: {
    displayName: string;
  };
}): OfficialPostDetail {
  return {
    id: post.id,
    boardId: post.boardId,
    title: post.title,
    content: post.content,
    pinned: post.pinned,
    viewCount: post.viewCount,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    boardName: post.board.name,
    authorName: post.author.displayName,
  };
}

export async function getOfficialBoards(): Promise<OfficialBoardItem[]> {
  return prisma.board.findMany({
    where: {
      type: "official",
    },
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        name: "asc",
      },
    ],
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}

export async function getOfficialPostList({
  query = "",
  boardId,
  page,
}: OfficialPostListOptions = {}): Promise<OfficialPostListResult> {
  const currentPage = clampPage(page);
  const trimmedQuery = query.trim();

  const where = {
    type: "official" as const,
    hidden: false,
    ...(boardId ? { boardId } : {}),
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
  };

  const [boards, posts, totalCount] = await Promise.all([
    getOfficialBoards(),
    prisma.post.findMany({
      where,
      orderBy: [
        {
          pinned: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        author: {
          select: {
            displayName: true,
          },
        },
        board: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.post.count({
      where,
    }),
  ]);

  return {
    boards,
    posts: posts.map(mapPostListItem),
    page: currentPage,
    pageCount: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    totalCount,
    query: trimmedQuery,
    boardId,
  };
}

async function findOfficialPost(postId: string) {
  return prisma.post.findFirst({
    where: {
      id: postId,
      type: "official",
      hidden: false,
    },
    include: {
      author: {
        select: {
          displayName: true,
        },
      },
      board: {
        select: {
          name: true,
          type: true,
        },
      },
    },
  });
}

export async function getOfficialPost(
  postId: string,
  { incrementView = false }: { incrementView?: boolean } = {},
) {
  const post = await findOfficialPost(postId);

  if (!post || post.board.type !== "official") {
    return null;
  }

  if (!incrementView) {
    return mapPostDetail(post);
  }

  const updatedPost = await prisma.post.update({
    where: {
      id: post.id,
    },
    data: {
      viewCount: {
        increment: 1,
      },
    },
    include: {
      author: {
        select: {
          displayName: true,
        },
      },
      board: {
        select: {
          name: true,
        },
      },
    },
  });

  return mapPostDetail(updatedPost);
}

export async function getOfficialPostOrNotFound(postId: string) {
  const post = await getOfficialPost(postId);

  if (!post) {
    notFound();
  }

  return post;
}

async function assertOfficialBoard(boardId: string) {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      type: "official",
    },
    select: {
      id: true,
    },
  });

  if (!board) {
    throw new Error("공식 게시판을 찾을 수 없습니다.");
  }
}

export async function createOfficialPost(
  input: OfficialPostInput,
  authorId: string,
) {
  await assertOfficialBoard(input.boardId);

  return prisma.post.create({
    data: {
      type: "official",
      title: input.title,
      content: input.content,
      pinned: input.pinned,
      boardId: input.boardId,
      authorId,
    },
    select: {
      id: true,
    },
  });
}

export async function updateOfficialPost(
  postId: string,
  input: OfficialPostInput,
) {
  await assertOfficialBoard(input.boardId);

  const existingPost = await findOfficialPost(postId);

  if (!existingPost || existingPost.board.type !== "official") {
    notFound();
  }

  return prisma.post.update({
    where: {
      id: existingPost.id,
    },
    data: {
      title: input.title,
      content: input.content,
      pinned: input.pinned,
      boardId: input.boardId,
    },
    select: {
      id: true,
    },
  });
}

export async function hideOfficialPost(postId: string) {
  const existingPost = await findOfficialPost(postId);

  if (!existingPost || existingPost.board.type !== "official") {
    notFound();
  }

  await prisma.post.update({
    where: {
      id: existingPost.id,
    },
    data: {
      hidden: true,
    },
  });
}
