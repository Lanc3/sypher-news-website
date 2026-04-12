"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { subscribeNewsletter } from "@/app/actions/newsletter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STORAGE_KEY = "sypher_newsletter_popup_dismissed";

export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => setOpen(true), 15000);
    return () => window.clearTimeout(t);
  }, []);

  function dismiss() {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") dismiss();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMsg(null);
    const res = await subscribeNewsletter(email, "popup");
    setPending(false);
    setMsg(res.message);
    if (res.ok) {
      setEmail("");
      dismiss();
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/65 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center sm:pb-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-popup-title"
      onClick={dismiss}
    >
      <div
        className="panel panel-glow relative w-full max-w-md border-[#00e8ff]/40 p-5 shadow-[0_0_30px_rgba(0,232,255,0.12)] sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          aria-label="Close"
          onClick={dismiss}
          className="absolute right-3 top-3 flex min-h-11 min-w-11 items-center justify-center rounded-md text-[#888] transition hover:bg-[#00e8ff]/10 hover:text-[#00e8ff]"
        >
          <X className="h-5 w-5" />
        </button>
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[#bc13fe] sm:text-xs">Signal boost</p>
        <h2 id="newsletter-popup-title" className="mt-2 pr-10 font-mono text-lg text-[#00e8ff] sm:text-xl">
          Join the Sypher dispatch
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#b0b0b0]">Weekly deconstructions, no fluff. Unsubscribe anytime.</p>
        <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <Input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="sm:flex-1"
            autoComplete="email"
          />
          <Button type="submit" disabled={pending} className="shrink-0 sm:w-auto">
            {pending ? "…" : "Join"}
          </Button>
        </form>
        {msg ? <p className="mt-3 text-xs text-[#888]" aria-live="polite">{msg}</p> : null}
      </div>
    </div>
  );
}
