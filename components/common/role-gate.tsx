import type { ReactNode } from "react";

import { requireUser } from "@/lib/auth/permissions";
import type { UserRole } from "@/lib/generated/prisma/enums";

type RoleGateProps = {
  roles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
};

async function canRenderForRoles(roles: UserRole[]) {
  try {
    const user = await requireUser();
    return roles.includes(user.role);
  } catch {
    return false;
  }
}

export async function RoleGate({
  roles,
  children,
  fallback = null,
}: RoleGateProps) {
  const allowed = await canRenderForRoles(roles);

  return allowed ? <>{children}</> : fallback;
}
