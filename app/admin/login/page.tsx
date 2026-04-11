import { Suspense } from "react";
import { AdminLoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <div className="min-h-[70vh] px-4 py-10">
      <Suspense fallback={<p className="text-center font-mono text-[#666]">Loading…</p>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
