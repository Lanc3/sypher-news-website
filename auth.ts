import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";

// NextAuth v5 prefers AUTH_SECRET + AUTH_URL. Map legacy / Vercel defaults when unset.
if (!process.env.AUTH_SECRET && process.env.NEXTAUTH_SECRET) {
  process.env.AUTH_SECRET = process.env.NEXTAUTH_SECRET;
}
if (!process.env.AUTH_URL && process.env.NEXTAUTH_URL) {
  process.env.AUTH_URL = process.env.NEXTAUTH_URL;
}
if (!process.env.AUTH_URL && process.env.VERCEL_URL) {
  process.env.AUTH_URL = `https://${process.env.VERCEL_URL}`;
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const { prisma } = await import("@/lib/prisma");
        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user) return null;
        const ok = await compare(password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;

      if (path.startsWith("/admin")) {
        if (path === "/admin/login") return true;
        const role = (auth?.user as { role?: string } | undefined)?.role;
        return role === "ADMIN" || role === "EDITOR";
      }

      // Feed auth is handled by the feed layout (redirects to /feed/login, not /admin/login)
      if (path.startsWith("/feed")) return true;

      return true;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: "ADMIN" | "EDITOR" | "CLIENT" }).role ?? "EDITOR";
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "ADMIN" | "EDITOR" | "CLIENT") ?? "EDITOR";
      }
      return session;
    },
  },
});
