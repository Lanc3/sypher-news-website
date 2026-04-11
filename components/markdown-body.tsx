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
        "article-md max-w-none space-y-4 text-[#e0e0e0] [&_a]:text-[#ff2bd6] [&_code]:rounded [&_code]:bg-black/50 [&_code]:px-1 [&_code]:text-[#00ff41] [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_li]:ml-4 [&_ol]:list-decimal [&_p]:leading-relaxed [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:border [&_pre]:border-[#00ff41]/25 [&_pre]:bg-black/60 [&_pre]:p-3 [&_ul]:list-disc",
        className,
      )}
    >
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, schema]]}
        components={{
          a: ({ node: _n, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" className="underline decoration-[#ff2bd6]/60 underline-offset-2" />
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
