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
  description: "Disassemble mainstream narratives with transparent, data-driven reporting.",
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
  const placements = await loadAdPlacements();

  return (
    <html lang="en" className={`${mono.variable} h-full`}>
      <body className={`${mono.className} relative flex min-h-full flex-col bg-[#050505] text-[#e0e0e0] antialiased`}>
        <Providers>
          <AdProviderClient placements={placements}>
            <CrtOverlay />
            <SiteHeader />
            {children}
            <SiteFooter />
            <NewsletterPopup />
          </AdProviderClient>
        </Providers>
      </body>
    </html>
  );
}
