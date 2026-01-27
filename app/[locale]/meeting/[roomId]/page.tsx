"use client";

import { useToken } from "@livekit/components-react";
import { use, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import LiveRitualRoom from "../LiveRitualRoom"; 

export default function MeetingPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  
  // 1. Unwrap Params using React.use()
  const { roomId } = use(params);

  // 2. Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  const username = user?.fullName || user?.id || "Guest";

  // 3. Fetch Token
  const token = useToken(
    process.env.NEXT_PUBLIC_LIVEKIT_TOKEN_ENDPOINT || "/api/livekit",
    roomId,
    {
      userInfo: {
        identity: username,
        name: username,
      },
    }
  );

  // Debug logging
  useEffect(() => {
    if (roomId) console.log("Room ID loaded:", roomId);
    if (token) console.log("Token received successfully");
  }, [roomId, token]);

  // 4. Loading States
  if (!isLoaded) {
    return <div className="h-screen bg-[#05051a] flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>;
  }

  if (error) {
    return (
      <div className="h-screen bg-[#05051a] flex flex-col items-center justify-center text-white gap-6 p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 mb-2">
          <AlertCircle size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black uppercase tracking-widest">Connection Failed</h2>
          <p className="text-slate-400 text-sm max-w-md">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#E31B23] hover:text-white transition-all active:scale-95"
        >
          <RefreshCw size={14} /> Retry Connection
        </button>
      </div>
    );
  }

  if (token === "" || !token) {
    return (
      <div className="h-screen bg-[#05051a] flex flex-col items-center justify-center text-white gap-4">
        <Loader2 className="animate-spin text-[#E31B23]" />
        <p className="font-serif tracking-widest text-sm uppercase opacity-50">Initializing Secure Space...</p>
        <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Please wait while we establish a secure connection</p>
      </div>
    );
  }

  // 5. Render Custom Room
  return (
    <LiveRitualRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || "wss://visa-app-cluster.livekit.cloud"}
      roomName={roomId}
      bookingId={roomId} 
      onLeave={() => router.push("/booking")}
    />
  );
}