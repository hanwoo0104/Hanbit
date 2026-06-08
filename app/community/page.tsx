import { auth } from "@/auth";
import { SiteHeader } from "@/components/common/site-header";

type CommunityPageProps = {
  searchParams: Promise<{
    category?: string;
  }>;
};

const categoryLabels: Record<string, string> = {
  dorm: "기숙사",
  study: "스터디",
};

export default async function CommunityPage({
  searchParams,
}: CommunityPageProps) {
  const [session, params] = await Promise.all([auth(), searchParams]);
  const category = params.category ? categoryLabels[params.category] : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader user={session?.user} />
      <main className="mx-auto grid w-full max-w-5xl gap-4 px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-sm font-medium text-primary">커뮤니티</p>
        <h1 className="text-3xl font-semibold">
          {category ? `${category} 커뮤니티` : "학생 커뮤니티"}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          카테고리형 게시글 목록과 검색, 정렬, 글쓰기는 TASK-07에서 구현합니다.
        </p>
      </main>
    </div>
  );
}
