"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { GeometryCollection, Topology } from "topojson-specification";
import { CODE_TO_COUNTRY, type CountryEntry } from "@/lib/countries";

type GlobeFeature = {
  type: string;
  id?: string | number;
  properties?: { name?: string };
  geometry: unknown;
};

type Props = {
  countryArticleCounts: Record<string, number>;
};

export function HomeHeroGlobe({ countryArticleCounts }: Props) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [hovered, setHovered] = useState<{ name: string; count: number } | null>(null);

  const countsByCode = useMemo(() => countryArticleCounts, [countryArticleCounts]);

  useEffect(() => {
    let resizeObserver: ResizeObserver | null = null;
    let mounted = true;

    const init = async () => {
      if (!containerRef.current) return;
      const container = containerRef.current;

      const [GlobeModule, topoModule, worldData, threeModule] = await Promise.all([
        import("globe.gl"),
        import("topojson-client"),
        import("world-atlas/countries-110m.json"),
        import("three"),
      ]);

      if (!mounted) return;

      const Globe = GlobeModule.default;
      const world = worldData.default as unknown as Topology<{ countries: GeometryCollection }>;
      const featureResult = topoModule.feature(world, world.objects.countries);
      const rawFeatures = (featureResult as { features?: unknown }).features;
      const countryFeatures = Array.isArray(rawFeatures) ? (rawFeatures as GlobeFeature[]) : [];

      const width = container.clientWidth;
      const height = Math.min(width, 460);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const globe = (new (Globe as any)() as any)
        .width(width)
        .height(height)
        .backgroundColor("rgba(0,0,0,0)")
        .showGlobe(true)
        .showAtmosphere(true)
        .atmosphereColor("#00e8ff")
        .atmosphereAltitude(0.16)
        .globeMaterial(
          new threeModule.MeshPhongMaterial({
            color: "#070a12",
            transparent: true,
            opacity: 0.9,
          }),
        )
        .polygonsData(countryFeatures)
        .polygonCapColor((d: unknown) => {
          const feat = d as GlobeFeature;
          const countryCode = String(feat.id ?? "");
          const count = countsByCode[countryCode] || 0;
          if (count > 0) return "rgba(0, 232, 255, 0.16)";
          return "rgba(0, 232, 255, 0.03)";
        })
        .polygonSideColor(() => "rgba(0, 232, 255, 0.06)")
        .polygonStrokeColor((d: unknown) => {
          const feat = d as GlobeFeature;
          const countryCode = String(feat.id ?? "");
          const count = countsByCode[countryCode] || 0;
          if (count > 0) return "rgba(0, 232, 255, 0.52)";
          return "rgba(0, 232, 255, 0.18)";
        })
        .polygonAltitude((d: unknown) => {
          const feat = d as GlobeFeature;
          const countryCode = String(feat.id ?? "");
          const count = countsByCode[countryCode] || 0;
          return count > 0 ? 0.012 : 0.004;
        })
        .polygonLabel((d: unknown) => {
          const feat = d as GlobeFeature;
          const countryCode = String(feat.id ?? "");
          const entry: CountryEntry | undefined = CODE_TO_COUNTRY.get(countryCode);
          const name = entry?.name || feat.properties?.name || "Unknown";
          const count = countsByCode[countryCode] || 0;
          const noun = count === 1 ? "article" : "articles";

          return `<div style="font-family:monospace;background:rgba(7,10,18,0.92);border:1px solid rgba(0,232,255,0.3);padding:6px 10px;border-radius:6px;font-size:12px;color:#e0e0e0;">
            <b style="color:#00e8ff">${name}</b>
            <br/><span style="color:#bc13fe;font-size:10px;">${count} ${noun}</span>
            <br/><span style="color:#9ca3af;font-size:10px;">Click to open global newsroom</span>
          </div>`;
        })
        .onPolygonHover((d: unknown) => {
          if (!d) {
            setHovered(null);
            return;
          }
          const feat = d as GlobeFeature;
          const countryCode = String(feat.id ?? "");
          const entry = CODE_TO_COUNTRY.get(countryCode);
          const name = entry?.name || feat.properties?.name || "Unknown";
          const count = countsByCode[countryCode] || 0;
          setHovered({ name, count });
        })
        .onPolygonClick(() => {
          router.push("/global-newsroom");
        });

      globe(container);
      globeRef.current = globe;
      globe.pointOfView({ altitude: 1.7 }, 0);
      setIsReady(true);

      const controls = globe.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.35;
        controls.enableDamping = true;
        controls.enableZoom = false;
      }

      resizeObserver = new ResizeObserver(() => {
        const w = container.clientWidth;
        const h = Math.min(w, 460);
        globe.width(w).height(h);
      });
      resizeObserver.observe(container);
    };

    void init();

    return () => {
      mounted = false;
      resizeObserver?.disconnect();
      globeRef.current?._destructor?.();
      globeRef.current = null;
    };
  }, [countsByCode, router]);

  return (
    <div className="relative mx-auto mb-7 w-full max-w-[460px]">
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="size-7 animate-spin text-[#00e8ff]/40" />
        </div>
      )}
      <div
        ref={containerRef}
        className="relative aspect-square w-full cursor-grab active:cursor-grabbing"
        aria-label="Interactive 3D country globe"
      />
      <p className="sr-only" aria-live="polite">
        {hovered
          ? `${hovered.name}: ${hovered.count} ${hovered.count === 1 ? "article" : "articles"}`
          : ""}
      </p>
    </div>
  );
}
