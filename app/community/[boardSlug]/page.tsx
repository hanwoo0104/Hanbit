import { CommunityListPage } from "@/app/community/_components/community-list-page";

type CommunityBoardPageProps = {
  params: Promise<{
    boardSlug: string;
  }>;
  searchParams: Promise<{
    q?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function CommunityBoardPage({
  params,
  searchParams,
}: CommunityBoardPageProps) {
  const { boardSlug } = await params;

  return (
    <CommunityListPage
      boardSlug={boardSlug}
      strictBoard
      searchParams={searchParams}
    />
  );
}
