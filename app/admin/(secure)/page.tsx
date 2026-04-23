import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminStatCard } from "@/components/admin-stat-card";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [articleCount, draftCount, subscriberCount, activeSlots, placements, recentArticles, recentEvents] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.newsletterSubscriber.count({ where: { status: "ACTIVE" } }),
    prisma.adPlacement.count({ where: { enabled: true } }),
    prisma.adPlacement.findMany({ orderBy: { slot: "asc" } }),
    prisma.article.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { topic: { include: { category: true } } },
    }),
    prisma.analyticsEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const misconfiguredSlots = placements.filter((placement) => placement.enabled && (!placement.adClient || !placement.slotId)).length;

  return (
    <div className="space-y-8 font-mono">
      <div>
        <h1 className="text-2xl text-[#00e8ff]">Dashboard</h1>
        <p className="mt-2 max-w-3xl text-sm text-[#888]">
          Manage publishing, audience, monetization, and system health from one operator view.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Articles" value={articleCount} hint={`${draftCount} drafts waiting for review`} />
        <AdminStatCard label="Newsletter" value={subscriberCount} hint="Active subscribers in the local audience store" />
        <AdminStatCard label="AdSense slots" value={activeSlots} hint={`${misconfiguredSlots} need attention`} />
        <AdminStatCard label="Recent telemetry" value={recentEvents.length} hint="Latest audience or revenue events" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-lg border border-[#00e8ff]/20 bg-black/40 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg text-[#bc13fe]">Publishing</h2>
              <p className="mt-1 text-sm text-[#777]">Recently edited stories and direct editorial actions.</p>
            </div>
            <Link href="/admin/articles" className="text-xs text-[#00e8ff] hover:underline">
              Open articles
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {recentArticles.map((article) => (
              <li key={article.id} className="rounded border border-[#00e8ff]/10 p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-[#e0e0e0]">{article.title}</p>
                    <p className="mt-1 text-xs text-[#666]">
                      {article.status} · /news/{article.topic.category.slug}/{article.slug}
                    </p>
                  </div>
                  <Link href={`/admin/articles/${article.id}`} className="text-xs text-[#00e8ff] hover:underline">
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-[#00e8ff]/20 bg-black/40 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg text-[#bc13fe]">Needs attention</h2>
              <p className="mt-1 text-sm text-[#777]">Misconfigured revenue and incomplete editorial work.</p>
            </div>
            <Link href="/admin/ads" className="text-xs text-[#00e8ff] hover:underline">
              Open revenue
            </Link>
          </div>
          <ul className="mt-4 space-y-3 text-sm text-[#b0b0b0]">
            <li>{draftCount > 0 ? `${draftCount} draft stories need publishing review.` : "No draft backlog right now."}</li>
            <li>{misconfiguredSlots > 0 ? `${misconfiguredSlots} active AdSense slots are missing required IDs.` : "All enabled ad slots have core IDs."}</li>
            <li>{subscriberCount === 0 ? "Newsletter audience is empty." : "Newsletter audience is collecting successfully."}</li>
          </ul>
        </section>
      </div>

      <section className="rounded-lg border border-[#00e8ff]/20 bg-black/40 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg text-[#bc13fe]">Recent activity</h2>
            <p className="mt-1 text-sm text-[#777]">Latest audience and revenue events reaching the platform.</p>
          </div>
          <Link href="/admin/analytics" className="text-xs text-[#00e8ff] hover:underline">
            Open analytics
          </Link>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-[#aaa]">
          {recentEvents.map((event) => (
            <li key={event.id} className="flex items-center justify-between gap-4 border-b border-[#222] py-2">
              <span className="truncate">
                {event.type} {event.path ? `· ${event.path}` : ""}
              </span>
              <span className="shrink-0 text-[#666]">{event.createdAt.toISOString().slice(0, 19)}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link href="/admin/articles" className="rounded-lg border border-[#00e8ff]/25 bg-black/50 p-4 hover:border-[#00e8ff]/60">
          <h2 className="text-[#bc13fe]">Articles</h2>
          <p className="mt-2 text-xs text-[#777]">Workflow, metadata, previews, and revisions</p>
        </Link>
        <Link href="/admin/authors" className="rounded-lg border border-[#00e8ff]/25 bg-black/50 p-4 hover:border-[#00e8ff]/60">
          <h2 className="text-[#bc13fe]">Authors</h2>
          <p className="mt-2 text-xs text-[#777]">Bylines, bios, and archive pages</p>
        </Link>
        <Link href="/admin/homepage" className="rounded-lg border border-[#00e8ff]/25 bg-black/50 p-4 hover:border-[#00e8ff]/60">
          <h2 className="text-[#bc13fe]">Homepage</h2>
          <p className="mt-2 text-xs text-[#777]">Choose categories for homepage channel highlights</p>
        </Link>
        <Link href="/admin/ads" className="rounded-lg border border-[#00e8ff]/25 bg-black/50 p-4 hover:border-[#00e8ff]/60">
          <h2 className="text-[#bc13fe]">Revenue</h2>
          <p className="mt-2 text-xs text-[#777]">AdSense slot health and monetization controls</p>
        </Link>
        <Link href="/admin/analytics" className="rounded-lg border border-[#00e8ff]/25 bg-black/50 p-4 hover:border-[#00e8ff]/60">
          <h2 className="text-[#bc13fe]">Audience</h2>
          <p className="mt-2 text-xs text-[#777]">Traffic, search, sharing, and conversion data</p>
        </Link>
      </div>
    </div>
  );
}
