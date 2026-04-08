import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

export default {
  providers: [
    GitHub,
    Credentials({
      // Real authorize logic lives in auth.ts (needs bcrypt, not edge-safe here)
      authorize: () => null,
    }),
  ],
} satisfies NextAuthConfig;
