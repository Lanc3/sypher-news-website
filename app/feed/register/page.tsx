import { Suspense } from "react";
import { FeedRegisterForm } from "./register-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create your feed account",
};

export default function FeedRegisterPage() {
  return (
    <main id="main-content" className="flex flex-1 items-center justify-center px-4 py-16">
      <Suspense fallback={<p className="text-center font-mono text-[#666]">Loading...</p>}>
        <FeedRegisterForm />
      </Suspense>
    </main>
  );
}
