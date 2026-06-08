import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { prisma } from "@/lib/prisma";
import type { UserRole, UserStatus } from "@/lib/generated/prisma/enums";
import { isSchoolEmail, loginSchema } from "@/lib/validators/auth";

const prismaAdapter = PrismaAdapter(
  prisma as unknown as Parameters<typeof PrismaAdapter>[0],
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: prismaAdapter,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: {
          label: "학교 이메일",
          type: "email",
        },
        password: {
          label: "비밀번호",
          type: "password",
        },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success || !isSchoolEmail(parsed.data.email)) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: parsed.data.email,
          },
          select: {
            id: true,
            email: true,
            image: true,
            name: true,
            displayName: true,
            passwordHash: true,
            role: true,
            status: true,
            studentNumber: true,
          },
        });

        if (!user?.passwordHash || user.status !== "active") {
          return null;
        }

        const validPassword = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash,
        );

        if (!validPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          image: user.image,
          name: user.name ?? user.displayName,
          displayName: user.displayName,
          role: user.role,
          status: user.status,
          studentNumber: user.studentNumber,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.displayName = user.displayName;
        token.studentNumber = user.studentNumber;
        token.status = user.status;
      }

      return token;
    },
    session({ session, token }) {
      const user = {
        id: String(token.id),
        role: token.role as UserRole,
        displayName: String(token.displayName ?? ""),
        studentNumber:
          typeof token.studentNumber === "string" ? token.studentNumber : null,
        status: token.status as UserStatus,
      };

      session.user = user as typeof session.user;

      return session;
    },
  },
} satisfies NextAuthConfig);
