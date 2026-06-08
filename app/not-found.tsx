import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
      <section className="grid w-full max-w-md gap-4 rounded-lg border border-border bg-card p-6 text-center">
        <p className="text-sm font-medium text-primary">404</p>
        <h1 className="text-2xl font-semibold">페이지를 찾을 수 없습니다</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          주소가 바뀌었거나 접근할 수 없는 콘텐츠일 수 있습니다.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            홈으로
          </Link>
          <Link
            href="/community"
            className="inline-flex h-10 items-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            커뮤니티
          </Link>
        </div>
      </section>
    </main>
  );
}
