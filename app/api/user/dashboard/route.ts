import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";
import Application from "@/lib/models/Application";
import Event from "@/lib/models/Events";
import Lesson from "@/lib/models/Lesson";
import { getAuthUserId } from "@/lib/authHelpers";
import { withCache } from "@/lib/server-cache";

export const revalidate = 0;

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await withCache(`user-dash:${userId}`, 30_000, async () => {
      await connectToDB();
      const now = new Date();

      const [user, applications, attendedEvents, availableEvents, allLessons] = await Promise.all([
        User.findById(userId)
          .select("fullName email role studentId country step profile phone password affiliation program")
          .lean(),
        Application.find({ userId })
          .select("programId status createdAt")
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
        Event.find({ attendees: userId })
          .select("_id title description date timeString location image category")
          .sort({ date: -1 })
          .limit(5)
          .lean(),
        Event.find({ attendees: { $ne: userId }, status: "upcoming", date: { $gte: now } })
          .select("_id title description date timeString location image category")
          .sort({ date: 1 })
          .limit(6)
          .lean(),
        Lesson.find({ status: "active" })
          .select("_id title description category difficulty attendees imageUrl")
          .sort({ createdAt: -1 })
          .limit(8)
          .lean(),
      ]);

      if (!user) return null;

      const u = user as any;
      return {
        user: {
          _id: u._id,
          fullName: u.fullName,
          email: u.email,
          role: u.role,
          studentId: u.studentId,
          country: u.country,
          step: u.step,
          profile: u.profile || null,
          phone: u.phone || null,
          hasPassword: !!u.password,
          affiliation: u.affiliation || null,
          program: u.program || null,
        },
        applications: applications || [],
        attendedEvents: attendedEvents || [],
        availableEvents: availableEvents || [],
        lessons: (allLessons as any[]).map((lesson) => ({
          ...lesson,
          isUnlocked: lesson.attendees?.some((id: any) => id.toString() === userId),
        })),
      };
    });

    if (!data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(data, {
      status: 200,
      headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=30" },
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
