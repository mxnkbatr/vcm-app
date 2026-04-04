import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";
import Booking from "@/lib/models/Booking";
import Application from "@/lib/models/Application";
import { getAuthUserId } from "@/lib/authHelpers";

export async function GET(req: Request) {
  try {
    await connectToDB();

    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch User, Bookings, Applications in parallel
    const [user, bookings, applications] = await Promise.all([
      User.findById(userId),
      Booking.find({ userId }).sort({ createdAt: -1 }),
      Application.find({ userId }).sort({ createdAt: -1 })
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

        const dashboardData = {
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
                profile: user.profile || null,
                phone: user.phone || null,
                hasPassword: !!user.password,
                affiliation: user.affiliation || null,
            },
        activity: user.activityHistory || [],
        bookings: bookings || [],
        applications: applications || []
    };

    return NextResponse.json(dashboardData, { status: 200 });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}