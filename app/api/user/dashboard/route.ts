import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";
import Application from "@/lib/models/Application";
import Event from "@/lib/models/Events";
import Lesson from "@/lib/models/Lesson";
import Purchase from "@/lib/models/Purchase";
import LmsEnrollment from "@/lib/models/LmsEnrollment";
import LmsCourse from "@/lib/models/LmsCourse";
import LmsLesson from "@/lib/models/LmsLesson";
import LmsProgress from "@/lib/models/LmsProgress";
import LmsCertificate from "@/lib/models/LmsCertificate";
import { getAuthUserId } from "@/lib/authHelpers";
import { withCache } from "@/lib/server-cache";

export const revalidate = 0;

function normalizePhone(input: unknown): string {
  const raw = String(input ?? "").trim();
  return raw.replace(/[^\d+]/g, "");
}

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
      const phoneCandidates = [
        u.phone,
        u?.profile?.phone,
        u?.profile?.mobile,
      ]
        .map(normalizePhone)
        .filter(Boolean);

      const purchases = phoneCandidates.length
        ? await Purchase.find({ phoneNumber: { $in: phoneCandidates } })
            .populate("itemId", "name price image category")
            .sort({ createdAt: -1 })
            .limit(20)
            .lean()
        : [];

      const enrolledLessons = await Lesson.find({ attendees: userId })
        .select("_id title description category difficulty imageUrl createdAt")
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      const enrollments = await LmsEnrollment.find({ userId, status: "active" })
        .sort({ createdAt: -1 })
        .lean();
      const courseIds = enrollments.map((e) => e.courseId);
      const [lmsCourses, lmsLessons] = await Promise.all([
        LmsCourse.find({ _id: { $in: courseIds } })
          .select("slug title description thumbnailUrl")
          .lean(),
        LmsLesson.find({ courseId: { $in: courseIds }, status: "published" })
          .select("_id courseId")
          .lean(),
      ]);
      const lessonIds = lmsLessons.map((l) => l._id);
      const progresses = await LmsProgress.find({
        userId,
        lessonId: { $in: lessonIds },
        completedAt: { $exists: true },
      })
        .select("courseId completedAt")
        .lean();

      const totalByCourse = new Map<string, number>();
      const completedByCourse = new Map<string, number>();
      for (const l of lmsLessons) {
        const cid = l.courseId.toString();
        totalByCourse.set(cid, (totalByCourse.get(cid) ?? 0) + 1);
      }
      for (const p of progresses) {
        const cid = p.courseId.toString();
        completedByCourse.set(cid, (completedByCourse.get(cid) ?? 0) + 1);
      }

      const lmsEnrollments = lmsCourses.map((c) => {
        const cid = c._id.toString();
        const total = totalByCourse.get(cid) ?? 0;
        const completed = completedByCourse.get(cid) ?? 0;
        const enrollment = enrollments.find((e) => e.courseId.toString() === cid);
        return {
          courseId: cid,
          slug: c.slug,
          title: c.title,
          thumbnailUrl: c.thumbnailUrl,
          enrolledAt: enrollment?.createdAt,
          progressPct: total === 0 ? 0 : Math.round((completed / total) * 100),
          completedLessons: completed,
          totalLessons: total,
        };
      });

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
        purchases: purchases || [],
        enrolledLessons: enrolledLessons || [],
        lmsEnrollments: lmsEnrollments || [],
        lessons: (allLessons as any[]).map((lesson) => ({
          ...lesson,
          isUnlocked: lesson.attendees?.some((id: any) => id.toString() === userId),
        })),
        studentLms: await (async () => {
          const enrollments = await LmsEnrollment.find({ userId, status: "active" })
            .sort({ createdAt: -1 })
            .lean();
          const courseIds = enrollments.map((e) => e.courseId);
          const [courses, certificates, lessonsForStudent] = await Promise.all([
            LmsCourse.find({ _id: { $in: courseIds } }).lean(),
            LmsCertificate.find({ userId })
              .select("_id courseId certNumber pdfUrl issuedAt")
              .lean(),
            LmsLesson.find({ courseId: { $in: courseIds }, status: "published" })
              .select({ _id: 1, courseId: 1 })
              .lean(),
          ]);
          const lessonIds = lessonsForStudent.map((l) => l._id);
          const progresses = await LmsProgress.find({ userId, lessonId: { $in: lessonIds } })
            .select({ lessonId: 1, courseId: 1, completedAt: 1 })
            .lean();
          const completedByCourse = new Map<string, number>();
          const totalByCourse = new Map<string, number>();
          for (const l of lessonsForStudent) {
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
        })(),
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
