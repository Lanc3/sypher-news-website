import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createAdminAccountFormAction, deleteAdminAccountFormAction } from "@/app/admin/admin-actions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminAccountControlPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/admin");
  }

  const [adminAccounts, clientAccounts] = await Promise.all([
    prisma.user.findMany({
      where: { role: "ADMIN" },
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, createdAt: true },
    }),
    prisma.user.findMany({
      where: { role: "CLIENT" },
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, createdAt: true },
    }),
  ]);

  return (
    <div className="space-y-6 font-mono">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#444]">Security</p>
        <h1 className="mt-1 text-xl font-semibold text-[#e0e0e0]">Account Control</h1>
        <p className="mt-1 text-sm text-[#666]">
          Manage administrator logins and view client accounts separately.
        </p>
      </div>

      <section className="rounded-lg border border-[#00e8ff]/10 bg-black/40 p-5">
        <h2 className="text-sm font-semibold text-[#bc13fe]">Create admin account</h2>
        <p className="mt-1 text-xs text-[#555]">New admin users can access all admin tools.</p>
        <form action={createAdminAccountFormAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input
            type="email"
            name="email"
            required
            placeholder="admin@email.com"
            className="rounded border border-[#00e8ff]/15 bg-black/60 px-3 py-2 text-sm text-[#ddd] outline-none ring-0 placeholder:text-[#444] focus:border-[#00e8ff]/40"
          />
          <input
            type="password"
            name="password"
            required
            minLength={8}
            placeholder="Password (min 8 chars)"
            className="rounded border border-[#00e8ff]/15 bg-black/60 px-3 py-2 text-sm text-[#ddd] outline-none ring-0 placeholder:text-[#444] focus:border-[#00e8ff]/40"
          />
          <button
            type="submit"
            className="rounded border border-[#00e8ff]/35 px-4 py-2 text-sm text-[#00e8ff] transition hover:bg-[#00e8ff]/10"
          >
            Create admin
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-[#00e8ff]/10 bg-black/40">
        <div className="flex items-center justify-between border-b border-[#00e8ff]/10 px-5 py-4">
          <h2 className="text-sm font-semibold text-[#bc13fe]">Admin accounts</h2>
          <span className="text-xs text-[#555]">{adminAccounts.length} total</span>
        </div>
        {adminAccounts.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-[#555]">No admin accounts found.</p>
        ) : (
          <ul className="divide-y divide-[#00e8ff]/5">
            {adminAccounts.map((account) => {
              const isCurrent = session.user.id === account.id;
              return (
                <li key={account.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-[#ddd]">{account.email}</p>
                    <p className="text-[11px] text-[#444]">
                      Added {account.createdAt.toLocaleString()}
                      {isCurrent ? " · You" : ""}
                    </p>
                  </div>
                  <form action={deleteAdminAccountFormAction}>
                    <input type="hidden" name="id" value={account.id} />
                    <button
                      type="submit"
                      disabled={isCurrent || adminAccounts.length <= 1}
                      className="rounded border border-red-500/25 px-3 py-1.5 text-xs text-red-400/70 transition hover:border-red-500/60 hover:text-red-300 disabled:cursor-not-allowed disabled:border-[#333] disabled:text-[#555]"
                    >
                      Delete
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-[#00e8ff]/10 bg-black/40">
        <div className="flex items-center justify-between border-b border-[#00e8ff]/10 px-5 py-4">
          <h2 className="text-sm font-semibold text-[#bc13fe]">Client accounts</h2>
          <span className="text-xs text-[#555]">{clientAccounts.length} total</span>
        </div>
        {clientAccounts.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-[#555]">No client accounts yet.</p>
        ) : (
          <ul className="divide-y divide-[#00e8ff]/5">
            {clientAccounts.map((account) => (
              <li key={account.id} className="px-5 py-3">
                <p className="truncate text-sm text-[#ddd]">{account.email}</p>
                <p className="text-[11px] text-[#444]">Joined {account.createdAt.toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
