"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";

import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getSafeRedirectPath,
  getSchoolEmailDomain,
  isSchoolEmail,
  loginSchema,
  signupSchema,
} from "@/lib/validators/auth";

export type AuthActionState = {
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function validationError(fieldErrors: Partial<Record<string, string[]>>) {
  return {
    message: "입력한 내용을 다시 확인해 주세요.",
    fieldErrors,
  };
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formValue(formData, "email"),
    password: formValue(formData, "password"),
    callbackUrl: formValue(formData, "callbackUrl"),
  });

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  if (!isSchoolEmail(parsed.data.email)) {
    return validationError({
      email: [`${getSchoolEmailDomain()} 학교 이메일만 사용할 수 있습니다.`],
    });
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: getSafeRedirectPath(parsed.data.callbackUrl),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        message: "이메일 또는 비밀번호가 올바르지 않습니다.",
      };
    }

    throw error;
  }

  return {};
}

export async function signupAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    email: formValue(formData, "email"),
    password: formValue(formData, "password"),
    displayName: formValue(formData, "displayName"),
    studentNumber: formValue(formData, "studentNumber"),
  });

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  if (!isSchoolEmail(parsed.data.email)) {
    return validationError({
      email: [`${getSchoolEmailDomain()} 학교 이메일만 사용할 수 있습니다.`],
    });
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        {
          email: parsed.data.email,
        },
        {
          studentNumber: parsed.data.studentNumber,
        },
      ],
    },
    select: {
      email: true,
      studentNumber: true,
    },
  });

  if (existingUser?.email === parsed.data.email) {
    return validationError({
      email: ["이미 가입된 이메일입니다."],
    });
  }

  if (existingUser?.studentNumber === parsed.data.studentNumber) {
    return validationError({
      studentNumber: ["이미 가입된 학번입니다."],
    });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.displayName,
      displayName: parsed.data.displayName,
      studentNumber: parsed.data.studentNumber,
      passwordHash,
      role: "student",
      status: "active",
    },
  });

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        message: "가입은 완료됐지만 자동 로그인에 실패했습니다. 다시 로그인해 주세요.",
      };
    }

    throw error;
  }

  return {};
}

export async function logoutAction() {
  await signOut({
    redirectTo: "/",
  });
}
