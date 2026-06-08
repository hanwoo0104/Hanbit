import "server-only";

import { auth } from "@/auth";
import type { PostType, UserRole, UserStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

type PermissionUser = {
  id: string;
  role: UserRole;
  status: UserStatus;
};

type OwnedPost = {
  authorId: string;
  type: PostType;
};

type OwnedComment = {
  authorId: string;
};

export class UnauthorizedError extends Error {
  status = 401;

  constructor(message = "로그인이 필요합니다.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  status = 403;

  constructor(message = "접근 권한이 없습니다.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function getCurrentUser() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      role: true,
      status: true,
      displayName: true,
      studentNumber: true,
    },
  });

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  if (user.status !== "active") {
    throw new ForbiddenError("활성 계정만 사용할 수 있습니다.");
  }

  return user;
}

export async function requireRole(roles: UserRole[]) {
  const user = await requireUser();

  if (!roles.includes(user.role)) {
    throw new ForbiddenError();
  }

  return user;
}

export function isAdmin(user: PermissionUser | null | undefined) {
  return user?.role === "admin";
}

export function canManageOfficialPost(user: PermissionUser | null | undefined) {
  return user?.role === "council" || user?.role === "admin";
}

export function canEditPost(
  user: PermissionUser | null | undefined,
  post: OwnedPost,
) {
  if (!user || user.status !== "active") {
    return false;
  }

  if (isAdmin(user)) {
    return true;
  }

  if (post.type === "official") {
    return canManageOfficialPost(user);
  }

  return post.authorId === user.id;
}

export function canEditComment(
  user: PermissionUser | null | undefined,
  comment: OwnedComment,
) {
  if (!user || user.status !== "active") {
    return false;
  }

  return isAdmin(user) || comment.authorId === user.id;
}
