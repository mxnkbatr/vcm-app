import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";

export async function GET() {
  try {
    await connectToDB();

    // Fetch all users who have a general manager role
    const generals = await User.find(
      { role: { $in: ['general_and', 'general_edu', 'general_vclub'] } },
      'fullName role _id'
    ).sort({ fullName: 1 });

    return NextResponse.json(generals, { status: 200 });

  } catch (error) {
    console.error("Generals fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch generals" }, { status: 500 });
  }
}
