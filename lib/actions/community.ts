"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/permissions";
import {
  createComment,
  createCommunityPost,
  createReport,
  hideComment,
  hideCommunityPost,
  togglePostReaction,
  updateComment,
  updateCommunityPost,
} from "@/lib/dal/community";
import {
  commentSchema,
  communityPostSchema,
  getFormString,
  reportSchema,
} from "@/lib/validators/post";

type PostEditorState = {
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

function validationError(fieldErrors: Partial<Record<string, string[]>>) {
  return {
    message: "입력한 내용을 다시 확인해 주세요.",
    fieldErrors,
  };
}

function parseCommunityPostForm(formData: FormData) {
  return communityPostSchema.safeParse({
    title: getFormString(formData, "title"),
    content: getFormString(formData, "content"),
    boardId: getFormString(formData, "boardId"),
  });
}

function parseCommentForm(formData: FormData) {
  return commentSchema.safeParse({
    content: getFormString(formData, "content"),
  });
}

function parseReportForm(formData: FormData) {
  return reportSchema.safeParse({
    targetType: getFormString(formData, "targetType"),
    targetId: getFormString(formData, "targetId"),
    reason: getFormString(formData, "reason"),
  });
}

function revalidateCommunityPost(boardSlug: string, postId: string) {
  revalidatePath("/");
  revalidatePath("/community");
  revalidatePath(`/community/${boardSlug}`);
  revalidatePath(`/community/${boardSlug}/${postId}`);
}

export async function createCommunityPostAction(
  _previousState: PostEditorState,
  formData: FormData,
): Promise<PostEditorState> {
  const user = await requireUser();
  const parsed = parseCommunityPostForm(formData);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const post = await createCommunityPost(parsed.data, user.id);

  revalidateCommunityPost(post.boardSlug, post.id);
  redirect(`/community/${post.boardSlug}/${post.id}`);
}

export async function updateCommunityPostAction(
  postId: string,
  _previousState: PostEditorState,
  formData: FormData,
): Promise<PostEditorState> {
  const user = await requireUser();
  const parsed = parseCommunityPostForm(formData);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const post = await updateCommunityPost(postId, parsed.data, user);

  revalidateCommunityPost(post.boardSlug, post.id);
  redirect(`/community/${post.boardSlug}/${post.id}`);
}

export async function deleteCommunityPostAction(postId: string) {
  const user = await requireUser();
  const post = await hideCommunityPost(postId, user);

  revalidatePath("/");
  revalidatePath("/community");
  revalidatePath(`/community/${post.boardSlug}`);
  redirect(`/community/${post.boardSlug}`);
}

export async function createCommentAction(postId: string, formData: FormData) {
  const user = await requireUser();
  const parsed = parseCommentForm(formData);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "댓글을 확인해 주세요.");
  }

  const comment = await createComment(postId, parsed.data, user.id);

  revalidateCommunityPost(comment.boardSlug, comment.postId);
  redirect(`/community/${comment.boardSlug}/${comment.postId}#comments`);
}

export async function updateCommentAction(commentId: string, formData: FormData) {
  const user = await requireUser();
  const parsed = parseCommentForm(formData);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "댓글을 확인해 주세요.");
  }

  const comment = await updateComment(commentId, parsed.data, user);

  revalidateCommunityPost(comment.boardSlug, comment.postId);
  redirect(`/community/${comment.boardSlug}/${comment.postId}#comments`);
}

export async function deleteCommentAction(commentId: string) {
  const user = await requireUser();
  const comment = await hideComment(commentId, user);

  revalidateCommunityPost(comment.boardSlug, comment.postId);
  redirect(`/community/${comment.boardSlug}/${comment.postId}#comments`);
}

export async function togglePostReactionAction(postId: string) {
  const user = await requireUser();
  const post = await togglePostReaction(postId, user.id);

  revalidateCommunityPost(post.boardSlug, post.postId);
  redirect(`/community/${post.boardSlug}/${post.postId}`);
}

export async function createReportAction(formData: FormData) {
  const user = await requireUser();
  const parsed = parseReportForm(formData);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "신고 사유를 확인해 주세요.");
  }

  const report = await createReport(parsed.data, user.id);

  revalidateCommunityPost(report.boardSlug, report.postId);
  redirect(`/community/${report.boardSlug}/${report.postId}#reports`);
}
