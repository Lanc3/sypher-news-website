import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SiteContainer } from "@/components/site-container";
import { FeedClient } from "./feed-client";
import {
  getAllCategories,
  getUserPreferences,
  getFeedArticles,
  getSavedArticleIds,
  getSavedArticles,
} from "@/app/actions/feed";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your feed",
  description: "Your personalised news feed on Sypher News.",
};

export default async function FeedPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/feed/login");
  }

  const [categories, preferenceIds, feedData, savedArticleIds, savedData] = await Promise.all([
    getAllCategories(),
    getUserPreferences(),
    getFeedArticles(1, 30),
    getSavedArticleIds(),
    getSavedArticles(1, 30),
  ]);

  return (
    <main id="main-content" className="flex-1 py-8 sm:py-10 lg:py-12">
      <SiteContainer max="lg">
        <FeedClient
          userEmail={session.user.email || ""}
          categories={categories}
          initialPreferenceIds={preferenceIds}
          initialArticles={feedData.articles}
          initialTotal={feedData.total}
          initialSavedArticleIds={savedArticleIds}
          initialSavedArticles={savedData.articles}
        />
      </SiteContainer>
    </main>
  );
}
