import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import { getAuthUserId } from "@/lib/authHelpers";
import LmsCourse from "@/lib/models/LmsCourse";
import LmsEnrollment from "@/lib/models/LmsEnrollment";
import { EnrollSchema } from "@/lib/modules/lms/lms.schemas";

// POST /api/lms/enroll
// Note: For paid courses, you should call this only after payment is confirmed.
export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const parsed = EnrollSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectToDB();
    const course = await LmsCourse.findById(parsed.data.courseId);
    if (!course || course.status !== "published") {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const access = course.isFree ? "free" : "paid";

    const enrollment = await LmsEnrollment.findOneAndUpdate(
      { userId, courseId: course._id },
      {
        $setOnInsert: {
          userId,
          courseId: course._id,
          access,
          status: "active",
          startedAt: new Date(),
        },
        $set: { status: "active" },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ enrolled: true, enrollment }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to enroll" }, { status: 500 });
  }
}

