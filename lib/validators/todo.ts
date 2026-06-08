import { z } from "zod";

const dateStringSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식을 확인해 주세요.")
  .optional()
  .or(z.literal(""));

export const todoInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "할 일은 2자 이상 입력해 주세요.")
    .max(120, "할 일은 120자 이하로 입력해 주세요."),
  dueDate: dateStringSchema,
});

export const todoIdSchema = z.object({
  todoId: z.string().trim().min(1, "할 일을 찾을 수 없습니다."),
});

export type TodoInput = z.infer<typeof todoInputSchema>;
