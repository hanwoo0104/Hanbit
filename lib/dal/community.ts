import "server-only";

import { notFound } from "next/navigation";

import {
  canEditComment,
  canEditPost,
  ForbiddenError,
} from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import type {
  CommunityPostInput,
  CommentInput,
} from "@/lib/validators/post";
import type { UserRole, UserStatus } from "@/lib/generated/prisma/enums";

const PAGE_SIZE = 12;

export type CommunitySort = "latest" | "popular";

export type CommunityViewer = {
  id: string;
  role: UserRole;
  status: UserStatus;
};

export type CommunityBoardItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  postCount: number;
};

export type CommunityPostListItem = {
  id: string;
  title: string;
  excerpt: string;
  hidden: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  boardName: string;
  boardSlug: string;
  authorName: string;
  commentCount: number;
  reactionCount: number;
};

export type CommunityPostListResult = {
  boards: CommunityBoardItem[];
  activeBoard: CommunityBoardItem | null;
  posts: CommunityPostListItem[];
  page: number;
  pageCount: number;
  totalCount: number;
  query: string;
  sort: CommunitySort;
};

export type CommunityCommentItem = {
  id: string;
  authorName: string;
  content: string;
  hidden: boolean;
  createdAt: Date;
  updatedAt: Date;
  canEdit: boolean;
};

export type CommunityPostDetail = {
  id: string;
  boardId: string;
  boardName: string;
  boardSlug: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  hidden: boolean;
  viewCount: number;
  commentCount: number;
  reactionCount: number;
  likedByViewer: boolean;
  canEdit: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CommunityPostDetailResult = {
  post: CommunityPostDetail;
  comments: CommunityCommentItem[];
};

type CommunityPostListOptions = {
  boardSlug?: string;
  query?: string;
  sort?: string;
  page?: number;
  viewer?: CommunityViewer | null;
};

function clampPage(page?: number) {
  if (!page || Number.isNaN(page) || page < 1) {
    return 1;
  }

  return Math.floor(page);
}

export function normalizeCommunitySort(sort?: string): CommunitySort {
  return sort === "popular" ? "popular" : "latest";
}

function makeExcerpt(content: string) {
  const normalized = content.replace(/\s+/g, " ").trim();

  if (normalized.length <= 110) {
    return normalized;
  }

  return `${normalized.slice(0, 110)}...`;
}

function postVisibility(viewer?: CommunityViewer | null) {
  if (viewer?.role === "admin") {
    return {};
  }

  return {
    OR: [
      {
        hidden: false,
      },
      ...(viewer
        ? [
            {
              authorId: viewer.id,
            },
          ]
        : []),
    ],
  };
}

function commentVisibility(viewer?: CommunityViewer | null) {
  if (viewer?.role === "admin") {
    return {};
  }

  return {
    OR: [
      {
        hidden: false,
      },
      ...(viewer
        ? [
            {
              authorId: viewer.id,
            },
          ]
        : []),
    ],
  };
}

function mapBoard(board: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: {
    posts: number;
  };
}): CommunityBoardItem {
  return {
    id: board.id,
    name: board.name,
    slug: board.slug,
    description: board.description,
    postCount: board._count.posts,
  };
}

function mapPostListItem(post: {
  id: string;
  title: string;
  content: string;
  hidden: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  board: {
    name: string;
    slug: string;
  };
  author: {
    displayName: string;
  };
  _count: {
    comments: number;
    reactions: number;
  };
}): CommunityPostListItem {
  return {
    id: post.id,
    title: post.title,
    excerpt: makeExcerpt(post.content),
    hidden: post.hidden,
    viewCount: post.viewCount,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    boardName: post.board.name,
    boardSlug: post.board.slug,
    authorName: post.author.displayName,
    commentCount: post._count.comments,
    reactionCount: post._count.reactions,
  };
}

