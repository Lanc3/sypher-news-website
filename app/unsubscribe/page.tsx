import Link from "next/link";

export const metadata = {
  title: "Unsubscribe",
};

export default function UnsubscribePage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16 font-mono text-[#e0e0e0]">
      <h1 className="text-xl text-[#00ff41]">Unsubscribe</h1>
      <p className="mt-4 text-sm leading-relaxed text-[#a8a8a8]">
        ESP-backed unsubscribe is not wired yet. Contact the operator with the email you used to subscribe, or ignore
        future messages once delivery is connected.
      </p>
      <Link href="/" className="mt-8 inline-block text-[#ff2bd6] hover:underline">
        ← Return home
      </Link>
    </main>
  );
}
