"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck, Copy, Mail, MessageCircle, Send, Share2 } from "lucide-react";
import { removeSavedArticle, saveArticleForLater } from "@/app/actions/feed";

type ArticleShareSaveActionsProps = {
  articleId: number;
  href: string;
  title: string;
  compact?: boolean;
  initialSaved?: boolean;
  onToggleSave?: (articleId: number, nextSaved: boolean) => void | Promise<void>;
};

export function ArticleShareSaveActions({
  articleId,
  href,
  title,
  compact = false,
  initialSaved = false,
  onToggleSave,
}: ArticleShareSaveActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileShareOpen, setMobileShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveHintVisible, setSaveHintVisible] = useState(false);
  const [saved, setSaved] = useState(initialSaved);
  const [shareUrl, setShareUrl] = useState(href);

  useEffect(() => {
    setSaved(initialSaved);
  }, [initialSaved]);

  useEffect(() => {
    setShareUrl(new URL(href, window.location.origin).toString());
  }, [href]);

  async function trackShare(target: string) {
    try {
      await fetch("/api/analytics/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "SHARE",
          path: typeof window === "undefined" ? href : new URL(href, window.location.origin).pathname,
          metadata: { target },
        }),
      });
    } catch {
      // Ignore analytics failures.
    }
  }

  async function copyLink(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    void trackShare("copy");
    window.setTimeout(() => setCopied(false), 1400);
  }

  async function handleSave(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (isSaving) return;
    const nextSaved = !saved;
    setIsSaving(true);
    setSaved(nextSaved);
    try {
      if (onToggleSave) {
        await onToggleSave(articleId, nextSaved);
      } else if (nextSaved) {
        await saveArticleForLater(articleId);
      } else {
        await removeSavedArticle(articleId);
      }
    } catch {
      setSaved(!nextSaved);
      router.push(`/feed/login?next=${encodeURIComponent(pathname || "/")}`);
    } finally {
      setIsSaving(false);
    }
  }

  const shareTargets = [
    { label: "X", href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}` },
    { label: "Email", href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareUrl)}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${shareUrl}`)}` },
    { label: "Telegram", href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}` },
    { label: "Reddit", href: `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}` },
  ] as const;

  const rowClass = compact ? "mt-2.5 gap-1.5" : "mt-3.5 gap-2";
  const triggerClass = compact
    ? "h-7 px-2 text-[10px]"
    : "h-8 px-2.5 text-[11px]";
  const iconButtonClass = compact ? "h-7 px-2" : "h-8 px-2.5";
  const popoverOffsetClass = compact ? "mb-1.5" : "mb-2";

  return (
    <div className={`flex items-center ${rowClass}`}>
      <div className="group relative">
        <button
          type="button"
          aria-expanded={mobileShareOpen}
          aria-label="Share article"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setMobileShareOpen((v) => !v);
          }}
          className={`inline-flex items-center gap-1 rounded-md border border-[#00e8ff]/30 font-mono text-[#9fd7df] transition hover:border-[#00e8ff]/55 hover:text-[#00e8ff] ${triggerClass}`}
        >
          <Share2 className="size-3.5" aria-hidden />
          Share
        </button>

        <div className={`absolute bottom-full left-0 z-20 w-64 rounded-md border border-[#00e8ff]/25 bg-[#020405]/95 p-2 shadow-lg transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 ${popoverOffsetClass} ${mobileShareOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}>
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-1 rounded border border-[#444] px-1.5 py-1 text-[10px] text-[#c8c8c8] hover:border-[#00e8ff]/50 hover:text-[#00e8ff]"
            >
              <Copy className="size-3" aria-hidden />
              {copied ? "Copied" : "Copy"}
            </button>
            {shareTargets.map((target) => {
              const icon = target.label === "Email"
                ? <Mail className="size-3" aria-hidden />
                : target.label === "WhatsApp"
                  ? <MessageCircle className="size-3" aria-hidden />
                  : target.label === "Telegram"
                    ? <Send className="size-3" aria-hidden />
                    : null;
              return (
                <a
                  key={target.label}
                  href={target.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => void trackShare(target.label)}
                  className="inline-flex items-center gap-1 rounded border border-[#444] px-1.5 py-1 text-[10px] text-[#c8c8c8] hover:border-[#00e8ff]/50 hover:text-[#00e8ff]"
                >
                  {icon}
                  {target.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative">
        <button
          type="button"
          aria-label={saved ? "Remove from saved articles" : "Save to your saved articles"}
          onMouseEnter={() => setSaveHintVisible(true)}
          onMouseLeave={() => setSaveHintVisible(false)}
          onFocus={() => setSaveHintVisible(true)}
          onBlur={() => setSaveHintVisible(false)}
          onClick={handleSave}
          disabled={isSaving}
          className={`inline-flex items-center rounded-md border border-[#bc13fe]/35 text-[#d8b9f6] transition hover:border-[#bc13fe]/60 hover:text-[#bc13fe] disabled:opacity-60 ${iconButtonClass}`}
        >
          {saved ? <BookmarkCheck className="size-4" aria-hidden /> : <Bookmark className="size-4" aria-hidden />}
        </button>
        <div className={`pointer-events-none absolute bottom-full left-0 z-20 mb-2 whitespace-nowrap rounded bg-black/95 px-2 py-1 text-[10px] text-[#d5d5d5] transition-opacity ${saveHintVisible ? "opacity-100" : "opacity-0"}`}>
          Save to your saved articles
        </div>
      </div>
    </div>
  );
}
