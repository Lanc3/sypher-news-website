"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const t = window.setTimeout(() => setOpen(true), 8000);
    return () => window.clearTimeout(t);
  }, []);

  function dismiss() {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMsg(null);
    const res = await subscribeNewsletter(email);
    setPending(false);
    setMsg(res.message);
    if (res.ok) {
      setEmail("");
      dismiss();
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div className="relative w-full max-w-md border border-[#00ff41]/40 bg-[#080808] p-6 shadow-[0_0_30px_rgba(0,255,65,0.15)]">
        <button
          type="button"
          aria-label="Close"
          onClick={dismiss}
          className="absolute right-3 top-3 text-[#888] hover:text-[#00ff41]"
        >
          <X className="h-5 w-5" />
        </button>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#ff2bd6]">Signal boost</p>
        <h2 className="mt-2 font-mono text-lg text-[#00ff41]">Join the Sypher dispatch</h2>
        <p className="mt-2 text-sm text-[#b0b0b0]">Weekly deconstructions, no fluff. Unsubscribe anytime.</p>
        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="sm:flex-1" />
          <Button type="submit" disabled={pending}>
            {pending ? "…" : "Join"}
          </Button>
        </form>
        {msg ? <p className="mt-2 text-xs text-[#888]">{msg}</p> : null}
      </div>
    </div>
  );
}
