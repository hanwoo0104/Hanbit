import type { UserRole, UserStatus } from "@/lib/generated/prisma/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      displayName: string;
      studentNumber: string | null;
      status: UserStatus;
    };
  }

  interface User {
    role: UserRole;
    displayName: string;
    studentNumber: string | null;
    status: UserStatus;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    displayName: string;
    studentNumber: string | null;
    status: UserStatus;
  }
}
