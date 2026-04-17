import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import LmsCourse from "@/lib/models/LmsCourse";
import LmsModule from "@/lib/models/LmsModule";
import LmsLesson from "@/lib/models/LmsLesson";
import LmsEnrollment from "@/lib/models/LmsEnrollment";
import LmsProgress from "@/lib/models/LmsProgress";
import { getAuthUserId } from "@/lib/authHelpers";
import { CACHE_TIMES, createCacheHeaders } from "@/lib/cache-config";

export const revalidate = 60;

// GET /api/lms/courses/:slug
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await connectToDB();

    const course = await LmsCourse.findOne({ slug, status: "published" }).lean();
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const userId = await getAuthUserId();
    const enrollment = userId
      ? await LmsEnrollment.findOne({ userId, courseId: course._id, status: "active" }).lean()
      : null;

    const modules = await LmsModule.find({ courseId: course._id })
      .sort({ order: 1 })
      .lean();

    const lessonsQuery: any = { courseId: course._id, status: "published" };
    if (!enrollment && !course.isFree) {
      lessonsQuery.isFreePreview = true;
    }

    const lessons = await LmsLesson.find(lessonsQuery)
      .sort({ order: 1 })
      .lean();

    let progressByLesson: Record<
      string,
      { watchedSeconds: number; completedAt?: string; updatedAtClient?: string }
    > = {};
    let lastLessonId: string | null = null;

    if (userId && (!!enrollment || !!course.isFree)) {
      const progresses = await LmsProgress.find({ userId, courseId: course._id })
        .select({ lessonId: 1, watchedSeconds: 1, completedAt: 1, updatedAtClient: 1, updatedAt: 1 })
        .lean();

      let last: any = null;
      for (const p of progresses) {
        const id = p.lessonId.toString();
        progressByLesson[id] = {
          watchedSeconds: p.watchedSeconds ?? 0,
          completedAt: p.completedAt ? new Date(p.completedAt).toISOString() : undefined,
          updatedAtClient: p.updatedAtClient ? new Date(p.updatedAtClient).toISOString() : undefined,
        };

        const t = p.updatedAtClient ? new Date(p.updatedAtClient).getTime() : new Date(p.updatedAt).getTime();
        const lastT = last?.__t ?? -1;
        if (t > lastT) {
          last = { __t: t, lessonId: id };
        }
      }
      lastLessonId = last?.lessonId ?? null;
    }

    return NextResponse.json(
      {
        course,
        modules,
        lessons,
        enrolled: !!enrollment || !!course.isFree,
        progressByLesson,
        lastLessonId,
      },
      { headers: createCacheHeaders(CACHE_TIMES.dynamic) }
    );
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 });
  }
}

