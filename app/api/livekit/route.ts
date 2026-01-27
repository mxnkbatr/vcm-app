import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic'; // <--- ADD THIS AT THE TOP
export async function GET(req: NextRequest) {
  // 1. Get query parameters - useToken components send 'roomName' and 'identity'
  const room = req.nextUrl.searchParams.get("roomName") || req.nextUrl.searchParams.get("room");
  const username = req.nextUrl.searchParams.get("identity") || req.nextUrl.searchParams.get("username"); 

  // 2. Validate parameters
  if (!room) {
    return NextResponse.json({ error: 'Missing "roomName" query parameter' }, { status: 400 });
  }
  if (!username) {
    return NextResponse.json({ error: 'Missing "identity" query parameter' }, { status: 400 });
  }

  // 3. Check Environment Variables
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  try {
    // 4. Create Token
    const at = new AccessToken(apiKey, apiSecret, {
      identity: username,
      // Optional: Add a display name if sent by client
      name: req.nextUrl.searchParams.get("name") || username, 
    });

    at.addGrant({
      roomJoin: true,
      room: room,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true, // Needed for chat
    });

    // 5. Return Token
    const jwt = await at.toJwt();
    return NextResponse.json({ accessToken: jwt }); // useToken expects 'token' or 'accessToken'
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}