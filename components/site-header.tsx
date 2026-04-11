import Link from "next/link";
import { Terminal } from "lucide-react";
import { HeaderAdSlot } from "@/components/ad-provider";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#00ff41]/25 bg-[#050505]/95 backdrop-blur">
      <HeaderAdSlot />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="group flex items-center gap-2 font-mono text-lg tracking-tight text-[#00ff41]">
          <Terminal className="h-5 w-5 motion-reduce:transition-none transition group-hover:drop-shadow-[0_0_8px_#00ff41]" />
          <span className="group-hover:drop-shadow-[0_0_10px_rgba(0,255,65,0.45)]">SYPHER_NEWS</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-mono text-[#e0e0e0]/80">
          <Link href="/" className="hover:text-[#00ff41]">
            /home
          </Link>
          <Link href="/news" className="hover:text-[#00ff41]">
            /news
          </Link>
          <Link href="/admin" className="text-[#ff2bd6]/80 hover:text-[#ff2bd6]">
            /admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
