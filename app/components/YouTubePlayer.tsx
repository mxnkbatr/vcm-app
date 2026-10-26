"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { youtubeEmbedUrl, youtubeThumbUrl } from "@/lib/youtube";

type YouTubePlayerProps = {
  videoId: string;
  title?: string;
  className?: string;
  /** Start with iframe (no tap-to-play). Default: lite thumbnail. */
  eager?: boolean;
};

/** Native-feel in-app YouTube player — poster → privacy embed. */
export default function YouTubePlayer({
  videoId,
  title = "Видео",
  className = "",
  eager = false,
}: YouTubePlayerProps) {
  const [playing, setPlaying] = useState(eager);
  if (!videoId) return null;

  return (
    <figure className={`yt-player ${playing ? "is-playing" : ""} ${className}`.trim()}>
      <div className="yt-player__stage">
        {playing ? (
          <iframe
            className="yt-player__frame"
            src={youtubeEmbedUrl(videoId, { autoplay: !eager })}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            type="button"
            className="yt-player__poster press"
            onClick={() => setPlaying(true)}
            aria-label={`${title} тоглуулах`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="yt-player__thumb"
              src={youtubeThumbUrl(videoId)}
              alt=""
              loading="lazy"
              decoding="async"
            />
            <span className="yt-player__shade" aria-hidden />
            <span className="yt-player__ring" aria-hidden>
              <span className="yt-player__play">
                <Play size={26} fill="currentColor" strokeWidth={0} />
              </span>
            </span>
            <span className="yt-player__badge" aria-hidden>
              Видео
            </span>
          </button>
        )}
      </div>
      {title && title !== "Видео" && title !== "YouTube видео" ? (
        <figcaption className="yt-player__caption">{title}</figcaption>
      ) : null}
    </figure>
  );
}
