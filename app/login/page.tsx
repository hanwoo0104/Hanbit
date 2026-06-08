import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginForm } from "@/components/common/auth-form";

type LoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
    error?: string;
  }>;
};

function getPageMessage(error?: string) {
  if (error === "inactive") {
    return "활성 상태인 계정만 로그인할 수 있습니다.";
  }

  if (error) {
    return "로그인에 실패했습니다. 다시 시도해 주세요.";
  }

  return undefined;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }

  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <LoginForm
        callbackUrl={params.callbackUrl}
        pageMessage={getPageMessage(params.error)}
      />
    </main>
  );
}
