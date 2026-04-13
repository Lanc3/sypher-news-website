"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerClient } from "@/app/actions/feed";

export function FeedRegisterForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(registerClient, {});

  useEffect(() => {
    if (state.ok) {
      router.push("/feed/login?registered=1");
    }
  }, [state.ok, router]);

  return (
    <form
      action={formAction}
      className="w-full max-w-sm rounded-lg border border-[#00e8ff]/30 bg-black/60 p-6 space-y-4"
    >
      <h1 className="font-mono text-xl text-[#00e8ff]">Create your feed account</h1>
      <p className="text-sm text-[#888]">
        Sign up to build a personalised news feed based on the categories you care about.
      </p>

      <div className="space-y-2">
        <Label htmlFor="reg-email">Email</Label>
        <Input
          id="reg-email"
          name="email"
          type="email"
          autoComplete="username"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-password">Password</Label>
        <Input
          id="reg-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <p className="text-xs text-[#666]">Minimum 8 characters</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-confirm">Confirm password</Label>
        <Input
          id="reg-confirm"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating account..." : "Create account"}
      </Button>

      <p className="text-center text-sm text-[#888]">
        Already have an account?{" "}
        <Link
          href="/feed/login"
          className="text-[#bc13fe] underline decoration-[#bc13fe]/40 underline-offset-4 hover:decoration-[#bc13fe]"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
