"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const MIN_MS = 260;
const FADE_OUT_MS = 220;
const STUCK_MAX_MS = 12_000;
const CREEP_EVERY_MS = 120;
const CREEP = 0.04;

/**
 * NProgress-style top bar: start on in-app link click or popstate, complete on pathname change.
 * `usePathname` only (no `useSearchParams` → no root Suspense requirement).
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [p, setP] = useState(0);
  const startedAt = useRef<number | null>(null);
  const creepRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stuckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPath = useRef(pathname);

  const clearCreep = useCallback(() => {
    if (creepRef.current) {
      clearInterval(creepRef.current);
      creepRef.current = null;
    }
  }, []);

  const hardHide = useCallback(() => {
    clearCreep();
    if (completeTimer.current) {
      clearTimeout(completeTimer.current);
      completeTimer.current = null;
    }
    if (stuckTimer.current) {
      clearTimeout(stuckTimer.current);
      stuckTimer.current = null;
    }
    setP(0);
    setVisible(false);
    startedAt.current = null;
  }, [clearCreep]);

  const runComplete = useCallback(() => {
    if (stuckTimer.current) {
      clearTimeout(stuckTimer.current);
      stuckTimer.current = null;
    }
    const t0 = startedAt.current;
    if (t0 == null) return;
    const go = () => {
      clearCreep();
      setP(1);
      startedAt.current = null;
      completeTimer.current = setTimeout(() => {
        setVisible(false);
        setP(0);
        completeTimer.current = null;
      }, FADE_OUT_MS);
    };
    const elapsed = Date.now() - t0;
    const wait = Math.max(0, MIN_MS - elapsed);
    if (wait === 0) {
      go();
    } else {
      completeTimer.current = setTimeout(() => {
        go();
      }, wait);
    }
  }, [clearCreep]);

  const start = useCallback(() => {
    if (stuckTimer.current) clearTimeout(stuckTimer.current);
    startedAt.current = Date.now();
    setVisible(true);
    setP(0.12);
    clearCreep();
    creepRef.current = setInterval(() => {
      setP((w) => (w < 0.9 ? Math.min(0.88, w + CREEP) : w));
    }, CREEP_EVERY_MS);
    stuckTimer.current = setTimeout(() => {
      hardHide();
    }, STUCK_MAX_MS);
  }, [clearCreep, hardHide]);

  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    if (startedAt.current == null) return;
    runComplete();
  }, [pathname, runComplete]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const t = (e.target as Node).nodeType === Node.ELEMENT_NODE ? (e.target as Element) : (e.target as Node).parentElement;
      const a = t?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      if (a.getAttribute("target") === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) return;
      let url: URL;
      try {
        url = new URL(href, window.location.origin);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === pathname && url.search === window.location.search) return;
      start();
    };
    const onPop = () => {
      start();
    };
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPop);
    };
  }, [pathname, start]);

  useEffect(
    () => () => {
      hardHide();
    },
    [hardHide],
  );

  const showBar = visible || p > 0.02;

  return (
    <div
      className="pointer-events-none fixed left-0 right-0 top-0 z-[200] h-[2px] overflow-hidden"
      style={{ opacity: showBar ? 1 : 0 }}
      aria-hidden={!showBar}
    >
      <div
        className="h-full w-full origin-left bg-gradient-to-r from-[#bc13fe] via-[#00e8ff] to-[#00e8ff] transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none"
        style={{
          transform: `scaleX(${p})`,
          transformOrigin: "0 50%",
        }}
      />
      {showBar ? (
        <span className="sr-only" role="status">
          Loading
        </span>
      ) : null}
    </div>
  );
}
