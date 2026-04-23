import { NextRequest, NextResponse } from "next/server";
import { listArticlesByCategorySlug } from "@/lib/article-public";

export async function GET(request: NextRequest) {
  const categorySlug = request.nextUrl.searchParams.get("category");
  if (!categorySlug) {
    return NextResponse.json({ articles: [] });
  }

  const raw = await listArticlesByCategorySlug(categorySlug, 50);

  const articles = raw.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    summary: a.summary,
    publishedAt: a.publishedAt?.toISOString() || null,
    createdAt: a.createdAt.toISOString(),
    articleAlignmentConfidence: a.articleAlignmentConfidence,
    featured: a.featured,
    categorySlug: a.topic?.category?.slug || categorySlug,
    categoryName: a.topic?.category?.name || categorySlug,
    coverImageUrl: a.coverImageUrl,
    coverImageThumbnailUrl: a.coverImageThumbnailUrl,
  }));

  return NextResponse.json({ articles });
}
