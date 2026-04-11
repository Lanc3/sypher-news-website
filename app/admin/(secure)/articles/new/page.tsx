import Link from "next/link";
import { NewArticleForm } from "./new-article-form";

export default function NewArticlePage() {
  return (
    <div className="space-y-6 font-mono">
      <Link href="/admin/articles" className="text-sm text-[#888] hover:text-[#00e8ff]">
        ← Articles
      </Link>
      <h1 className="text-2xl text-[#00e8ff]">New article</h1>
      <NewArticleForm />
    </div>
  );
}
