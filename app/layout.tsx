import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";
import { prisma } from "@/lib/prisma";
import { AdProviderClient } from "@/components/ad-provider";
import { CrtOverlay } from "@/components/crt-overlay";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NewsletterPopup } from "@/components/newsletter-popup";
import { assertRuntimeEnv } from "@/lib/env";

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Sypher News",
    template: "%s · Sypher News",
  },
  description: "We disassemble mainstream news coverage so you can get the story with less bias, clearer sourcing, and more transparency.",
  keywords: ["news analysis", "bias analysis", "news transparency", "media criticism", "Sypher News"],
};

async function loadAdPlacements() {
  if (!process.env.DATABASE_URL) return [];
  try {
    return await prisma.adPlacement.findMany({ orderBy: { slot: "asc" } });
  } catch {
    return [];
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  assertRuntimeEnv();
  const placements = await loadAdPlacements();

  return (
    <html lang="en" className={`${mono.variable} h-full`}>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9029459573777442"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${mono.className} relative flex min-h-dvh flex-col bg-[#070a12] text-[#e0e0e0] antialiased`}>
        <Providers>
          <AdProviderClient placements={placements}>
            <CrtOverlay />
            <a
              href="#content-start"
              className="absolute left-4 top-4 z-[120] -translate-y-24 rounded bg-[#00e8ff] px-3 py-2 text-sm font-medium text-black transition focus:translate-y-0"
            >
              Skip to content
            </a>
            <SiteHeader />
            <div id="content-start" tabIndex={-1} className="relative z-10 flex flex-1 flex-col">
              {children}
            </div>
            <SiteFooter />
            <NewsletterPopup />
          </AdProviderClient>
        </Providers>
      </body>
    </html>
  );
}
