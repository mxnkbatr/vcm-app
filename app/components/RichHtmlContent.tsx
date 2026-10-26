"use client";

import { useMemo, type CSSProperties } from "react";
import YouTubePlayer from "@/app/components/YouTubePlayer";
import { extractYouTubeId } from "@/lib/youtube";

type Part =
  | { type: "html"; html: string }
  | { type: "youtube"; id: string };

function splitRichHtml(html: string): Part[] {
  if (!html) return [];
  const parts: Part[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  const re = /<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi;

  while ((match = re.exec(html))) {
    if (match.index > last) {
      parts.push({ type: "html", html: html.slice(last, match.index) });
    }
    const id = extractYouTubeId(match[0]);
    if (id) parts.push({ type: "youtube", id });
    last = match.index + match[0].length;
  }

  if (last < html.length) {
    parts.push({ type: "html", html: html.slice(last) });
  }

  return parts.filter((p) => p.type === "youtube" || p.html.trim().length > 0);
}

/** Put videos first for a native media-detail feel. */
function hoistMedia(parts: Part[]): Part[] {
  const videos = parts.filter((p): p is Extract<Part, { type: "youtube" }> => p.type === "youtube");
  const rest = parts.filter((p) => p.type !== "youtube");
  // de-dupe ids while preserving order
  const seen = new Set<string>();
  const unique = videos.filter((v) => {
    if (seen.has(v.id)) return false;
    seen.add(v.id);
    return true;
  });
  return [...unique, ...rest];
}

type RichHtmlContentProps = {
  html: string;
  className?: string;
  style?: CSSProperties;
  /** Lift YouTube embeds above body copy (default true). */
  hoistVideos?: boolean;
};

/** Renders sanitized HTML and swaps YouTube iframes for the in-app player. */
export default function RichHtmlContent({
  html,
  className,
  style,
  hoistVideos = true,
}: RichHtmlContentProps) {
  const parts = useMemo(() => {
    const raw = splitRichHtml(html || "");
    return hoistVideos ? hoistMedia(raw) : raw;
  }, [html, hoistVideos]);

  if (!parts.length) return null;

  return (
    <div className={`rich-html app-article ${className ?? ""}`.trim()} style={style}>
      {parts.map((part, i) =>
        part.type === "youtube" ? (
          <YouTubePlayer key={`yt-${part.id}-${i}`} videoId={part.id} />
        ) : (
          <div
            key={`html-${i}`}
            className="app-article__body"
            dangerouslySetInnerHTML={{ __html: part.html }}
          />
        )
      )}
    </div>
  );
}
