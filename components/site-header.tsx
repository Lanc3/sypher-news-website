"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Terminal, X } from "lucide-react";
import { HeaderAdSlot } from "@/components/ad-provider";
import { SiteContainer } from "@/components/site-container";

const navLinks = [
  { href: "/", label: "/home" },
  { href: "/news", label: "/news" },
  { href: "/admin", label: "/admin" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#00e8ff]/25 bg-[#070a12]/92 backdrop-blur-md supports-[backdrop-filter]:bg-[#070a12]/78">
      <HeaderAdSlot />
      <SiteContainer className="flex items-center justify-between gap-3 py-3 sm:gap-4">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="group flex min-h-11 min-w-0 shrink items-center gap-2 font-mono text-base font-semibold tracking-tight text-[#00e8ff] sm:text-lg"
        >
          <Terminal
            className="size-5 shrink-0 motion-reduce:transition-none transition group-hover:drop-shadow-[0_0_8px_#00e8ff]"
            aria-hidden
          />
          <span className="truncate group-hover:drop-shadow-[0_0_10px_rgba(0,232,255,0.45)]">SYPHER_NEWS</span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main navigation">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2.5 text-sm transition-colors ${
                item.href === "/admin"
                  ? "text-[#bc13fe]/90 hover:bg-[#bc13fe]/10 hover:text-[#bc13fe]"
                  : "text-[#c8c8c8] hover:bg-[#00e8ff]/10 hover:text-[#00e8ff]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[#00e8ff]/35 text-[#00e8ff] transition hover:border-[#00e8ff]/60 hover:bg-[#00e8ff]/5 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-drawer"
          onClick={() => setOpen(true)}
        >
          <Menu className="size-5 shrink-0" aria-hidden />
          <span className="sr-only">Open menu</span>
        </button>
      </SiteContainer>

      {open ? (
        <div className="fixed inset-0 z-[100] md:hidden" id="mobile-drawer" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-dvh w-[min(100%,20rem)] flex-col border-l border-[#00e8ff]/35 bg-[#080808] shadow-[-12px_0_48px_rgba(0,0,0,0.55)]">
            <div className="flex items-center justify-between border-b border-[#00e8ff]/20 px-4 py-3">
              <span className="font-mono text-sm font-medium tracking-wide text-[#00e8ff]">NAV</span>
              <button
                type="button"
                className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-[#e0e0e0] transition hover:bg-white/5"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4" aria-label="Mobile navigation">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-4 py-3.5 text-base transition-colors ${
                    item.href === "/admin"
                      ? "text-[#bc13fe] hover:bg-[#bc13fe]/10"
                      : "text-[#e8e8e8] hover:bg-[#00e8ff]/10 hover:text-[#00e8ff]"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
