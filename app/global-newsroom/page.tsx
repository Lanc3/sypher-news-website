import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SiteContainer } from "@/components/site-container";
import { GlobalNewsroomClient } from "@/components/global-newsroom-client";
import { SLUG_TO_COUNTRY } from "@/lib/countries";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Global News Room",
  description:
    "Explore news from around the world. Select a country on the interactive 3D globe to see coverage.",
};

export default async function GlobalNewsroomPage() {
  let allCategories: { id: number; slug: string; name: string }[] = [];
  try {
    allCategories = await prisma.category.findMany({
      select: { id: true, slug: true, name: true },
      orderBy: { name: "asc" },
    });
  } catch {
    allCategories = [];
  }

  const countryCategories = allCategories.filter((cat) => SLUG_TO_COUNTRY.has(cat.slug));

  return (
    <main id="main-content" className="flex-1 py-8 sm:py-10 lg:py-12">
      <SiteContainer max="lg">
        <GlobalNewsroomClient countryCategories={countryCategories} />
      </SiteContainer>
    </main>
  );
}
