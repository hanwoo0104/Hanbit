import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SignupForm } from "@/components/common/auth-form";
import { getSchoolEmailDomain } from "@/lib/validators/auth";

export default async function SignupPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <SignupForm schoolDomain={getSchoolEmailDomain()} />
    </main>
  );
}
