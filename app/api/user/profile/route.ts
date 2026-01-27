import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";
import Booking from "@/lib/models/Booking";

export async function GET(req: Request) {
  console.log("GET /api/user/profile hit");
  try {
    await connectToDB();
    const clerkUser = await currentUser();

    if (!clerkUser) {
      console.log("No Clerk user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Clerk user ID:", clerkUser.id);
    const [user, bookings] = await Promise.all([
      User.findOne({ clerkId: clerkUser.id }),
      Booking.find({ userId: clerkUser.id }).sort({ createdAt: -1 })
    ]);

    if (!user) {
      console.log("User not found in DB, returning fallback");
      // Return Clerk info as a fallback so the frontend can still show linked account status
      return NextResponse.json({ 
          user: {
              fullName: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "Guest User",
              email: clerkUser.emailAddresses[0]?.emailAddress || "",
              role: "guest",
              profile: null
          },
          activity: [],
          bookings: bookings || [],
          isNewUser: true
      });
    }

    console.log("User found in DB:", user.email);
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