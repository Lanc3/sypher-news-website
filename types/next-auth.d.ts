import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: "ADMIN" | "EDITOR" | "CLIENT";
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "ADMIN" | "EDITOR" | "CLIENT";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "ADMIN" | "EDITOR" | "CLIENT";
  }
}
