"use client";

import { useState } from "react";
import { unsubscribeNewsletter } from "@/app/actions/newsletter";
import { Button } from "@/components/ui/button";

export function UnsubscribeForm({ token }: { token: string }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit() {
    setPending(true);
    const result = await unsubscribeNewsletter(token);
    setPending(false);
    setMessage(result.message);
    setDone(result.ok);
  }

  return (
    <div className="mt-6 space-y-4">
      <p className="text-sm leading-relaxed text-[#a8a8a8]">
        This will stop Sypher dispatch emails to the address associated with this link.
      </p>
      <Button type="button" disabled={pending || done} onClick={onSubmit}>
        {pending ? "Unsubscribing…" : done ? "Unsubscribed" : "Confirm unsubscribe"}
      </Button>
      {message ? <p className="text-sm text-[#888]" aria-live="polite">{message}</p> : null}
    </div>
  );
}
