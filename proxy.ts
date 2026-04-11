/**
 * Next.js 16+: `middleware.ts` is deprecated; use `proxy.ts` with named export `proxy`.
 * NextAuth wires `auth` as the proxy handler when `callbacks.authorized` is defined.
 */
export { auth as proxy } from "@/auth";

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
