import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import LmsCourse from "@/lib/models/LmsCourse";
import LmsLesson from "@/lib/models/LmsLesson";
import { withCache } from "@/lib/server-cache";

export async function GET() {
  try {
    const courses = await withCache("lms:courses:v2", 120_000, async () => {
      await connectToDB();
      const list = await LmsCourse.find({ status: "published" })
        .select("_id slug title description thumbnailUrl price isFree currency status tags createdAt")
        .sort({ createdAt: -1 })
        .lean();

      const ids = list.map((c: { _id: unknown }) => c._id);
      const counts =
        ids.length === 0
          ? []
          : await LmsLesson.aggregate<{ _id: unknown; n: number }>([
              { $match: { courseId: { $in: ids }, status: { $ne: "archived" } } },
              { $group: { _id: "$courseId", n: { $sum: 1 } } },
            ]);

      const byId = new Map(counts.map((row) => [String(row._id), row.n]));
      return list.map((c: { _id: unknown }) => ({
        ...c,
        lessonCount: byId.get(String(c._id)) ?? 0,
      }));
    });

    return NextResponse.json(courses, {
      headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}
