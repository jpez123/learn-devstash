import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import authConfig from "./auth.config";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token }) {
      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { isPro: true, passwordChangedAt: true },
        });

        token.isPro = dbUser?.isPro ?? false;

        if (dbUser?.passwordChangedAt && token.iat) {
          const changedAt = Math.floor(dbUser.passwordChangedAt.getTime() / 1000);
          if ((token.iat as number) < changedAt) return null;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      session.user.isPro = (token.isPro as boolean) ?? false;
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  ...authConfig,
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        const verificationEnabled = process.env.EMAIL_VERIFICATION_ENABLED !== "false";
        if (verificationEnabled && !user.emailVerified) return null;

        return user;
      },
    }),
  ],
});
