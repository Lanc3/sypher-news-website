import { Suspense } from "react";
import { FeedLoginForm } from "./login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in to your feed",
};

export default function FeedLoginPage() {
  return (
    <main id="main-content" className="flex flex-1 items-center justify-center px-4 py-16">
      <Suspense fallback={<p className="text-center font-mono text-[#666]">Loading...</p>}>
        <FeedLoginForm />
      </Suspense>
    </main>
  );
}
