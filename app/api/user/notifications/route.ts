import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import { getAuthUserId } from "@/lib/authHelpers";
import Notification from "@/lib/models/Notification";

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDB();
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

