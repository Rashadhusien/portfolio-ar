import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { admins } from "@/lib/schema";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import {
  clearFailures,
  isLocked,
  rateLimitKeys,
  recordFailure,
} from "@/lib/login-rate-limit";

class RateLimitedError extends CredentialsSignin {
  code = "rate_limited";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        if (
          typeof credentials?.email !== "string" ||
          typeof credentials?.password !== "string" ||
          !credentials.email ||
          !credentials.password
        ) {
          return null;
        }

        const email = credentials.email.trim().toLowerCase();
        const { emailKey, ipKey } = rateLimitKeys(email, request);

        if (await isLocked([emailKey, ipKey])) {
          throw new RateLimitedError();
        }

        const admin = await db.query.admins.findFirst({
          where: sql`lower(${admins.email}) = ${email}`,
        });

        const isValid =
          !!admin && (await bcrypt.compare(credentials.password, admin.password));

        if (!admin || !isValid) {
          await recordFailure(emailKey, ipKey);
          return null;
        }

        await clearFailures(emailKey);

        return {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: "admin",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
});
