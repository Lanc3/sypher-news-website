import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditArticleForm } from "./edit-article-form";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;
  const num = Number(id);
  if (!Number.isFinite(num)) notFound();

  const article = await prisma.article.findUnique({
    where: { id: num },
    include: { topic: { include: { category: true } } },
  });
  if (!article) notFound();

  return (
    <div className="space-y-6 font-mono">
      <Link href="/admin/articles" className="text-sm text-[#888] hover:text-[#00e8ff]">
        ← Articles
      </Link>
      <div>
        <h1 className="text-2xl text-[#00e8ff]">Edit article</h1>
        <p className="mt-1 text-xs text-[#666]">
          /news/{article.topic.category.slug}/{article.slug}
        </p>
      </div>
      <EditArticleForm article={article} />
    </div>
  );
}
