"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/permissions";
import {
  createOfficialPost,
  hideOfficialPost,
  updateOfficialPost,
} from "@/lib/dal/official-board";
import { getFormString, officialPostSchema } from "@/lib/validators/post";

export type PostEditorState = {
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

function parseOfficialPostForm(formData: FormData) {
  return officialPostSchema.safeParse({
    title: getFormString(formData, "title"),
    content: getFormString(formData, "content"),
    boardId: getFormString(formData, "boardId"),
    pinned: formData.get("pinned"),
  });
}

function validationError(fieldErrors: Partial<Record<string, string[]>>) {
  return {
    message: "입력한 내용을 다시 확인해 주세요.",
    fieldErrors,
  };
}

export async function createOfficialPostAction(
  _previousState: PostEditorState,
  formData: FormData,
): Promise<PostEditorState> {
  const user = await requireRole(["council", "admin"]);
  const parsed = parseOfficialPostForm(formData);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const post = await createOfficialPost(parsed.data, user.id);

  revalidatePath("/");
  revalidatePath("/board");
  redirect(`/board/${post.id}`);
}

export async function updateOfficialPostAction(
  postId: string,
  _previousState: PostEditorState,
  formData: FormData,
): Promise<PostEditorState> {
  await requireRole(["council", "admin"]);
  const parsed = parseOfficialPostForm(formData);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const post = await updateOfficialPost(postId, parsed.data);

  revalidatePath("/");
  revalidatePath("/board");
  revalidatePath(`/board/${post.id}`);
  redirect(`/board/${post.id}`);
}

export async function deleteOfficialPostAction(postId: string) {
  await requireRole(["council", "admin"]);
  await hideOfficialPost(postId);

  revalidatePath("/");
  revalidatePath("/board");
  redirect("/board");
}
