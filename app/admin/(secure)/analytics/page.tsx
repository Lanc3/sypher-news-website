import { prisma } from "@/lib/prisma";
import { AdminStatCard } from "@/components/admin-stat-card";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [todayViews, weekViews, monthViews, newsletterEvents, shareEvents, adClicks, topViewed, recentEvents] = await Promise.all([
    prisma.pageView.count({ where: { createdAt: { gte: dayAgo } } }),
    prisma.pageView.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.pageView.count({ where: { createdAt: { gte: monthAgo } } }),
    prisma.analyticsEvent.count({ where: { type: "NEWSLETTER_SUBMIT", createdAt: { gte: monthAgo } } }),
    prisma.analyticsEvent.count({ where: { type: "SHARE", createdAt: { gte: monthAgo } } }),
    prisma.adClick.count({ where: { createdAt: { gte: monthAgo } } }),
    prisma.pageView.groupBy({
      by: ["articleId"],
      where: { articleId: { not: null }, createdAt: { gte: monthAgo } },
      _count: { articleId: true },
      orderBy: { _count: { articleId: "desc" } },
      take: 10,
    }),
    prisma.analyticsEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
  ]);

  const topArticleIds = topViewed.map((row) => row.articleId).filter((id): id is number => id != null);
  const topArticles = topArticleIds.length
    ? await prisma.article.findMany({
        where: { id: { in: topArticleIds } },
        include: { topic: { include: { category: true } } },
      })
    : [];
  const topArticleMap = new Map(topArticles.map((article) => [article.id, article]));

  return (
    <div className="space-y-8 font-mono">
      <h1 className="text-2xl text-[#00e8ff]">Analytics</h1>
      <p className="max-w-3xl text-sm text-[#888]">
        Audience and revenue analytics are grouped into time windows so the newsroom can monitor readership, sharing, subscriptions, and AdSense interactions.
      </p>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Page views today" value={todayViews} hint={`${weekViews} in the last 7 days`} />
        <AdminStatCard label="30-day page views" value={monthViews} hint="Rolling traffic window" />
        <AdminStatCard label="Newsletter submits" value={newsletterEvents} hint="Last 30 days" />
        <AdminStatCard label="30-day ad clicks" value={adClicks} hint={`${shareEvents} share actions in the same window`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-[#00e8ff]/20 bg-black/40 p-4">
          <h2 className="mb-3 text-lg text-[#e0e0e0]">Top stories (30 days)</h2>
          <ul className="space-y-2 text-sm text-[#aaa]">
            {topViewed.map((row) => {
              const article = row.articleId != null ? topArticleMap.get(row.articleId) : null;
              return (
                <li key={String(row.articleId)} className="flex items-center justify-between gap-4 border-b border-[#222] py-2">
                  <span className="truncate">
                    {article ? `${article.title} · ${article.topic.category.name}` : "Unknown article"}
                  </span>
                  <span className="shrink-0 text-[#bc13fe]">{row._count.articleId}</span>
                </li>
              );
            })}
          </ul>
          {topViewed.length === 0 ? <p className="text-sm text-[#666]">No article traffic yet.</p> : null}
        </section>

        <section className="rounded-lg border border-[#00e8ff]/20 bg-black/40 p-4">
          <h2 className="mb-3 text-lg text-[#e0e0e0]">Recent event stream</h2>
          <ul className="space-y-2 text-sm text-[#aaa]">
            {recentEvents.map((event) => (
              <li key={event.id} className="flex items-center justify-between gap-4 border-b border-[#222] py-2">
                <span className="truncate">
                  {event.type} {event.path ? `· ${event.path}` : ""}
                </span>
                <span className="shrink-0 text-[#666]">{event.createdAt.toISOString().slice(0, 19)}</span>
              </li>
            ))}
          </ul>
          {recentEvents.length === 0 ? <p className="text-sm text-[#666]">No telemetry yet.</p> : null}
        </section>
      </div>
    </div>
  );
}
