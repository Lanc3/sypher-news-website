import { ImageResponse } from "next/og";
import { getArticleBySlug } from "@/lib/article-public";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ category: string; slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  const title = article?.title ?? "Sypher News";
  const cat = article?.topic?.category?.name ?? "News";
  const line = title.length > 96 ? `${title.slice(0, 93)}…` : title;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 48,
          background: "#070a12",
          color: "#e0e0e0",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        }}
      >
        <div style={{ fontSize: 22, color: "#bc13fe", letterSpacing: "0.3em", textTransform: "uppercase" }}>{cat}</div>
        <div
          style={{
            marginTop: 24,
            fontSize: 52,
            lineHeight: 1.1,
            color: "#00e8ff",
            textShadow: "0 0 24px rgba(0,232,255,0.35)",
            maxHeight: 320,
            overflow: "hidden",
          }}
        >
          {line}
        </div>
        <div style={{ marginTop: 40, fontSize: 20, color: "#666" }}>sypher.news · transparency stack</div>
      </div>
    ),
    { ...size },
  );
}
