"use client";

import React from "react";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { X } from "lucide-react";

interface Props {
  token: string;
  serverUrl: string;
  roomName: string;
  onLeave: () => void;
  isMonk?: boolean;
  bookingId?: string; // New prop for auto-cleanup
}

export default function LiveRitualRoom({ token, serverUrl, roomName, onLeave, bookingId }: Props) {

  // --- TIMER LOGIC (60 MIN LIMIT) ---
  const [timeLeft, setTimeLeft] = React.useState(60 * 60); 

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-complete booking to delete chat history
          if (bookingId && bookingId.length < 30) { // Only attempt if it looks like a MongoDB ID
            fetch(`/api/bookings/${bookingId}/complete`, { method: 'POST' })
              .then(() => console.log('Session auto-completed'))
              .catch(err => console.error('Auto-complete failed:', err));
          }
          onLeave(); // Close the room
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onLeave, bookingId]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const timerColor = timeLeft < 60 ? "text-red-500 animate-pulse" : timeLeft < 300 ? "text-amber-500" : "text-white";

  // Clean room name for display
  const displayRoomName = roomName.startsWith('booking_') ? "CONSULTATION SPACE" : roomName;

  return (
    <div className="fixed inset-0 z-50 bg-[#05051a] flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-2 md:p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none gap-2">
        <div className="pointer-events-auto flex flex-col">
          <h2 className="text-white font-serif text-sm md:text-xl tracking-widest leading-none">VISA SPACE</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-cyan-400 text-[10px] md:text-xs uppercase tracking-[0.2em] font-black">
              {displayRoomName}
            </p>
            <div className={`text-[10px] md:text-xs font-mono font-bold px-1.5 py-0.5 rounded border border-white/10 bg-black/40 ${timerColor}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 pointer-events-auto">
          <button
            onClick={onLeave}
            className="bg-red-500/20 hover:bg-red-500/40 text-red-200 px-3 md:px-5 py-1.5 md:py-2 rounded-full border border-red-500/30 backdrop-blur-md flex items-center gap-1.5 md:gap-2 transition-all text-[10px] md:text-xs font-black uppercase tracking-widest active:scale-95"
          >
            <X size={14} /> Leave
          </button>
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 relative">
          <LiveKitRoom
            video={false}
            audio={false}
            token={token}
            serverUrl={serverUrl}
            data-lk-theme="default"
            style={{ height: '100%' }}
            onDisconnected={onLeave}
            connect={true}
          >
            <VideoConference />
            <RoomAudioRenderer />
          </LiveKitRoom>
        </div>
      </div>
    </div>
  );
}