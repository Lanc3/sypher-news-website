import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";
import { prisma } from "@/lib/prisma";
import { AdProviderClient } from "@/components/ad-provider";
import { CrtOverlay } from "@/components/crt-overlay";
import { NavigationProgress } from "@/components/navigation-progress";
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
    default: "Sypher News — Media analysis, not another news site",
    template: "%s · Sypher News",
  },
  description:
    "We disassemble mainstream news coverage: how outlets framed the same story, what they emphasized, and whose voices got left out. Every claim sourced, every frame surfaced.",
  keywords: ["media analysis", "news framing", "news transparency", "source analysis", "Sypher News"],
  authors: [{ name: "Aaron Keating", url: "/about" }],
  icons: {
    icon: "/sypher-logo.png",
    shortcut: "/sypher-logo.png",
    apple: "/sypher-logo.png",
  },
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
    <html lang="en" data-scroll-behavior="smooth" className={`${mono.variable} h-full`}>
      <head>
        <link rel="author" href="/about" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9029459573777442"
          crossOrigin="anonymous"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${mono.className} relative flex min-h-dvh flex-col bg-[#070a12] text-[#e0e0e0] antialiased`}>
        <script
          id="ld-json-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NewsMediaOrganization",
              name: "Sypher News",
              url: "https://www.sypher-news.com",
              logo: "https://www.sypher-news.com/sypher-logo.png",
              founder: { "@type": "Person", name: "Aaron Keating" },
              foundingDate: "2025",
              editorialPolicy: "https://www.sypher-news.com/methodology",
              diversityStaffingReport: "https://www.sypher-news.com/about",
              ethicsPolicy: "https://www.sypher-news.com/methodology",
              masthead: "https://www.sypher-news.com/about",
            }),
          }}
        />
        <Providers>
          <AdProviderClient placements={placements}>
            <NavigationProgress />
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
