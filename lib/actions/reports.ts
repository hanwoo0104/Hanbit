"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole, requireUser } from "@/lib/auth/permissions";
import {
  createReport,
  dismissReport,
  hideReportedTarget,
  markReportReviewed,
} from "@/lib/dal/reports";
import { getFormString, reportSchema } from "@/lib/validators/post";
import { reportIdSchema } from "@/lib/validators/admin";

function parseReportForm(formData: FormData) {
  return reportSchema.safeParse({
    targetType: getFormString(formData, "targetType"),
    targetId: getFormString(formData, "targetId"),
    reason: getFormString(formData, "reason"),
  });
}

function parseReportId(reportId: string) {
  return reportIdSchema.parse({
    reportId,
  }).reportId;
}

function revalidateReportTarget(result: { path: string; boardPath: string }) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/reports");
  revalidatePath("/community");
  revalidatePath(result.boardPath);
  revalidatePath(result.path);
}

function revalidateCreatedReport(boardSlug: string, postId: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/reports");
  revalidatePath("/community");
  revalidatePath(`/community/${boardSlug}`);
  revalidatePath(`/community/${boardSlug}/${postId}`);
}

export async function createReportAction(formData: FormData) {
  const user = await requireUser();
  const parsed = parseReportForm(formData);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "신고 사유를 확인해 주세요.");
  }

  const report = await createReport(parsed.data, user.id);

  revalidateCreatedReport(report.boardSlug, report.postId);
  redirect(`/community/${report.boardSlug}/${report.postId}#reports`);
}

export async function markReportReviewedAction(reportId: string) {
  await requireRole(["admin"]);
  const result = await markReportReviewed(parseReportId(reportId));

  revalidateReportTarget(result);
  redirect("/admin/reports");
}

export async function dismissReportAction(reportId: string) {
  await requireRole(["admin"]);
  const result = await dismissReport(parseReportId(reportId));

  revalidateReportTarget(result);
  redirect("/admin/reports");
}

export async function hideReportedTargetAction(reportId: string) {
  await requireRole(["admin"]);
  const result = await hideReportedTarget(parseReportId(reportId));

  revalidateReportTarget(result);
  redirect("/admin/reports");
}
