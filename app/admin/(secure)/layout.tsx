import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Server-side guard so /admin dashboard routes stay protected even if edge proxy is skipped.
 * Rejects CLIENT users -- only ADMIN and EDITOR may access the admin panel.
 */
export default async function SecureAdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const role = session?.user?.role;
  if (!role || (role !== "ADMIN" && role !== "EDITOR")) {
    redirect("/admin/login");
  }
  return <>{children}</>;
}
