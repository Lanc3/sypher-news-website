import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div className="space-y-6 font-mono">
      <h1 className="text-2xl text-[#00e8ff]">Operator console</h1>
      <p className="text-sm text-[#888]">Manage transmissions, ad slots, and telemetry.</p>
      <ul className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/articles"
          className="rounded-lg border border-[#00e8ff]/25 bg-black/50 p-4 hover:border-[#00e8ff]/60"
        >
          <h2 className="text-[#bc13fe]">Articles</h2>
          <p className="mt-2 text-xs text-[#777]">CRUD markdown payloads</p>
        </Link>
        <Link href="/admin/ads" className="rounded-lg border border-[#00e8ff]/25 bg-black/50 p-4 hover:border-[#00e8ff]/60">
          <h2 className="text-[#bc13fe]">Ad placements</h2>
          <p className="mt-2 text-xs text-[#777]">Toggle header / sidebar / in-article</p>
        </Link>
        <Link
          href="/admin/analytics"
          className="rounded-lg border border-[#00e8ff]/25 bg-black/50 p-4 hover:border-[#00e8ff]/60"
        >
          <h2 className="text-[#bc13fe]">Analytics</h2>
          <p className="mt-2 text-xs text-[#777]">Page views + engagement stubs</p>
        </Link>
      </ul>
    </div>
  );
}
