import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import { getAuthUserId } from "@/lib/authHelpers";
import LmsEnrollment from "@/lib/models/LmsEnrollment";
import LmsCourse from "@/lib/models/LmsCourse";
import LmsLesson from "@/lib/models/LmsLesson";
import LmsProgress from "@/lib/models/LmsProgress";
import LmsCertificate from "@/lib/models/LmsCertificate";
import { withCache, invalidate } from "@/lib/server-cache";

export const revalidate = 0;

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await withCache(`student-dash:${userId}`, 30_000, async () => {
      await connectToDB();

      const enrollments = await LmsEnrollment.find({ userId, status: "active" })
        .sort({ createdAt: -1 })
        .lean();

      const courseIds = enrollments.map((e) => e.courseId);

      const [courses, certificates, lessons] = await Promise.all([
        LmsCourse.find({ _id: { $in: courseIds } }).lean(),
        LmsCertificate.find({ userId }).select("_id courseId certNumber pdfUrl issuedAt").lean(),
        LmsLesson.find({ courseId: { $in: courseIds }, status: "published" })
          .select({ _id: 1, courseId: 1 })
          .lean(),
      ]);

      const lessonIds = lessons.map((l) => l._id);
      const progresses = await LmsProgress.find({ userId, lessonId: { $in: lessonIds } })
        .select({ lessonId: 1, courseId: 1, completedAt: 1 })
        .lean();

      const completedByCourse = new Map<string, number>();
      const totalByCourse = new Map<string, number>();

      for (const l of lessons) {
        const cid = l.courseId.toString();
        totalByCourse.set(cid, (totalByCourse.get(cid) ?? 0) + 1);
      }
      for (const p of progresses) {
        if (!p.completedAt) continue;
        const cid = p.courseId.toString();
        completedByCourse.set(cid, (completedByCourse.get(cid) ?? 0) + 1);
      }

      const courseSummaries = courses.map((c) => {
        const cid = c._id.toString();
        const total = totalByCourse.get(cid) ?? 0;
        const completed = completedByCourse.get(cid) ?? 0;
        return {
          course: c,
          progressPct: total === 0 ? 0 : Math.round((completed / total) * 100),
          completedLessons: completed,
          totalLessons: total,
        };
      });

      return { enrollments, courses: courseSummaries, certificates };
    });

    return NextResponse.json(data, {
      headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=30" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
