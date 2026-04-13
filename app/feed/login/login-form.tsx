"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FeedLoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/feed";
  const justRegistered = searchParams.get("registered") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setPending(false);
    if (res?.error) {
      setError("Invalid credentials.");
      return;
    }
    window.location.href = callbackUrl;
  }

  return (
    <div className="w-full max-w-sm">
      {justRegistered && (
        <div className="mb-4 rounded-lg border border-[#00e8ff]/30 bg-[#00e8ff]/5 px-4 py-3 text-center font-mono text-sm text-[#00e8ff]">
          Account created! Sign in below.
        </div>
      )}
      <form
        onSubmit={onSubmit}
        className="rounded-lg border border-[#00e8ff]/30 bg-black/60 p-6 space-y-4"
      >
        <h1 className="font-mono text-xl text-[#00e8ff]">Sign in to your feed</h1>
        <p className="text-sm text-[#888]">
          Access your personalised news feed.
        </p>

        <div className="space-y-2">
          <Label htmlFor="feed-email">Email</Label>
          <Input
            id="feed-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="feed-password">Password</Label>
          <Input
            id="feed-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Signing in..." : "Sign in"}
        </Button>

        <p className="text-center text-sm text-[#888]">
          No account?{" "}
          <Link
            href="/feed/register"
            className="text-[#bc13fe] underline decoration-[#bc13fe]/40 underline-offset-4 hover:decoration-[#bc13fe]"
          >
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}
