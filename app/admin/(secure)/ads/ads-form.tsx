"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdPlacement } from "@prisma/client";
import { updateAdPlacementAction, logAdClickAction } from "@/app/admin/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdsForm({ placements }: { placements: AdPlacement[] }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);

  async function save(placement: AdPlacement, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const enabled = fd.get("enabled") === "on";
    const adUnitPath = String(fd.get("adUnitPath") || "");
    const providerKey = String(fd.get("providerKey") || "");
    const res = await updateAdPlacementAction({
      slot: placement.slot,
      enabled,
      adUnitPath: adUnitPath || null,
      providerKey: providerKey || null,
    });
    if (!res.ok) setMsg("Update failed");
    else {
      setMsg("Saved");
      router.refresh();
    }
  }

  async function testClick(placementId: string) {
    await logAdClickAction(placementId);
    setMsg("Logged test click");
    router.refresh();
  }

  return (
    <div className="space-y-8 font-mono">
      {msg ? <p className="text-sm text-[#888]">{msg}</p> : null}
      {placements.map((p) => (
        <div key={p.id} className="space-y-3 rounded border border-[#00e8ff]/20 bg-black/40 p-4">
          <h2 className="text-lg text-[#bc13fe]">{p.slot}</h2>
          <form className="space-y-3" onSubmit={(e) => save(p, e)}>
            <label className="flex items-center gap-2 text-sm text-[#aaa]">
              <input type="checkbox" name="enabled" defaultChecked={p.enabled} className="accent-[#00e8ff]" />
              Enabled
            </label>
            <div className="space-y-1">
              <Label htmlFor={`path-${p.id}`}>Ad unit path / slot id</Label>
              <Input id={`path-${p.id}`} name="adUnitPath" defaultValue={p.adUnitPath ?? ""} />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`pk-${p.id}`}>Provider key</Label>
              <Input id={`pk-${p.id}`} name="providerKey" defaultValue={p.providerKey ?? ""} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit">Save</Button>
              <Button
                type="button"
                className="border-[#666]/40 text-[#aaa]"
                onClick={() => testClick(p.id)}
              >
                Log test click
              </Button>
            </div>
          </form>
        </div>
      ))}
    </div>
  );
}
