import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { cn } from "@/lib/utils";

const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code || []), "className"],
    span: [...(defaultSchema.attributes?.span || []), "className"],
  },
};

export function MarkdownBody({ content, className }: { content: string; className?: string }) {
  return (
    <div
      className={cn(
        "article-md max-w-none space-y-4 break-words text-[#e0e0e0] text-[0.9375rem] leading-relaxed sm:text-base",
        "[&_a]:break-words [&_a]:text-[#bc13fe] [&_blockquote]:border-l-2 [&_blockquote]:border-[#00e8ff]/35 [&_blockquote]:pl-4 [&_blockquote]:text-[#b8b8b8]",
        "[&_code]:rounded [&_code]:break-all [&_code]:bg-black/50 [&_code]:px-1 [&_code]:text-[0.85em] [&_code]:text-[#00e8ff]",
        "[&_h1]:scroll-mt-24 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-[#e8e8e8] sm:[&_h1]:text-2xl",
        "[&_h2]:scroll-mt-24 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-[#e8e8e8] sm:[&_h2]:text-xl",
        "[&_h3]:scroll-mt-24 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-[#e0e0e0] sm:[&_h3]:text-lg",
        "[&_img]:max-h-[70vh] [&_img]:max-w-full [&_img]:rounded-md [&_img]:border [&_img]:border-[#00e8ff]/20",
        "[&_li]:ml-4 [&_li]:marker:text-[#00e8ff]/50",
        "[&_ol]:list-decimal [&_ol]:space-y-1",
        "[&_p]:leading-relaxed",
        "[&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:border [&_pre]:border-[#00e8ff]/25 [&_pre]:bg-black/60 [&_pre]:p-3 [&_pre]:text-[0.8125rem] sm:[&_pre]:text-sm",
        "[&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto",
        "[&_th]:border [&_th]:border-[#00e8ff]/25 [&_th]:bg-black/50 [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left [&_th]:text-xs",
        "[&_td]:border [&_td]:border-[#00e8ff]/15 [&_td]:px-2 [&_td]:py-1.5 [&_td]:text-xs sm:[&_td]:text-sm",
        "[&_ul]:list-disc [&_ul]:space-y-1",
        className,
      )}
    >
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, schema]]}
        components={{
          a: ({ node: _n, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" className="underline decoration-[#bc13fe]/60 underline-offset-2" />
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
