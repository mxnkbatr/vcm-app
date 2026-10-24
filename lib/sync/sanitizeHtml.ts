/**
 * Lightweight HTML sanitize for synced remote content.
 * Allows basic formatting + YouTube iframes only.
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  let out = String(html);

  // Remove scripts / styles / event handlers / dangerous URLs
  out = out.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  out = out.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
  out = out.replace(/\son\w+\s*=\s*(['"]).*?\1/gi, "");
  out = out.replace(/\son\w+\s*=\s*[^\s>]+/gi, "");
  out = out.replace(/(href|src)\s*=\s*(['"])\s*javascript:[^'"]*\2/gi, '$1="#"');

  // Drop non-YouTube iframes; keep YouTube
  out = out.replace(/<iframe\b([^>]*)>([\s\S]*?)<\/iframe>/gi, (_m, attrs: string) => {
    const srcMatch = attrs.match(/\bsrc\s*=\s*(['"])(.*?)\1/i);
    const src = srcMatch?.[2] || "";
    if (/youtube\.com|youtu\.be|youtube-nocookie\.com/i.test(src)) {
      const safeSrc = src.replace(/[<>"']/g, "");
      return `<iframe src="${safeSrc}" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
    }
    return "";
  });

  // Strip remaining iframe open tags without close
  out = out.replace(/<iframe\b[^>]*>/gi, (tag) =>
    /youtube\.com|youtu\.be|youtube-nocookie\.com/i.test(tag) ? tag : ""
  );

  return out.trim();
}
