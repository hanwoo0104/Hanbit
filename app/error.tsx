"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
      <section className="grid w-full max-w-md gap-4 rounded-lg border border-border bg-card p-6 text-center">
        <p className="text-sm font-medium text-primary">오류</p>
        <h1 className="text-2xl font-semibold">화면을 불러오지 못했습니다</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          잠시 후 다시 시도하거나 홈으로 이동해 주세요.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button type="button" onClick={reset} className="h-10">
            다시 시도
          </Button>
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            홈으로
          </Link>
        </div>
      </section>
    </main>
  );
}
