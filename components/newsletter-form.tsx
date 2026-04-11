"use client";

import { useState } from "react";
import { subscribeNewsletter } from "@/app/actions/newsletter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMsg(null);
    const res = await subscribeNewsletter(email);
    setPending(false);
    setMsg(res.message);
    if (res.ok) setEmail("");
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 flex max-w-md flex-col gap-2 sm:flex-row">
      <Input
        type="email"
        required
        placeholder="you@domain.net"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="sm:flex-1"
      />
      <Button type="submit" disabled={pending} className="shrink-0 border-[#ff2bd6]/50 text-[#ff2bd6] hover:shadow-[0_0_16px_rgba(255,43,214,0.35)]">
        {pending ? "…" : "Subscribe"}
      </Button>
      {msg ? <p className="text-xs text-[#888] sm:col-span-2">{msg}</p> : null}
    </form>
  );
}
