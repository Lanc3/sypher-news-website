import { prisma } from "@/lib/prisma";
import { AdsForm } from "./ads-form";

export const dynamic = "force-dynamic";

export default async function AdminAdsPage() {
  const placements = await prisma.adPlacement.findMany({ orderBy: { slot: "asc" } });
  const misconfigured = placements.filter((placement) => placement.enabled && (!placement.adClient || !placement.slotId)).length;

  return (
    <div className="space-y-6 font-mono">
      <div>
        <h1 className="text-2xl text-[#00e8ff]">Revenue and AdSense</h1>
        <p className="mt-2 max-w-3xl text-sm text-[#888]">
          Configure Google AdSense slot IDs, map placements to public surfaces, and catch broken monetization before it reaches production.
        </p>
        <p className="mt-3 text-xs text-[#666]">
          {placements.filter((placement) => placement.enabled).length} active slots · {misconfigured} misconfigured
        </p>
      </div>
      <AdsForm placements={placements} />
    </div>
  );
}
