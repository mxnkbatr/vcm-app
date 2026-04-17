import { AccessToken, VideoGrant } from "livekit-server-sdk";
import { env } from "@/lib/env";

export type LivekitRole = "instructor" | "participant";

function requireLivekitConfig() {
  if (!env.LIVEKIT_API_KEY || !env.LIVEKIT_API_SECRET) {
    throw new Error("Missing LIVEKIT_API_KEY/LIVEKIT_API_SECRET");
  }
  return {
    apiKey: env.LIVEKIT_API_KEY,
    apiSecret: env.LIVEKIT_API_SECRET,
  };
}

export function createLivekitToken(params: {
  identity: string;
  name?: string;
  room: string;
  role: LivekitRole;
}) {
  const { apiKey, apiSecret } = requireLivekitConfig();
  const { identity, name, room, role } = params;

  const grants: VideoGrant = {
    room,
    roomJoin: true,
    canPublish: role === "instructor",
    canSubscribe: true,
    canPublishData: true,
  };

  const at = new AccessToken(apiKey, apiSecret, { identity, name });
  at.addGrant(grants);
  // 2 hours: enough for most live classes; refresh by re-fetching token if needed.
  at.ttl = 2 * 60 * 60;

  return at.toJwt();
}

