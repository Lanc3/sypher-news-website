import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Server-side guard so /admin dashboard routes stay protected even if edge proxy is skipped.
 */
export default async function SecureAdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }
  return <>{children}</>;
}
