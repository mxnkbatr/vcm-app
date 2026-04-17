import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import { getAuthUserId } from "@/lib/authHelpers";
import LmsEnrollment from "@/lib/models/LmsEnrollment";
import LmsProgress from "@/lib/models/LmsProgress";
import { UpdateProgressSchema } from "@/lib/modules/lms/lms.schemas";

// POST /api/lms/progress
export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const parsed = UpdateProgressSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { courseId, lessonId, watchedSeconds, completed, updatedAtClient } =
      parsed.data;

    await connectToDB();

    // Must be enrolled to write progress (unless course is free — handled via enrollment as well).
    const enrollment = await LmsEnrollment.findOne({
      userId,
      courseId,
      status: "active",
    }).lean();
    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
    }

    const now = new Date();
    const completedAt = completed ? now : undefined;

    const doc = await LmsProgress.findOneAndUpdate(
      { userId, lessonId },
      {
        $setOnInsert: { userId, courseId, lessonId },
        $set: {
          courseId,
          watchedSeconds,
          ...(completedAt ? { completedAt } : {}),
          ...(updatedAtClient ? { updatedAtClient: new Date(updatedAtClient) } : {}),
        },
      },
      { new: true, upsert: true }
    ).lean();

    return NextResponse.json({ ok: true, progress: doc }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}

