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
  const [error, setError] = useState<string | null>(null);

  async function save(placement: AdPlacement, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const enabled = fd.get("enabled") === "on";
    const adUnitPath = String(fd.get("adUnitPath") || "");
    const providerKey = String(fd.get("providerKey") || "");
    const adClient = String(fd.get("adClient") || "");
    const slotId = String(fd.get("slotId") || "");
    const format = String(fd.get("format") || "");
    const layoutKey = String(fd.get("layoutKey") || "");
    const targetPath = String(fd.get("targetPath") || "");
    const notes = String(fd.get("notes") || "");
    const res = await updateAdPlacementAction({
      slot: placement.slot,
      enabled,
      adUnitPath: adUnitPath || null,
      providerKey: providerKey || null,
      adClient: adClient || null,
      slotId: slotId || null,
      format: format || null,
      layoutKey: layoutKey || null,
      targetPath: targetPath || null,
      notes: notes || null,
    });
    if (!res.ok) setError(res.error || "Update failed");
    else {
      setMsg(`${placement.slot} saved`);
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
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {placements.map((p) => (
        <div key={p.id} className="space-y-3 rounded border border-[#00e8ff]/20 bg-black/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg text-[#bc13fe]">{p.slot}</h2>
              <p className="text-xs text-[#666]">
                {p.enabled ? "Enabled" : "Disabled"} · {p.adClient && p.slotId ? "Ready for AdSense" : "Needs setup"}
              </p>
            </div>
            <div className="rounded border border-[#00e8ff]/15 px-3 py-2 text-xs text-[#888]">
              Preview: {p.targetPath || `/${p.slot}`}
            </div>
          </div>
          <form className="space-y-3" onSubmit={(e) => save(p, e)}>
            <label className="flex items-center gap-2 text-sm text-[#aaa]">
              <input type="checkbox" name="enabled" defaultChecked={p.enabled} className="accent-[#00e8ff]" />
              Enabled
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor={`client-${p.id}`}>AdSense client</Label>
                <Input id={`client-${p.id}`} name="adClient" defaultValue={p.adClient ?? ""} placeholder="ca-pub-xxxxxxxxxxxx" />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`slot-${p.id}`}>AdSense slot ID</Label>
                <Input id={`slot-${p.id}`} name="slotId" defaultValue={p.slotId ?? ""} placeholder="1234567890" />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`format-${p.id}`}>Format</Label>
                <Input id={`format-${p.id}`} name="format" defaultValue={p.format ?? "auto"} placeholder="auto" />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`layout-${p.id}`}>Layout key</Label>
                <Input id={`layout-${p.id}`} name="layoutKey" defaultValue={p.layoutKey ?? ""} placeholder="-fb+5w+4e-db+86" />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`path-${p.id}`}>Target path</Label>
                <Input id={`path-${p.id}`} name="targetPath" defaultValue={p.targetPath ?? ""} placeholder="/news/[category]/[slug]" />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`unit-${p.id}`}>Legacy ad unit path</Label>
                <Input id={`unit-${p.id}`} name="adUnitPath" defaultValue={p.adUnitPath ?? ""} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor={`pk-${p.id}`}>Provider key / label</Label>
                <Input id={`pk-${p.id}`} name="providerKey" defaultValue={p.providerKey ?? "google-adsense"} />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor={`notes-${p.id}`}>Operator notes</Label>
              <textarea
                id={`notes-${p.id}`}
                name="notes"
                defaultValue={p.notes ?? ""}
                className="min-h-[90px] w-full rounded border border-[#00e8ff]/30 bg-[#080808] p-2 text-sm text-[#e0e0e0]"
                placeholder="Use this for placement notes, approval status, or ad policy reminders."
              />
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
