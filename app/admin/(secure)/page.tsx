import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [articleCount, draftCount, subscriberCount, activeSlots, placements, recentArticles, recentEvents] =
    await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: "DRAFT" } }),
      prisma.newsletterSubscriber.count({ where: { status: "ACTIVE" } }),
      prisma.adPlacement.count({ where: { enabled: true } }),
      prisma.adPlacement.findMany({ orderBy: { slot: "asc" } }),
      prisma.article.findMany({
        orderBy: { updatedAt: "desc" },
        take: 8,
        include: { topic: { include: { category: true } } },
      }),
      prisma.analyticsEvent.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

  const misconfiguredSlots = placements.filter(
    (p) => p.enabled && (!p.adClient || !p.slotId),
  ).length;

  const attentionItems = [
    draftCount > 0
      ? { label: `${draftCount} draft ${draftCount === 1 ? "story" : "stories"} awaiting review`, href: "/admin/articles?status=DRAFT", urgent: draftCount > 5 }
      : null,
    misconfiguredSlots > 0
      ? { label: `${misconfiguredSlots} AdSense ${misconfiguredSlots === 1 ? "slot" : "slots"} missing IDs`, href: "/admin/ads", urgent: true }
      : null,
    subscriberCount === 0
      ? { label: "Newsletter audience is empty", href: "/admin/analytics", urgent: false }
      : null,
  ].filter(Boolean) as { label: string; href: string; urgent: boolean }[];

  return (
    <div className="space-y-6 font-mono">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#444]">Overview</p>
        <h1 className="mt-1 text-xl font-semibold text-[#e0e0e0]">Dashboard</h1>
      </div>

      {/* Stat tiles row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Articles", value: articleCount, sub: `${draftCount} drafts`, href: "/admin/articles" },
          { label: "Subscribers", value: subscriberCount, sub: "active", href: "/admin/analytics" },
          { label: "Ad slots", value: activeSlots, sub: misconfiguredSlots > 0 ? `${misconfiguredSlots} issues` : "all healthy", href: "/admin/ads" },
          { label: "Events", value: recentEvents.length, sub: "recent telemetry", href: "/admin/analytics" },
        ].map((tile) => (
          <Link
            key={tile.label}
            href={tile.href}
            className="group rounded-lg border border-[#00e8ff]/10 bg-black/50 p-4 transition hover:border-[#00e8ff]/30"
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#444] group-hover:text-[#555]">
              {tile.label}
            </p>
            <p className="mt-1.5 font-mono text-2xl font-bold text-[#bc13fe]">{tile.value}</p>
            <p className="mt-0.5 text-[11px] text-[#555]">{tile.sub}</p>
          </Link>
        ))}
      </div>

      {/* Main content: activity left, queue right */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Activity feed */}
        <div className="space-y-4">
          <section className="rounded-lg border border-[#00e8ff]/10 bg-black/40">
            <div className="flex items-center justify-between border-b border-[#00e8ff]/10 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-[#bc13fe]">Recent publishing</h2>
                <p className="mt-0.5 text-xs text-[#555]">Last 8 edited stories</p>
              </div>
              <Link href="/admin/articles" className="text-xs text-[#00e8ff] hover:underline">
                All articles →
              </Link>
            </div>
            <ul className="divide-y divide-[#00e8ff]/5">
              {recentArticles.length === 0 ? (
                <li className="px-5 py-8 text-center text-sm text-[#555]">No articles yet.</li>
              ) : (
                recentArticles.map((article) => (
                  <li key={article.id} className="group flex items-center justify-between gap-4 px-5 py-3 transition hover:bg-white/2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-[#d0d0d0]">{article.title}</p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <StatusBadge status={article.status} />
                        <span className="text-[11px] text-[#444]">
                          {article.topic.category.name}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/admin/articles/${article.id}`}
                      className="shrink-0 text-xs text-[#555] opacity-0 transition hover:text-[#00e8ff] group-hover:opacity-100"
                    >
                      Edit
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="rounded-lg border border-[#00e8ff]/10 bg-black/40">
            <div className="flex items-center justify-between border-b border-[#00e8ff]/10 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-[#bc13fe]">Event stream</h2>
                <p className="mt-0.5 text-xs text-[#555]">Latest 10 analytics events</p>
              </div>
              <Link href="/admin/analytics" className="text-xs text-[#00e8ff] hover:underline">
                Full analytics →
              </Link>
            </div>
            <ul className="divide-y divide-[#00e8ff]/5">
              {recentEvents.length === 0 ? (
                <li className="px-5 py-8 text-center text-sm text-[#555]">No events yet.</li>
              ) : (
                recentEvents.map((event) => (
                  <li key={event.id} className="flex items-center justify-between gap-4 px-5 py-2.5">
                    <span className="truncate text-xs text-[#888]">
                      {event.type}
                      {event.path ? <span className="text-[#555]"> · {event.path}</span> : null}
                    </span>
                    <span className="shrink-0 text-[11px] tabular-nums text-[#3a3a4a]">
                      {event.createdAt.toISOString().slice(11, 19)}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>

        {/* Right rail: needs attention */}
        <div>
          <section className="rounded-lg border border-[#00e8ff]/10 bg-black/40">
            <div className="border-b border-[#00e8ff]/10 px-5 py-4">
              <h2 className="text-sm font-semibold text-[#bc13fe]">Needs attention</h2>
              <p className="mt-0.5 text-xs text-[#555]">Action items for the operator</p>
            </div>
            {attentionItems.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-[#555]">All clear.</p>
                <p className="mt-1 text-xs text-[#3a3a4a]">No issues detected.</p>
              </div>
            ) : (
              <ul className="divide-y divide-[#00e8ff]/5">
                {attentionItems.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="flex items-start gap-3 px-5 py-3.5 transition hover:bg-white/2"
                    >
                      <span
                        className={`mt-1 size-2 shrink-0 rounded-full ${item.urgent ? "bg-red-500/70" : "bg-yellow-500/60"}`}
                        aria-hidden
                      />
                      <span className="text-xs text-[#aaa]">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="mt-4 rounded-lg border border-[#00e8ff]/10 bg-black/40 px-5 py-5">
            <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-[#444]">Quick links</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/admin/articles/new", label: "New article" },
                { href: "/admin/homepage", label: "Homepage" },
                { href: "/admin/categories", label: "Categories" },
                { href: "/admin/authors", label: "Authors" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded border border-[#00e8ff]/10 px-3 py-2 text-center text-xs text-[#666] transition hover:border-[#00e8ff]/30 hover:text-[#00e8ff]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PUBLISHED: "bg-emerald-500/15 text-emerald-400/80",
    DRAFT: "bg-yellow-500/15 text-yellow-400/80",
    SCHEDULED: "bg-blue-500/15 text-blue-400/80",
    ARCHIVED: "bg-zinc-500/15 text-zinc-400/80",
  };
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${styles[status] ?? "bg-white/5 text-[#666]"}`}>
      {status.toLowerCase()}
    </span>
  );
}
