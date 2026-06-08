"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginAction, signupAction } from "@/lib/actions/auth";
import type { AuthActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="text-sm text-destructive">{errors[0]}</p>;
}

export function LoginForm({
  callbackUrl,
  pageMessage,
}: {
  callbackUrl?: string;
  pageMessage?: string;
}) {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <Card className="w-full max-w-md rounded-lg border border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">로그인</CardTitle>
        <CardDescription>학교 이메일과 비밀번호를 입력하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-5">
          <input type="hidden" name="callbackUrl" value={callbackUrl ?? "/"} />
          <div className="grid gap-2">
            <Label htmlFor="email">학교 이메일</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(state.fieldErrors?.email) || undefined}
              required
            />
            <FieldError errors={state.fieldErrors?.email} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(state.fieldErrors?.password) || undefined}
              required
            />
            <FieldError errors={state.fieldErrors?.password} />
          </div>
          {(pageMessage || state.message) && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.message ?? pageMessage}
            </p>
          )}
          <Button type="submit" className="h-10 w-full" disabled={pending}>
            {pending ? "확인 중" : "로그인"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            계정이 없다면{" "}
            <Link href="/signup" className="font-medium text-primary">
              회원가입
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

export function SignupForm({ schoolDomain }: { schoolDomain: string }) {
  const [state, formAction, pending] = useActionState(
    signupAction,
    initialState,
  );

  return (
    <Card className="w-full max-w-md rounded-lg border border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">회원가입</CardTitle>
        <CardDescription>{schoolDomain} 이메일로 가입합니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="displayName">표시 이름</Label>
            <Input
              id="displayName"
              name="displayName"
              autoComplete="name"
              aria-invalid={Boolean(state.fieldErrors?.displayName) || undefined}
              required
            />
            <FieldError errors={state.fieldErrors?.displayName} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="studentNumber">학번</Label>
            <Input
              id="studentNumber"
              name="studentNumber"
              inputMode="numeric"
              autoComplete="off"
              aria-invalid={
                Boolean(state.fieldErrors?.studentNumber) || undefined
              }
              required
            />
            <FieldError errors={state.fieldErrors?.studentNumber} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">학교 이메일</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={`name@${schoolDomain}`}
              aria-invalid={Boolean(state.fieldErrors?.email) || undefined}
              required
            />
            <FieldError errors={state.fieldErrors?.email} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(state.fieldErrors?.password) || undefined}
              required
            />
            <FieldError errors={state.fieldErrors?.password} />
          </div>
          {state.message && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.message}
            </p>
          )}
          <Button type="submit" className="h-10 w-full" disabled={pending}>
            {pending ? "가입 중" : "가입하고 시작하기"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            이미 계정이 있다면{" "}
            <Link href="/login" className="font-medium text-primary">
              로그인
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
