"use client";

import { LiveKitRoom, VideoConference, useToken } from "@livekit/components-react";
import "@livekit/components-styles";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function MeetingPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    params.then((p) => setRoomId(p.roomId));
  }, [params]);

  // Handle redirects
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  const username = user?.fullName || user?.id || "Guest";

  // Use the useToken hook to fetch a token from your server
  const token = useToken(
    process.env.NEXT_PUBLIC_LIVEKIT_TOKEN_ENDPOINT || "/api/livekit", 
    roomId, 
    { userInfo: { identity: username, name: username } }
  );

  if (!isLoaded || !roomId) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  if (token === "") {
    return <div className="h-screen flex items-center justify-center">Getting token...</div>;
  }

  return (
    <div className="h-screen w-full bg-slate-900" data-lk-theme="default">
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || "wss://visa-app-cluster.livekit.cloud"} // Defaulting to common structure, but should use env
        connect={true}
        onDisconnected={() => router.push("/booking")}
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
}