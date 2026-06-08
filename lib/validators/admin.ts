import { z } from "zod";

export const reportStatusFilterSchema = z
  .enum(["all", "pending", "reviewed", "dismissed"])
  .default("pending");

export const reportIdSchema = z.object({
  reportId: z.string().trim().min(1, "신고를 찾을 수 없습니다."),
});

export const adminUserUpdateSchema = z.object({
  userId: z.string().trim().min(1, "사용자를 찾을 수 없습니다."),
  role: z.enum(["student", "council", "admin"]),
  status: z.enum(["active", "pending", "suspended"]),
});

export const officialPostAdminSchema = z.object({
  postId: z.string().trim().min(1, "공식 게시글을 찾을 수 없습니다."),
});

export type ReportStatusFilter = z.infer<typeof reportStatusFilterSchema>;
export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>;
