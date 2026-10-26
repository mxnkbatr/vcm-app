/** Extract a YouTube video id from common URL / iframe forms. */
export function extractYouTubeId(input: string | null | undefined): string | null {
  if (!input) return null;
  const s = String(input).trim();
  if (!s) return null;

  // Bare 11-char id
  if (/^[\w-]{11}$/.test(s)) return s;

  const patterns = [
    /(?:youtube(?:-nocookie)?\.com\/(?:embed|shorts|live)\/)([\w-]{11})/i,
    /(?:youtube(?:-nocookie)?\.com\/watch\?(?:[^#]*&)?v=)([\w-]{11})/i,
    /(?:youtu\.be\/)([\w-]{11})/i,
    /(?:youtube\.com\/v\/)([\w-]{11})/i,
  ];

  for (const re of patterns) {
    const m = s.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

export function youtubeEmbedUrl(videoId: string, opts?: { autoplay?: boolean }) {
  const q = new URLSearchParams({
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
  });
  if (opts?.autoplay) q.set("autoplay", "1");
  return `https://www.youtube-nocookie.com/embed/${videoId}?${q.toString()}`;
}

export function youtubeThumbUrl(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}
