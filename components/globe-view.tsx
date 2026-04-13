"use client";

import { useEffect, useRef, useCallback } from "react";
import type { CountryEntry } from "@/lib/countries";
import { CODE_TO_COUNTRY } from "@/lib/countries";

type GlobeFeature = {
  type: string;
  id: string;
  properties: { name: string };
  geometry: unknown;
};

type Props = {
  countriesWithArticles: Set<string>;
  selectedCode: string | null;
  onCountryClick: (code: string) => void;
  onCountryHover: (name: string | null) => void;
};

export function GlobeView({
  countriesWithArticles,
  selectedCode,
  onCountryClick,
  onCountryHover,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const propsRef = useRef({ countriesWithArticles, selectedCode, onCountryClick, onCountryHover });
  propsRef.current = { countriesWithArticles, selectedCode, onCountryClick, onCountryHover };

  const init = useCallback(async () => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const [GlobeModule, topoModule, worldData] = await Promise.all([
      import("globe.gl"),
      import("topojson-client"),
      import("world-atlas/countries-110m.json"),
    ]);

    const Globe = GlobeModule.default;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const countries = (topoModule.feature as any)(
      worldData.default,
      (worldData.default as any).objects.countries,
    );

    const width = container.clientWidth;
    const height = Math.min(width, 520);

    // globe.gl exports a class constructor
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const globe = (new (Globe as any)() as any)
      .width(width)
      .height(height)
      .backgroundColor("rgba(0,0,0,0)")
      .showGlobe(true)
      .showAtmosphere(true)
      .atmosphereColor("#00e8ff")
      .atmosphereAltitude(0.2)
      .globeMaterial((() => {
        const THREE = require("three") as typeof import("three");
        return new THREE.MeshPhongMaterial({
          color: "#070a12",
          transparent: true,
          opacity: 0.85,
        });
      })())
      .polygonsData(countries.features)
      .polygonCapColor((d: unknown) => {
        const feat = d as GlobeFeature;
        const code = feat.id;
        if (code === propsRef.current.selectedCode) return "rgba(188, 19, 254, 0.35)";
        if (propsRef.current.countriesWithArticles.has(code)) return "rgba(0, 232, 255, 0.08)";
        return "rgba(0, 232, 255, 0.02)";
      })
      .polygonSideColor(() => "rgba(0, 232, 255, 0.05)")
      .polygonStrokeColor((d: unknown) => {
        const feat = d as GlobeFeature;
        const code = feat.id;
        if (code === propsRef.current.selectedCode) return "rgba(188, 19, 254, 0.7)";
        if (propsRef.current.countriesWithArticles.has(code)) return "rgba(0, 232, 255, 0.45)";
        return "rgba(0, 232, 255, 0.12)";
      })
      .polygonAltitude((d: unknown) => {
        const feat = d as GlobeFeature;
        return feat.id === propsRef.current.selectedCode ? 0.02 : 0.005;
      })
      .polygonLabel((d: unknown) => {
        const feat = d as GlobeFeature;
        const entry: CountryEntry | undefined = CODE_TO_COUNTRY.get(feat.id);
        const name = entry?.name || feat.properties.name || "Unknown";
        const hasArticles = propsRef.current.countriesWithArticles.has(feat.id);
        return `<div style="font-family:monospace;background:rgba(7,10,18,0.92);border:1px solid rgba(0,232,255,0.3);padding:6px 10px;border-radius:6px;font-size:12px;color:#e0e0e0;">
          <b style="color:#00e8ff">${name}</b>
          ${hasArticles ? '<br/><span style="color:#bc13fe;font-size:10px;">Click to view articles</span>' : '<br/><span style="color:#666;font-size:10px;">No articles yet</span>'}
        </div>`;
      })
      .onPolygonClick((d: unknown) => {
        const feat = d as GlobeFeature;
        propsRef.current.onCountryClick(feat.id);
      })
      .onPolygonHover((d: unknown) => {
        if (!d) {
          propsRef.current.onCountryHover(null);
          return;
        }
        const feat = d as GlobeFeature;
        const entry = CODE_TO_COUNTRY.get(feat.id);
        propsRef.current.onCountryHover(entry?.name || feat.properties.name || null);
        // Refresh polygon colors on hover for visual feedback
        globe.polygonCapColor(globe.polygonCapColor());
      });

    globe(container);
    globeRef.current = globe;

    // Auto-rotate
    const controls = globe.controls();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.3;
      controls.enableDamping = true;
    }

    // Resize observer
    const ro = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = Math.min(w, 520);
      globe.width(w).height(h);
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      globe._destructor?.();
    };
  }, []);

  useEffect(() => {
    const cleanup = init();
    return () => {
      cleanup.then((fn) => fn?.());
    };
  }, [init]);

  // Refresh colors when selection or articles change
  useEffect(() => {
    if (!globeRef.current) return;
    globeRef.current.polygonCapColor(globeRef.current.polygonCapColor());
    globeRef.current.polygonStrokeColor(globeRef.current.polygonStrokeColor());
    globeRef.current.polygonAltitude(globeRef.current.polygonAltitude());
  }, [selectedCode, countriesWithArticles]);

  return (
    <div
      ref={containerRef}
      className="relative aspect-square w-full max-w-[520px] mx-auto cursor-grab active:cursor-grabbing"
      aria-label="Interactive 3D globe showing countries"
    />
  );
}
