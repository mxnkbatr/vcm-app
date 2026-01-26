import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";
import News from "@/lib/models/News";
import Event from "@/lib/models/Events";
import Application from "@/lib/models/Application";

async function isAdmin() {
  const clerkUser = await currentUser();

  if (!clerkUser) return false;

  // 1. Check metadata directly (Fastest)
  if (clerkUser.publicMetadata?.role === 'admin') {
    return true;
  }

  // 2. Fallback: Check MongoDB (Source of Truth)
  await connectToDB();
  const dbUser = await User.findOne({ clerkId: clerkUser.id });
  return dbUser?.role === 'admin';
}

export async function GET() {
  if (!await isAdmin()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
}
