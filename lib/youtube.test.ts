import { describe, expect, it } from "vitest";
import { extractYouTubeId, youtubeEmbedUrl } from "@/lib/youtube";

describe("extractYouTubeId", () => {
  it("parses watch, short, embed, and bare ids", () => {
    expect(extractYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(
      extractYouTubeId('<iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"></iframe>')
    ).toBe("dQw4w9WgXcQ");
  });

  it("returns null for non-youtube", () => {
    expect(extractYouTubeId("https://vimeo.com/123")).toBeNull();
    expect(extractYouTubeId("")).toBeNull();
  });
});

describe("youtubeEmbedUrl", () => {
  it("uses nocookie host and playsinline", () => {
    const url = youtubeEmbedUrl("dQw4w9WgXcQ", { autoplay: true });
    expect(url).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(url).toContain("playsinline=1");
    expect(url).toContain("autoplay=1");
  });
});
