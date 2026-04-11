import { prisma } from "@/lib/prisma";
import { AdsForm } from "./ads-form";

export const dynamic = "force-dynamic";

export default async function AdminAdsPage() {
  const placements = await prisma.adPlacement.findMany({ orderBy: { slot: "asc" } });

  return (
    <div className="space-y-6 font-mono">
      <h1 className="text-2xl text-[#00ff41]">Ad placements</h1>
      <p className="text-sm text-[#888]">Toggle slots wired through AdProvider on the public site.</p>
      <AdsForm placements={placements} />
    </div>
  );
}
