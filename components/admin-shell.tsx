"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import type { ReactNode } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Tag,
  Users,
  Home,
  DollarSign,
  BarChart2,
  ChevronRight,
  UserCog,
} from "lucide-react";

const navGroups = [
  {
    label: "Core",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/articles", label: "Articles", icon: FileText, exact: false },
      { href: "/admin/categories", label: "Categories", icon: Tag, exact: false },
      { href: "/admin/authors", label: "Authors", icon: Users, exact: false },
      { href: "/admin/homepage", label: "Homepage", icon: Home, exact: false },
    ],
  },
  {
    label: "Growth",
    items: [
      { href: "/admin/ads", label: "Revenue", icon: DollarSign, exact: false, adminOnly: true as const },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart2, exact: false },
    ],
  },
  {
    label: "Security",
    items: [{ href: "/admin/account-control", label: "Account Control", icon: UserCog, exact: false, adminOnly: true as const }],
  },
] as const;

function getPageLabel(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/articles/new")) return "New article";
  if (pathname.startsWith("/admin/articles/")) return "Edit article";
  if (pathname.startsWith("/admin/articles")) return "Articles";
  if (pathname.startsWith("/admin/categories")) return "Categories";
  if (pathname.startsWith("/admin/authors")) return "Authors";
  if (pathname.startsWith("/admin/homepage")) return "Homepage";
  if (pathname.startsWith("/admin/ads")) return "Revenue";
  if (pathname.startsWith("/admin/analytics")) return "Analytics";
  if (pathname.startsWith("/admin/account-control")) return "Account Control";
  return "Admin";
}

function NavContent({
  pathname,
  role,
  onNavigate,
}: {
  pathname: string;
  role?: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-0.5 py-3 px-2">
      {navGroups.map((group) => {
        const items = group.items.filter((item) => {
          if ("adminOnly" in item && item.adminOnly) return role === "ADMIN";
          return true;
        });
        if (items.length === 0) return null;
        return (
          <div key={group.label} className="mb-4">
            <p className="mb-1.5 px-3 text-[10px] uppercase tracking-[0.25em] text-[#3a3a4a]">
              {group.label}
            </p>
            {items.map((item) => {
              const Icon = item.icon;
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={`group flex items-center gap-3 rounded-md px-3 py-2.5 font-mono text-sm transition-colors ${
                    active
                      ? "bg-[#00e8ff]/10 text-[#00e8ff]"
                      : "text-[#666] hover:bg-white/5 hover:text-[#c8c8c8]"
                  }`}
                >
                  <Icon
                    className={`size-4 shrink-0 transition-colors ${active ? "text-[#00e8ff]" : "text-[#444] group-hover:text-[#888]"}`}
                    aria-hidden
                  />
                  <span>{item.label}</span>
                  {active && <ChevronRight className="ml-auto size-3 text-[#00e8ff]/50" aria-hidden />}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const pageLabel = getPageLabel(pathname);
  const role = data?.user?.role as string | undefined;

  return (
    <div className="flex min-h-screen bg-[#070a12] text-[#e0e0e0]">
      {/* Desktop sidebar */}
      <aside className="hidden w-52 shrink-0 flex-col border-r border-[#00e8ff]/10 bg-black/60 lg:flex">
        <div className="border-b border-[#00e8ff]/10 px-4 py-5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#3a3a4a]">Sypher</p>
          <p className="mt-1 font-mono text-sm font-semibold text-[#00e8ff]">Operator Console</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavContent pathname={pathname} role={role} />
        </div>
        <div className="border-t border-[#00e8ff]/10 px-4 py-4">
          {data?.user?.email ? (
            <p className="mb-2 truncate text-[11px] text-[#444]">{data.user.email}</p>
          ) : null}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full rounded border border-[#bc13fe]/30 px-3 py-1.5 text-left text-xs text-[#bc13fe]/70 transition hover:border-[#bc13fe]/60 hover:bg-[#bc13fe]/10 hover:text-[#bc13fe]"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-10 flex w-56 flex-col border-r border-[#00e8ff]/10 bg-[#070a12]">
            <div className="flex items-center justify-between border-b border-[#00e8ff]/10 px-4 py-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#3a3a4a]">Sypher</p>
                <p className="mt-1 font-mono text-sm font-semibold text-[#00e8ff]">Operator Console</p>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded p-1 text-[#555] hover:text-[#e0e0e0]"
                aria-label="Close navigation"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <NavContent pathname={pathname} role={role} onNavigate={() => setSidebarOpen(false)} />
            </div>
            <div className="border-t border-[#00e8ff]/10 px-4 py-4">
              {data?.user?.email ? (
                <p className="mb-2 truncate text-[11px] text-[#444]">{data.user.email}</p>
              ) : null}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="w-full rounded border border-[#bc13fe]/30 px-3 py-1.5 text-left text-xs text-[#bc13fe]/70 transition hover:border-[#bc13fe]/60 hover:bg-[#bc13fe]/10 hover:text-[#bc13fe]"
              >
                Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-[#00e8ff]/10 bg-[#070a12]/95 px-4 py-3 backdrop-blur-sm sm:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded p-1.5 text-[#555] transition hover:text-[#e0e0e0] lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-5" aria-hidden />
          </button>
          <nav className="flex items-center gap-1.5 font-mono text-sm" aria-label="Breadcrumb">
            <span className="text-[#333]">Admin</span>
            <ChevronRight className="size-3.5 text-[#2a2a3a]" aria-hidden />
            <span className="text-[#c8c8c8]">{pageLabel}</span>
          </nav>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
