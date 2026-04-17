import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import LmsCourse from "@/lib/models/LmsCourse";
import { withCache } from "@/lib/server-cache";

export const revalidate = 0;

export async function GET() {
  try {
    const courses = await withCache("lms:courses", 120_000, async () => {
      await connectToDB();
      return LmsCourse.find({ status: "published" })
        .select("_id title description image price category level instructor totalLessons createdAt")
        .sort({ createdAt: -1 })
        .lean();
    });

    return NextResponse.json(courses, {
      headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}
