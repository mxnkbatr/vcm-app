import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";
import Booking from "@/lib/models/Booking";
import { getAuthUserId } from "@/lib/authHelpers";

export async function GET(req: Request) {
  console.log("GET /api/user/profile hit");
  try {
    await connectToDB();
    const userId = await getAuthUserId();

    if (!userId) {
      console.log("No authenticated user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("User ID:", userId);
    const [user, bookings] = await Promise.all([
      User.findById(userId),
      Booking.find({ userId }).sort({ createdAt: -1 })
    ]);

    if (!user) {
      console.log("User not found in DB");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("User found in DB:", user.email);
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
            points: user.points || 0,
            profile: user.profile || null
        },
        activity,
        bookings: bookings || []
    });

  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}