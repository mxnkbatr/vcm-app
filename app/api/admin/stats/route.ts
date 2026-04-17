import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";
import News from "@/lib/models/News";
import Event from "@/lib/models/Events";
import Application from "@/lib/models/Application";
import { withAdminAuth } from "@/lib/adminAuth";

export const GET = withAdminAuth(async () => {
  await connectToDB();
  try {
    const [totalUsers, blogsPublished, pendingApplications, studentsCount, adminsCount, guestsCount] = await Promise.all([
      User.countDocuments({}),
      News.countDocuments({ status: 'published' }),
      Application.countDocuments({ status: 'pending' }),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'guest' })
    ]);

    return NextResponse.json({
      totalUsers,
      blogsPublished,
      pendingApplications,
      studentsCount,
      adminsCount,
      guestsCount,
      countries: 4
    });
  } catch (error) {
    console.error("Stats Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
});
