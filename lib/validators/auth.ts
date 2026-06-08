import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("올바른 이메일을 입력해 주세요.");

const passwordSchema = z
  .string()
  .min(8, "비밀번호는 8자 이상이어야 합니다.")
  .max(72, "비밀번호는 72자 이하로 입력해 주세요.")
  .regex(/[A-Za-z]/, "영문자를 1자 이상 포함해 주세요.")
  .regex(/[0-9]/, "숫자를 1자 이상 포함해 주세요.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "비밀번호를 입력해 주세요."),
  callbackUrl: z.string().optional(),
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: z
    .string()
    .trim()
    .min(2, "표시 이름은 2자 이상이어야 합니다.")
    .max(20, "표시 이름은 20자 이하로 입력해 주세요."),
  studentNumber: z
    .string()
    .trim()
    .min(4, "학번은 4자 이상이어야 합니다.")
    .max(20, "학번은 20자 이하로 입력해 주세요.")
    .regex(/^[0-9A-Za-z-]+$/, "학번은 영문, 숫자, 하이픈만 사용할 수 있습니다."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

export function getSchoolEmailDomain() {
  const domain = process.env.SCHOOL_EMAIL_DOMAIN?.trim().toLowerCase();

  if (!domain) {
    throw new Error("SCHOOL_EMAIL_DOMAIN is required.");
  }

  return domain.replace(/^@/, "");
}

export function isSchoolEmail(email: string) {
  return email.toLowerCase().endsWith(`@${getSchoolEmailDomain()}`);
}

export function getSafeRedirectPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  try {
    const url = new URL(value, "https://hanbit.local");
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}
