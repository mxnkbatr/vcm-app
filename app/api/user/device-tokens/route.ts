import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";
import { getAuthUserId } from "@/lib/authHelpers";

const UpsertSchema = z.object({
  token: z.string().min(10),
  platform: z.enum(["ios", "android", "web"]),
});

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = UpsertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectToDB();

    // Upsert token entry and bump lastSeenAt.
    const { token, platform } = parsed.data;
    const now = new Date();

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const existing = (user.deviceTokens || []).find((t: any) => t.token === token);
    if (existing) {
      existing.platform = platform;
      existing.lastSeenAt = now;
    } else {
      user.deviceTokens = [
        ...(user.deviceTokens || []),
        { token, platform, createdAt: now, lastSeenAt: now },
      ];
    }

    await user.save();

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Device token upsert error:", error);
    return NextResponse.json({ error: "Failed to save device token" }, { status: 500 });
  }
}

