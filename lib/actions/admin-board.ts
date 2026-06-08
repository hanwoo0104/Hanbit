"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/permissions";
import {
  setOfficialPostHidden,
  toggleOfficialPostPinned,
} from "@/lib/dal/admin-board";
import { officialPostAdminSchema } from "@/lib/validators/admin";

function parsePostId(postId: string) {
  return officialPostAdminSchema.parse({
    postId,
  }).postId;
}

function revalidateOfficialAdmin(postId: string) {
  revalidatePath("/");
  revalidatePath("/board");
  revalidatePath(`/board/${postId}`);
  revalidatePath("/admin");
  revalidatePath("/admin/board");
}

export async function toggleOfficialPostPinnedAction(postId: string) {
  await requireRole(["admin"]);
  const result = await toggleOfficialPostPinned(parsePostId(postId));

  revalidateOfficialAdmin(result.postId);
  redirect("/admin/board");
}

export async function hideOfficialPostAdminAction(postId: string) {
  await requireRole(["admin"]);
  const result = await setOfficialPostHidden(parsePostId(postId), true);

  revalidateOfficialAdmin(result.postId);
  redirect("/admin/board");
}

export async function restoreOfficialPostAdminAction(postId: string) {
  await requireRole(["admin"]);
  const result = await setOfficialPostHidden(parsePostId(postId), false);

  revalidateOfficialAdmin(result.postId);
  redirect("/admin/board");
}
