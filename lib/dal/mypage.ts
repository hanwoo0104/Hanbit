import "server-only";

import { prisma } from "@/lib/prisma";
import type { UserRole, UserStatus } from "@/lib/generated/prisma/enums";

export type MyPageProfile = {
  id: string;
  displayName: string;
  email: string | null;
  studentNumber: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  postCount: number;
  commentCount: number;
  todoCount: number;
};

export type MyPagePostItem = {
  id: string;
  title: string;
  type: "official" | "community";
  hidden: boolean;
  boardName: string;
  href: string | null;
  editHref: string | null;
  createdAt: Date;
  updatedAt: Date;
  commentCount: number;
  reactionCount: number;
  viewCount: number;
};

export type MyPageCommentItem = {
  id: string;
  content: string;
  hidden: boolean;
  postHidden: boolean;
  postTitle: string;
  boardName: string;
  href: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MyPageTodoItem = {
  id: string;
  title: string;
  dueDate: Date | null;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type MyPageData = {
  profile: MyPageProfile;
  posts: MyPagePostItem[];
  comments: MyPageCommentItem[];
  todos: MyPageTodoItem[];
};

function postHref(post: {
  id: string;
  type: "official" | "community";
  hidden: boolean;
  authorId: string;
  board: {
    slug: string;
  };
}, user: { id: string; role: UserRole }) {
  if (post.hidden && post.authorId !== user.id && user.role !== "admin") {
    return null;
  }

  if (post.type === "official") {
    return post.hidden ? null : `/board/${post.id}`;
  }

  return `/community/${post.board.slug}/${post.id}`;
}

function postEditHref(post: {
  id: string;
  type: "official" | "community";
  authorId: string;
  board: {
    slug: string;
  };
}, user: { id: string; role: UserRole }) {
  if (post.type === "official") {
    return user.role === "admin" || user.role === "council"
      ? `/board/${post.id}/edit`
      : null;
  }

  return post.authorId === user.id || user.role === "admin"
    ? `/community/${post.board.slug}/${post.id}/edit`
    : null;
}

function commentHref(comment: {
  post: {
    id: string;
    type: "official" | "community";
    hidden: boolean;
    authorId: string;
    board: {
      slug: string;
    };
  };
}, user: { id: string; role: UserRole }) {
  const href = postHref(comment.post, user);

  return href ? `${href}#comments` : null;
}

export async function getMyPageData(user: {
  id: string;
  role: UserRole;
}): Promise<MyPageData> {
  const [profile, posts, comments, todos] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: {
        id: user.id,
      },
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
            todos: true,
          },
        },
      },
    }),
    prisma.post.findMany({
      where: {
        authorId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      include: {
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
    prisma.comment.findMany({
      where: {
        authorId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      include: {
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
    }),
    prisma.todo.findMany({
      where: {
        userId: user.id,
      },
      orderBy: [
        {
          completed: "asc",
        },
        {
          dueDate: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
      take: 30,
    }),
  ]);

  return {
    profile: {
      id: profile.id,
      displayName: profile.displayName,
      email: profile.email,
      studentNumber: profile.studentNumber,
      role: profile.role,
      status: profile.status,
      createdAt: profile.createdAt,
      postCount: profile._count.posts,
      commentCount: profile._count.comments,
      todoCount: profile._count.todos,
    },
    posts: posts.map((post) => ({
      id: post.id,
      title: post.title,
      type: post.type,
      hidden: post.hidden,
      boardName: post.board.name,
      href: postHref(post, user),
      editHref: postEditHref(post, user),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      commentCount: post._count.comments,
      reactionCount: post._count.reactions,
      viewCount: post.viewCount,
    })),
    comments: comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      hidden: comment.hidden,
      postHidden: comment.post.hidden,
      postTitle: comment.post.title,
      boardName: comment.post.board.name,
      href: commentHref(comment, user),
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    })),
    todos,
  };
}
