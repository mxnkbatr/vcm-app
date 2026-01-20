import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/db";
import Application from "@/lib/models/Application";

export async function GET(req: Request) {
  try {
    await connectToDB();
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applications = await Application.find({ userId: clerkUser.id }).sort({ createdAt: -1 });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("User applications fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}