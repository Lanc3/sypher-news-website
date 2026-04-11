import { siteUrl } from "@/lib/site-url";

type ArticleJsonLdProps = {
  title: string;
  description: string;
  urlPath: string;
  datePublished: string;
  section?: string | null;
};

export function ArticleJsonLd({ title, description, urlPath, datePublished, section }: ArticleJsonLdProps) {
  const base = siteUrl();
  const url = `${base}${urlPath}`;
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        headline: title,
        description,
        datePublished,
        articleSection: section ?? undefined,
        url,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        publisher: {
          "@type": "Organization",
          name: "Sypher News",
          url: base,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
          { "@type": "ListItem", position: 2, name: "News", item: `${base}/news` },
          { "@type": "ListItem", position: 3, name: title, item: url },
        ],
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />;
}
