import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDB } from "@/lib/db";
import { getAuthUserId } from "@/lib/authHelpers";
import Notification from "@/lib/models/Notification";

const BodySchema = z.object({
  id: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectToDB();
    const updated = await Notification.findOneAndUpdate(
      { _id: parsed.data.id, userId },
      { $set: { readAt: new Date() } },
      { new: true }
    );

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ notification: updated }, { status: 200 });
  } catch (error) {
    console.error("Read notification error:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}

