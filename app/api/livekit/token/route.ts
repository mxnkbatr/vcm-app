import { NextResponse } from "next/server";
import { z } from "zod";
import { createLivekitToken, LivekitRole } from "@/lib/livekit";
import { getAuthSession } from "@/lib/authHelpers";

const QuerySchema = z.object({
  room: z.string().min(1),
  role: z.enum(["instructor", "participant"]).optional(),
});

/**
 * Returns a LiveKit JWT for the current authenticated user.
 *
 * GET /api/livekit/token?room=room_123&role=participant
 */
export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const parsed = QuerySchema.safeParse({
      room: url.searchParams.get("room"),
      role: url.searchParams.get("role") || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Server-enforced role: only admins can request instructor token for now.
    const requestedRole = (parsed.data.role ?? "participant") as LivekitRole;
    const effectiveRole: LivekitRole =
      requestedRole === "instructor" && session.role === "admin"
        ? "instructor"
        : "participant";

    const token = createLivekitToken({
      identity: session.userId,
      name: session.name ?? undefined,
      room: parsed.data.room,
      role: effectiveRole,
    });

    return NextResponse.json({ token, room: parsed.data.room, role: effectiveRole });
  } catch (error) {
    console.error("LiveKit token error:", error);
    return NextResponse.json({ error: "Failed to create token" }, { status: 500 });
  }
}

