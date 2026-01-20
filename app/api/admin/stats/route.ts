import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";
import News from "@/lib/models/News";
import Event from "@/lib/models/Events";

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
    const [totalUsers, blogsPublished, pendingBookings] = await Promise.all([
      User.countDocuments({}),
      News.countDocuments({ status: 'published' }),
      Event.countDocuments({ status: 'upcoming' })
    ]);

    return NextResponse.json({
      totalUsers,
      blogsPublished,
      pendingBookings,
      countries: 4 // Placeholder as requested
    });
  } catch (error) {
    console.error("Stats Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
