import { NextResponse } from "next/server";

import { connectToDB } from "@/lib/db";
import Application from "@/lib/models/Application";
import { getAuthUserId } from "@/lib/authHelpers";

export async function GET(req: Request) {
  try {
    await connectToDB();
    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applications = await Application.find({ userId: userId }).sort({ createdAt: -1 });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("User applications fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}