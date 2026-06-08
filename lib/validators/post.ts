import { z } from "zod";

const checkboxSchema = z.preprocess((value) => value === "on" || value === true, z.boolean());

export const officialPostSchema = z.object({
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
  pinned: checkboxSchema.default(false),
});

export type OfficialPostInput = z.infer<typeof officialPostSchema>;

export function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}
