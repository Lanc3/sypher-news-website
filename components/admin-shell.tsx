"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import type { ReactNode } from "react";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/ads", label: "Ads" },
  { href: "/admin/analytics", label: "Analytics" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data } = useSession();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#070a12] text-[#e0e0e0]">
      <div className="flex flex-wrap items-center gap-3 border-b border-[#00e8ff]/25 px-4 py-3 font-mono text-sm">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={pathname === l.href ? "text-[#00e8ff]" : "text-[#888] hover:text-[#bc13fe]"}
          >
            {l.label}
          </Link>
        ))}
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
      <div className="mx-auto max-w-5xl p-6">{children}</div>
    </div>
  );
}