function mapPostDetail(
  post: {
    id: string;
    boardId: string;
    authorId: string;
    title: string;
    content: string;
    hidden: boolean;
    viewCount: number;
    createdAt: Date;
    updatedAt: Date;
    board: {
      name: string;
      slug: string;
    };
    author: {
      displayName: string;
    };
    reactions: {
      id: string;
    }[];
    _count: {
      comments: number;
      reactions: number;
    };
  },
  viewer?: CommunityViewer | null,
): CommunityPostDetail {
  return {
    id: post.id,
    boardId: post.boardId,
    boardName: post.board.name,
    boardSlug: post.board.slug,
    authorId: post.authorId,
    authorName: post.author.displayName,
    title: post.title,
    content: post.content,
    hidden: post.hidden,
    viewCount: post.viewCount,
    commentCount: post._count.comments,
    reactionCount: post._count.reactions,
    likedByViewer: post.reactions.length > 0,
    canEdit: canEditPost(viewer, {
      authorId: post.authorId,
      type: "community",
    }),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

function mapComment(
  comment: {
    id: string;
    authorId: string;
    content: string;
    hidden: boolean;
    createdAt: Date;
    updatedAt: Date;
    author: {
      displayName: string;
    };
  },
  viewer?: CommunityViewer | null,
): CommunityCommentItem {
  return {
    id: comment.id,
    authorName: comment.author.displayName,
    content: comment.content,
    hidden: comment.hidden,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    canEdit: canEditComment(viewer, {
      authorId: comment.authorId,
    }),
  };
}

export async function getCommunityBoards(): Promise<CommunityBoardItem[]> {
  const boards = await prisma.board.findMany({
    where: {
      type: "community",
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
      description: true,
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });

  return boards.map(mapBoard);
}

export async function getCommunityPostList({
  boardSlug,
  query = "",
  sort,
  page,
  viewer,
}: CommunityPostListOptions = {}): Promise<CommunityPostListResult> {
  const currentPage = clampPage(page);
  const currentSort = normalizeCommunitySort(sort);
  const trimmedQuery = query.trim();
  const visibilityFilter = postVisibility(viewer);
  const searchFilter = trimmedQuery
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
    : {};

  const where = {
    type: "community" as const,
    ...(boardSlug
      ? {
          board: {
            slug: boardSlug,
            type: "community" as const,
          },
        }
      : {
          board: {
            type: "community" as const,
          },
        }),
    AND: [
      ...(Object.keys(visibilityFilter).length > 0 ? [visibilityFilter] : []),
      ...(Object.keys(searchFilter).length > 0 ? [searchFilter] : []),
    ],
  };

  const orderBy =
    currentSort === "popular"
      ? [
          {
            viewCount: "desc" as const,
          },
          {
            createdAt: "desc" as const,
          },
        ]
      : [
          {
            createdAt: "desc" as const,
          },
        ];

  const [boards, posts, totalCount] = await Promise.all([
    getCommunityBoards(),
    prisma.post.findMany({
      where,
      orderBy,
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
    }),
    prisma.post.count({
      where,
    }),
  ]);

  return {
    boards,
    activeBoard: boardSlug
      ? boards.find((board) => board.slug === boardSlug) ?? null
      : null,
    posts: posts.map(mapPostListItem),
    page: currentPage,
    pageCount: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    totalCount,
    query: trimmedQuery,
    sort: currentSort,
  };
}

function communityPostDetailInclude(viewerId?: string) {
  return {
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
    reactions: {
      where: {
        userId: viewerId ?? "__guest__",
        targetType: "post" as const,
      },
      select: {
        id: true,
      },
      take: 1,
    },
    _count: {
      select: {
        comments: true,
        reactions: true,
      },
    },
  };
}

async function findCommunityPost(
  boardSlug: string,
  postId: string,
  viewer?: CommunityViewer | null,
) {
  return prisma.post.findFirst({
    where: {
      id: postId,
      type: "community",
      board: {
        slug: boardSlug,
        type: "community",
      },
      ...postVisibility(viewer),
    },
    include: communityPostDetailInclude(viewer?.id),
  });
}

export async function getCommunityPostDetail({
  boardSlug,
  postId,
  viewer,
  incrementView = false,
}: {
  boardSlug: string;
  postId: string;
  viewer?: CommunityViewer | null;
  incrementView?: boolean;
}): Promise<CommunityPostDetailResult | null> {
  const postPromise = findCommunityPost(boardSlug, postId, viewer);
  const commentsPromise = prisma.comment.findMany({
    where: {
      postId,
      post: {
        type: "community",
      },
      ...commentVisibility(viewer),
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      author: {
        select: {
          displayName: true,
        },
      },
    },
  });

  const [post, comments] = await Promise.all([postPromise, commentsPromise]);

  if (!post) {
    return null;
  }

  const visiblePost = incrementView
    ? await prisma.post.update({
        where: {
          id: post.id,
        },
        data: {
          viewCount: {
            increment: 1,
          },
        },
        include: communityPostDetailInclude(viewer?.id),
      })
    : post;

  return {
    post: mapPostDetail(visiblePost, viewer),
    comments: comments.map((comment) => mapComment(comment, viewer)),
  };
}

export async function getEditableCommunityPost(
  boardSlug: string,
  postId: string,
  viewer: CommunityViewer,
) {
  const post = await findCommunityPost(boardSlug, postId, viewer);

  if (!post) {
    notFound();
  }

  if (
    !canEditPost(viewer, {
      authorId: post.authorId,
      type: "community",
    })
  ) {
    throw new ForbiddenError();
  }

  return mapPostDetail(post, viewer);
}

async function assertCommunityBoard(boardId: string) {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      type: "community",
    },
    select: {
      id: true,
      slug: true,
    },
  });

  if (!board) {
    throw new Error("커뮤니티 게시판을 찾을 수 없습니다.");
  }

  return board;
}

