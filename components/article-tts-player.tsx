"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, Square, Volume2 } from "lucide-react";

function stripMarkdownToPlainText(md: string): string {
  let text = md;
  // Drop all hyperlinks (anchor text and URLs omitted from speech)
  text = text.replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, " ");
  // Remove images
  text = text.replace(/!\[.*?\]\(.*?\)/g, " ");
  // Inline markdown links [label](url)
  text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, " ");
  // Reference-style links [label][ref]
  text = text.replace(/\[([^\]]*)\]\s*\[[^\]]+\]/g, " ");
  // Angle-bracket autolinks
  text = text.replace(/<https?:\/\/[^>\s]+>/gi, " ");
  text = text.replace(/<mailto:[^>\s]+>/gi, " ");
  // Remove fenced code blocks
  text = text.replace(/```[\s\S]*?```/g, "");
  // Remove inline code
  text = text.replace(/`[^`]*`/g, "");
  // Remove headings markers
  text = text.replace(/^#{1,6}\s+/gm, "");
  // Remove bold/italic markers
  text = text.replace(/\*{1,3}(.*?)\*{1,3}/g, "$1");
  text = text.replace(/_{1,3}(.*?)_{1,3}/g, "$1");
  // Remove strikethrough
  text = text.replace(/~~(.*?)~~/g, "$1");
  // Remove blockquote markers
  text = text.replace(/^>\s?/gm, "");
  // Remove horizontal rules
  text = text.replace(/^[-*_]{3,}\s*$/gm, "");
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, "");
  // GFM footnote callouts in prose
  text = text.replace(/\[\^[^\]]+\]/g, " ");
  // Remove reference-style link definitions
  text = text.replace(/^\[[^\]]*\]:\s*.*$/gm, "");
  // Bare URLs in the markdown (never read aloud)
  text = text.replace(/\bhttps?:\/\/[^\s\]<>"']+/gi, " ");
  text = text.replace(/\bwww\.[^\s\]<>"']+/gi, " ");
  // Collapse multiple newlines / whitespace
  text = text.replace(/\n{2,}/g, ". ");
  text = text.replace(/\n/g, " ");
  text = text.replace(/\s{2,}/g, " ");
  return text.trim();
}

function splitIntoSentences(text: string): string[] {
  const raw = text.match(/[^.!?]+[.!?]+[\s]*/g) || [text];
  const sentences: string[] = [];
  let buffer = "";
  for (const s of raw) {
    buffer += s;
    // Keep sentences at a reasonable length to avoid Chrome timeout
    if (buffer.length > 120) {
      sentences.push(buffer.trim());
      buffer = "";
    }
  }
  if (buffer.trim()) sentences.push(buffer.trim());
  return sentences.filter(Boolean);
}

const SPEED_OPTIONS = [
  { label: "0.75x", value: 0.75 },
  { label: "1x", value: 1 },
  { label: "1.25x", value: 1.25 },
  { label: "1.5x", value: 1.5 },
];

type TTSState = "idle" | "playing" | "paused";

export function ArticleTTSPlayer({
  title,
  bodyMarkdown,
}: {
  title: string;
  bodyMarkdown: string;
}) {
  const [state, setState] = useState<TTSState>("idle");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>("");
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const [supported, setSupported] = useState(true);

  const sentencesRef = useRef<string[]>([]);
  const currentIndexRef = useRef(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const stateRef = useRef<TTSState>("idle");

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSupported(false);
      return;
    }

    const loadVoices = () => {
      const v = speechSynthesis.getVoices();
      if (v.length === 0) return;
      setVoices(v);
      const saved = localStorage.getItem("tts-voice-uri");
      const match = saved && v.find((voice) => voice.voiceURI === saved);
      if (match) {
        setSelectedVoiceURI(match.voiceURI);
      } else {
        const english = v.find((voice) => voice.lang.startsWith("en"));
        setSelectedVoiceURI(english?.voiceURI || v[0].voiceURI);
      }
    };

    loadVoices();
    speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  const plainText = useRef("");
  useEffect(() => {
    const body = stripMarkdownToPlainText(bodyMarkdown);
    plainText.current = `${title}. ${body}`;
    sentencesRef.current = splitIntoSentences(plainText.current);
  }, [title, bodyMarkdown]);

  const speakNext = useCallback(() => {
    const sentences = sentencesRef.current;
    const idx = currentIndexRef.current;

    if (idx >= sentences.length) {
      setState("idle");
      setProgress(0);
      currentIndexRef.current = 0;
      return;
    }

    const utterance = new SpeechSynthesisUtterance(sentences[idx]);
    utteranceRef.current = utterance;
    utterance.rate = speed;

    const voice = voices.find((v) => v.voiceURI === selectedVoiceURI);
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      if (stateRef.current !== "playing") return;
      currentIndexRef.current += 1;
      setProgress(Math.round(((currentIndexRef.current) / sentences.length) * 100));
      speakNext();
    };

    utterance.onerror = (e) => {
      if (e.error === "canceled" || e.error === "interrupted") return;
      setState("idle");
    };

    speechSynthesis.speak(utterance);
  }, [speed, voices, selectedVoiceURI]);

  const handlePlay = useCallback(() => {
    if (!window.speechSynthesis) return;

    if (state === "paused") {
      speechSynthesis.resume();
      setState("playing");
      return;
    }

    speechSynthesis.cancel();
    currentIndexRef.current = 0;
    setProgress(0);
    setState("playing");

    // Small delay after cancel to let browser clean up
    setTimeout(() => speakNext(), 50);
  }, [state, speakNext]);

  const handlePause = useCallback(() => {
    speechSynthesis.pause();
    setState("paused");
  }, []);

  const handleStop = useCallback(() => {
    speechSynthesis.cancel();
    setState("idle");
    setProgress(0);
    currentIndexRef.current = 0;
  }, []);

  const handleVoiceChange = useCallback(
    (uri: string) => {
      setSelectedVoiceURI(uri);
      localStorage.setItem("tts-voice-uri", uri);
      if (state === "playing") {
        speechSynthesis.cancel();
        setTimeout(() => speakNext(), 50);
      }
    },
    [state, speakNext],
  );

  useEffect(() => {
    return () => {
      speechSynthesis?.cancel();
    };
  }, []);

  if (!supported) return null;

  return (
    <div className="rounded-lg border border-[#00e8ff]/25 bg-black/50 px-4 py-3 sm:px-5 sm:py-4">
      <div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.25em] text-[#00e8ff]/70 sm:text-xs">
        <Volume2 className="size-3.5 sm:size-4" aria-hidden />
        <span>Listen to article</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
        {state === "playing" ? (
          <button
            type="button"
            onClick={handlePause}
            className="flex min-h-9 min-w-9 items-center justify-center rounded-md border border-[#00e8ff]/30 text-[#00e8ff] transition hover:bg-[#00e8ff]/10"
            aria-label="Pause"
          >
            <Pause className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePlay}
            className="flex min-h-9 min-w-9 items-center justify-center rounded-md border border-[#00e8ff]/30 text-[#00e8ff] transition hover:bg-[#00e8ff]/10"
            aria-label={state === "paused" ? "Resume" : "Play"}
          >
            <Play className="size-4" />
          </button>
        )}

        {state !== "idle" && (
          <button
            type="button"
            onClick={handleStop}
            className="flex min-h-9 min-w-9 items-center justify-center rounded-md border border-[#bc13fe]/30 text-[#bc13fe] transition hover:bg-[#bc13fe]/10"
            aria-label="Stop"
          >
            <Square className="size-4" />
          </button>
        )}

        <div className="flex items-center gap-2">
          <label htmlFor="tts-voice" className="sr-only">
            Voice
          </label>
          <select
            id="tts-voice"
            value={selectedVoiceURI}
            onChange={(e) => handleVoiceChange(e.target.value)}
            className="h-9 max-w-[10rem] truncate rounded-md border border-[#00e8ff]/20 bg-black/60 px-2 font-mono text-xs text-[#c8c8c8] outline-none focus:border-[#00e8ff]/50 sm:max-w-[14rem]"
          >
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <label htmlFor="tts-speed" className="sr-only">
            Speed
          </label>
          <select
            id="tts-speed"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="h-9 rounded-md border border-[#00e8ff]/20 bg-black/60 px-2 font-mono text-xs text-[#c8c8c8] outline-none focus:border-[#00e8ff]/50"
          >
            {SPEED_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state !== "idle" && (
        <div className="mt-3">
          <div className="h-1 w-full overflow-hidden rounded-full bg-[#00e8ff]/10">
            <div
              className="h-full rounded-full bg-[#00e8ff]/60 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1.5 font-mono text-[10px] text-[#888] sm:text-xs">
            {state === "paused" ? "Paused" : "Reading..."} &middot; {progress}%
          </p>
        </div>
      )}
    </div>
  );
}
