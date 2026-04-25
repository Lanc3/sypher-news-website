import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [todayViews, weekViews, monthViews, newsletterEvents, shareEvents, adClicks, topViewed, recentEvents] =
    await Promise.all([
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
  const topArticleMap = new Map(topArticles.map((a) => [a.id, a]));

  return (
    <div className="space-y-6 font-mono">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#444]">Growth</p>
        <h1 className="mt-1 text-xl font-semibold text-[#e0e0e0]">Analytics</h1>
        <p className="mt-1 text-sm text-[#666]">
          Audience and revenue grouped into time windows.
        </p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Views today", value: todayViews, sub: `${weekViews} this week` },
          { label: "30-day views", value: monthViews, sub: "rolling window" },
          { label: "Newsletter submits", value: newsletterEvents, sub: "last 30 days" },
          { label: "Ad clicks", value: adClicks, sub: `${shareEvents} shares` },
        ].map((tile) => (
          <div
            key={tile.label}
            className="rounded-lg border border-[#00e8ff]/10 bg-black/50 p-4"
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#444]">{tile.label}</p>
            <p className="mt-1.5 font-mono text-2xl font-bold text-[#bc13fe]">{tile.value}</p>
            <p className="mt-0.5 text-[11px] text-[#555]">{tile.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-[#00e8ff]/10 bg-black/40">
          <div className="border-b border-[#00e8ff]/10 px-5 py-4">
            <h2 className="text-sm font-semibold text-[#bc13fe]">Top stories</h2>
            <p className="mt-0.5 text-xs text-[#555]">Last 30 days by page views</p>
          </div>
          <ul className="divide-y divide-[#00e8ff]/5">
            {topViewed.length === 0 ? (
              <li className="px-5 py-8 text-center text-sm text-[#555]">No article traffic yet.</li>
            ) : (
              topViewed.map((row) => {
                const article = row.articleId != null ? topArticleMap.get(row.articleId) : null;
                return (
                  <li key={String(row.articleId)} className="flex items-center justify-between gap-4 px-5 py-3">
                    <span className="truncate text-xs text-[#888]">
                      {article ? article.title : "Unknown article"}
                      {article ? <span className="text-[#444]"> · {article.topic.category.name}</span> : null}
                    </span>
                    <span className="shrink-0 font-mono text-sm font-semibold text-[#bc13fe]">
                      {row._count.articleId}
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        </section>

        <section className="rounded-lg border border-[#00e8ff]/10 bg-black/40">
          <div className="border-b border-[#00e8ff]/10 px-5 py-4">
            <h2 className="text-sm font-semibold text-[#bc13fe]">Event stream</h2>
            <p className="mt-0.5 text-xs text-[#555]">Latest 25 events</p>
          </div>
          <ul className="divide-y divide-[#00e8ff]/5">
            {recentEvents.length === 0 ? (
              <li className="px-5 py-8 text-center text-sm text-[#555]">No telemetry yet.</li>
            ) : (
              recentEvents.map((event) => (
                <li key={event.id} className="flex items-center justify-between gap-4 px-5 py-2.5">
                  <span className="truncate text-xs text-[#888]">
                    {event.type}
                    {event.path ? <span className="text-[#555]"> · {event.path}</span> : null}
                  </span>
                  <span className="shrink-0 text-[11px] tabular-nums text-[#3a3a4a]">
                    {event.createdAt.toISOString().slice(0, 19).replace("T", " ")}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
