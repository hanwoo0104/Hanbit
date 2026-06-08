import { CommunityListPage } from "@/app/community/_components/community-list-page";

type CommunityPageProps = {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    page?: string;
    category?: string;
  }>;
};

export default function CommunityPage({ searchParams }: CommunityPageProps) {
  return <CommunityListPage searchParams={searchParams} />;
}
