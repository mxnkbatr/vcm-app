import { AccessToken } from "livekit-server-sdk";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    const { searchParams } = new URL(req.url);
    const room = searchParams.get("room");
    const username = searchParams.get("username") || user?.firstName || "Guest";

    if (!room) {
      return NextResponse.json(
        { error: 'Missing "room" query parameter' },
        { status: 400 }
      );
    }
    
    // Check if keys are available
    if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
       return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      );
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    
    // Create token
    const at = new AccessToken(apiKey, apiSecret, {
      identity: username,
      // For simplicity, using room name as identity prefix could avoid collisions but username is fine for now
    });

    at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });

    const token = await at.toJwt();

    return NextResponse.json({ token });
  } catch (error) {
    console.error("LiveKit token error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}