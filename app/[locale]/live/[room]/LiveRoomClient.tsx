"use client";

import "@livekit/components-styles";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import { useEffect, useMemo, useState } from "react";

type Props = {
  room: string;
};

export default function LiveRoomClient({ room }: Props) {
  const livekitUrl = useMemo(() => process.env.NEXT_PUBLIC_LIVEKIT_URL, []);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);
      setToken(null);
      try {
        const res = await fetch(`/api/livekit/token?room=${encodeURIComponent(room)}`, {
          method: "GET",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to fetch token");
        if (!cancelled) setToken(data.token);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to join live");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [room]);

  if (!livekitUrl) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-lg font-semibold">Live is not configured</div>
          <p className="mt-2 text-sm text-neutral-600">
            Missing <code className="rounded bg-neutral-100 px-1">NEXT_PUBLIC_LIVEKIT_URL</code>.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-lg font-semibold">Could not join live</div>
          <p className="mt-2 text-sm text-neutral-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-lg font-semibold">Joining…</div>
          <p className="mt-2 text-sm text-neutral-600">Preparing your live session.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-3 md:p-6">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-xs text-neutral-500">Room</div>
          <div className="font-mono text-sm">{room}</div>
        </div>
        <div className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
          LIVE
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <LiveKitRoom
          token={token}
          serverUrl={livekitUrl}
          data-lk-theme="default"
          connect
          audio
          video
        >
          <VideoConference />
        </LiveKitRoom>
      </div>
    </div>
  );
}

