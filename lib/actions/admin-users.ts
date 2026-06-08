"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/permissions";
import { updateAdminUser } from "@/lib/dal/admin-users";
import { getFormString } from "@/lib/validators/post";
import { adminUserUpdateSchema } from "@/lib/validators/admin";

export async function updateAdminUserAction(formData: FormData) {
  const admin = await requireRole(["admin"]);
  const parsed = adminUserUpdateSchema.safeParse({
    userId: getFormString(formData, "userId"),
    role: getFormString(formData, "role"),
    status: getFormString(formData, "status"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "사용자 정보를 확인해 주세요.");
  }

  await updateAdminUser(parsed.data, admin.id);

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  redirect("/admin/users");
}
