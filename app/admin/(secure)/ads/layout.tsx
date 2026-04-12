import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function AdminRevenueLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (session.user.role !== "ADMIN") redirect("/admin");
  return <>{children}</>;
}
