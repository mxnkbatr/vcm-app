import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";

export async function GET(req: Request) {
  try {
    await connectToDB();
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ clerkId: clerkUser.id });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Mock activity for now if empty
    const activity = user.activityHistory || [];

    return NextResponse.json({ 
        user: {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            studentId: user.studentId,
            country: user.country,
            step: user.step,
            badges: user.badges || [],
            points: user.points || 0
        },
        activity 
    });

  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}