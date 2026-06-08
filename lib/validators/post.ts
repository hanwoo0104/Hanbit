import { z } from "zod";

const checkboxSchema = z.preprocess((value) => value === "on" || value === true, z.boolean());
const targetTypeSchema = z.enum(["post", "comment"]);

const postBaseSchema = {
  title: z
    .string()
    .trim()
    .min(2, "제목은 2자 이상이어야 합니다.")
    .max(120, "제목은 120자 이하로 입력해 주세요."),
  content: z
    .string()
    .trim()
    .min(10, "본문은 10자 이상이어야 합니다.")
    .max(10000, "본문은 10,000자 이하로 입력해 주세요."),
  boardId: z.string().trim().min(1, "게시판을 선택해 주세요."),
};

export const officialPostSchema = z.object({
  ...postBaseSchema,
  pinned: checkboxSchema.default(false),
});

export const communityPostSchema = z.object(postBaseSchema);

export const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(2, "댓글은 2자 이상이어야 합니다.")
    .max(2000, "댓글은 2,000자 이하로 입력해 주세요."),
});

export const reportSchema = z.object({
  targetType: targetTypeSchema,
  targetId: z.string().trim().min(1, "신고 대상을 찾을 수 없습니다."),
  reason: z
    .string()
    .trim()
    .min(5, "신고 사유는 5자 이상 입력해 주세요.")
    .max(1000, "신고 사유는 1,000자 이하로 입력해 주세요."),
});

export type OfficialPostInput = z.infer<typeof officialPostSchema>;
export type CommunityPostInput = z.infer<typeof communityPostSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type ReportInput = z.infer<typeof reportSchema>;

export function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}
