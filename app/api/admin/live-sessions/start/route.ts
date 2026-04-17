import { NextResponse } from "next/server";
import { z } from "zod";
import { withAdminAuth } from "@/lib/adminAuth";
import { connectToDB } from "@/lib/db";
import LiveSession from "@/lib/models/LiveSession";
import User from "@/lib/models/User";
import Notification from "@/lib/models/Notification";

const BodySchema = z.object({
  room: z.string().min(1),
});

export const POST = withAdminAuth(async (req: Request) => {
  try {
    await connectToDB();

    const body = await req.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const live = await LiveSession.findOne({ room: parsed.data.room });
    if (!live) return NextResponse.json({ error: "Not found" }, { status: 404 });

    live.status = "live";
    await live.save();

    // Create inbox notifications for users who opted-in.
    const users = await User.find({ "settings.notificationsEnabled": true }).select("_id");
    const now = new Date();
    const docs = users.map((u: any) => ({
      userId: String(u._id),
      type: "live_started",
      title: "Live started",
      body: live.title,
      payload: { room: live.room },
      createdAt: now,
      updatedAt: now,
    }));

    if (docs.length) {
      await Notification.insertMany(docs, { ordered: false });
    }

    // Push notification fan-out will plug in here using user.deviceTokens.

    return NextResponse.json({ ok: true, room: live.room }, { status: 200 });
  } catch (error) {
    console.error("Start live session error:", error);
    return NextResponse.json({ error: "Failed to start live session" }, { status: 500 });
  }
});

