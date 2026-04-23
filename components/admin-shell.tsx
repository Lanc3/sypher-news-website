"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import type { ReactNode } from "react";

const links = [
  { href: "/admin", label: "Dashboard", section: "Core" },
  { href: "/admin/articles", label: "Articles", section: "Content" },
  { href: "/admin/authors", label: "Authors", section: "Content" },
  { href: "/admin/homepage", label: "Homepage", section: "Content" },
  { href: "/admin/ads", label: "Revenue", section: "Revenue" },
  { href: "/admin/analytics", label: "Analytics", section: "Audience" },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data } = useSession();
  const visibleLinks = links.filter((link) => (data?.user?.role === "ADMIN" ? true : link.href !== "/admin/ads"));

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#070a12] text-[#e0e0e0]">
      <div className="border-b border-[#00e8ff]/25 bg-black/40">
        <div className="mx-auto max-w-6xl px-4 py-4 font-mono sm:px-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#666]">Sypher operator console</p>
              <p className="mt-1 text-lg text-[#00e8ff]">Dashboard, content, audience, revenue, and newsroom controls</p>
            </div>
            <span className="flex-1" />
            {data?.user?.email ? <span className="text-xs text-[#666]">{data.user.email}</span> : null}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="rounded border border-[#bc13fe]/40 px-3 py-1 text-xs text-[#bc13fe] hover:bg-[#bc13fe]/10"
            >
              Sign out
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            {visibleLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-md px-3 py-2 ${pathname === l.href ? "bg-[#00e8ff]/10 text-[#00e8ff]" : "text-[#888] hover:text-[#bc13fe]"}`}
              >
                <span className="block text-[10px] uppercase tracking-[0.2em] text-[#666]">{l.section}</span>
                <span>{l.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl p-6">{children}</div>
    </div>
  );
}