export async function createCommunityPost(
  input: CommunityPostInput,
  authorId: string,
) {
  const board = await assertCommunityBoard(input.boardId);
  const post = await prisma.post.create({
    data: {
      type: "community",
      title: input.title,
      content: input.content,
      boardId: input.boardId,
      authorId,
    },
    select: {
      id: true,
    },
  });

  return {
    id: post.id,
    boardSlug: board.slug,
  };
}

export async function updateCommunityPost(
  postId: string,
  input: CommunityPostInput,
  viewer: CommunityViewer,
) {
  const existingPost = await prisma.post.findFirst({
    where: {
      id: postId,
      type: "community",
      ...postVisibility(viewer),
    },
    select: {
      id: true,
      authorId: true,
      type: true,
    },
  });

  if (!existingPost) {
    notFound();
  }

  if (!canEditPost(viewer, existingPost)) {
    throw new ForbiddenError();
  }

  const board = await assertCommunityBoard(input.boardId);
  await prisma.post.update({
    where: {
      id: existingPost.id,
    },
    data: {
      title: input.title,
      content: input.content,
      boardId: input.boardId,
    },
  });

  return {
    id: existingPost.id,
    boardSlug: board.slug,
  };
}

export async function hideCommunityPost(postId: string, viewer: CommunityViewer) {
  const existingPost = await prisma.post.findFirst({
    where: {
      id: postId,
      type: "community",
      ...postVisibility(viewer),
    },
    select: {
      id: true,
      authorId: true,
      type: true,
      board: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (!existingPost) {
    notFound();
  }

  if (!canEditPost(viewer, existingPost)) {
    throw new ForbiddenError();
  }

  await prisma.post.update({
    where: {
      id: existingPost.id,
    },
    data: {
      hidden: true,
    },
  });

  return {
    boardSlug: existingPost.board.slug,
  };
}

export async function createComment(
  postId: string,
  input: CommentInput,
  authorId: string,
) {
  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      type: "community",
      hidden: false,
      board: {
        type: "community",
      },
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

  await prisma.comment.create({
    data: {
      postId: post.id,
      authorId,
      content: input.content,
    },
  });

  return {
    postId: post.id,
    boardSlug: post.board.slug,
  };
}

async function findCommunityComment(commentId: string) {
  return prisma.comment.findFirst({
    where: {
      id: commentId,
      post: {
        type: "community",
      },
    },
    select: {
      id: true,
      authorId: true,
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
}

export async function updateComment(
  commentId: string,
  input: CommentInput,
  viewer: CommunityViewer,
) {
  const comment = await findCommunityComment(commentId);

  if (!comment) {
    notFound();
  }

  if (!canEditComment(viewer, comment)) {
    throw new ForbiddenError();
  }

  await prisma.comment.update({
    where: {
      id: comment.id,
    },
    data: {
      content: input.content,
    },
  });

  return {
    postId: comment.postId,
    boardSlug: comment.post.board.slug,
  };
}

export async function hideComment(commentId: string, viewer: CommunityViewer) {
  const comment = await findCommunityComment(commentId);

  if (!comment) {
    notFound();
  }

  if (!canEditComment(viewer, comment)) {
    throw new ForbiddenError();
  }

  await prisma.comment.update({
    where: {
      id: comment.id,
    },
    data: {
      hidden: true,
    },
  });

  return {
    postId: comment.postId,
    boardSlug: comment.post.board.slug,
  };
}

export async function togglePostReaction(postId: string, userId: string) {
  const post = await prisma.post.findFirst({
    where: {
      id: postId,
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

  const existingReaction = await prisma.reaction.findFirst({
    where: {
      userId,
      targetType: "post",
      postId: post.id,
    },
    select: {
      id: true,
    },
  });

  if (existingReaction) {
    await prisma.reaction.delete({
      where: {
        id: existingReaction.id,
      },
    });
  } else {
    await prisma.reaction.create({
      data: {
        userId,
        targetType: "post",
        postId: post.id,
      },
    });
  }

  return {
    postId: post.id,
    boardSlug: post.board.slug,
  };
}
