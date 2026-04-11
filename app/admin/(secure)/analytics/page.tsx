import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const [pageViews, adClicks, articles] = await Promise.all([
    prisma.pageView.count(),
    prisma.adClick.count(),
    prisma.article.count(),
  ]);

  const recentViews = await prisma.pageView.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { article: { select: { slug: true, title: true } } },
  });

  return (
    <div className="space-y-8 font-mono">
      <h1 className="text-2xl text-[#00ff41]">Analytics</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded border border-[#00ff41]/20 bg-black/40 p-4">
          <p className="text-xs uppercase text-[#666]">Page views</p>
          <p className="mt-2 text-3xl text-[#ff2bd6]">{pageViews}</p>
        </div>
        <div className="rounded border border-[#00ff41]/20 bg-black/40 p-4">
          <p className="text-xs uppercase text-[#666]">Ad clicks (stub)</p>
          <p className="mt-2 text-3xl text-[#ff2bd6]">{adClicks}</p>
        </div>
        <div className="rounded border border-[#00ff41]/20 bg-black/40 p-4">
          <p className="text-xs uppercase text-[#666]">Articles</p>
          <p className="mt-2 text-3xl text-[#ff2bd6]">{articles}</p>
        </div>
      </div>
      <div>
        <h2 className="mb-3 text-lg text-[#e0e0e0]">Recent views</h2>
        <ul className="space-y-2 text-sm text-[#aaa]">
          {recentViews.map((v) => (
            <li key={v.id} className="flex justify-between gap-4 border-b border-[#222] py-2">
              <span className="truncate">{v.path}</span>
              <span className="shrink-0 text-[#666]">{v.createdAt.toISOString().slice(0, 19)}</span>
            </li>
          ))}
        </ul>
        {recentViews.length === 0 ? <p className="text-sm text-[#666]">No telemetry yet.</p> : null}
      </div>
    </div>
  );
}
