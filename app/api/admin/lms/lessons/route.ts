import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";
import { connectToDB } from "@/lib/db";
import LmsLesson from "@/lib/models/LmsLesson";
import { z } from "zod";
import { logAdminAction } from "@/lib/audit";

const LessonSchema = z.object({
  id: z.string().optional(),
  courseId: z.string().min(1),
  moduleId: z.string().min(1),
  title: z.object({ en: z.string().min(1), mn: z.string().min(1), de: z.string().optional() }),
  description: z.object({ en: z.string().optional(), mn: z.string().optional(), de: z.string().optional() }).optional(),
  order: z.number().int().optional(),
  videoProvider: z.enum(["cloudinary", "mux", "youtube", "custom"]).optional(),
  videoAssetId: z.string().optional(),
  durationSeconds: z.number().int().optional(),
  isFreePreview: z.boolean().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

export const GET = withAdminAuth(async (req: Request) => {
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const moduleId = searchParams.get("moduleId");
  if (!courseId) return NextResponse.json({ error: "courseId is required" }, { status: 400 });

  const q: any = { courseId };
  if (moduleId) q.moduleId = moduleId;
  const items = await LmsLesson.find(q).sort({ order: 1, updatedAt: -1 }).lean();
  return NextResponse.json(items);
});

export const POST = withAdminAuth(async (req: Request) => {
  await connectToDB();
  const json = await req.json();
  const parsed = LessonSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const created = await LmsLesson.create({
    courseId: parsed.data.courseId,
    moduleId: parsed.data.moduleId,
    title: { ...parsed.data.title, de: parsed.data.title.de ?? "" },
    description: {
      en: parsed.data.description?.en ?? "",
      mn: parsed.data.description?.mn ?? "",
      de: parsed.data.description?.de ?? "",
    },
    order: parsed.data.order ?? 0,
    videoProvider: parsed.data.videoProvider ?? "custom",
    videoAssetId: parsed.data.videoAssetId ?? "",
    durationSeconds: parsed.data.durationSeconds ?? 0,
    isFreePreview: parsed.data.isFreePreview ?? false,
    status: parsed.data.status ?? "draft",
  });

  await logAdminAction({
    action: "admin.lms.lesson.create",
    targetType: "LmsLesson",
    targetId: created._id.toString(),
    meta: { courseId: parsed.data.courseId, moduleId: parsed.data.moduleId, status: created.status },
  });

  return NextResponse.json(created, { status: 201 });
});

export const PUT = withAdminAuth(async (req: Request) => {
  await connectToDB();
  const json = await req.json();
  const parsed = LessonSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }
  const id = parsed.data.id;
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const updated = await LmsLesson.findByIdAndUpdate(
    id,
    {
      $set: {
        title: { ...parsed.data.title, de: parsed.data.title.de ?? "" },
        description: {
          en: parsed.data.description?.en ?? "",
          mn: parsed.data.description?.mn ?? "",
          de: parsed.data.description?.de ?? "",
        },
        order: parsed.data.order ?? 0,
        videoProvider: parsed.data.videoProvider ?? "custom",
        videoAssetId: parsed.data.videoAssetId ?? "",
        durationSeconds: parsed.data.durationSeconds ?? 0,
        isFreePreview: parsed.data.isFreePreview ?? false,
        status: parsed.data.status ?? "draft",
      },
    },
    { new: true }
  );
  if (!updated) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  await logAdminAction({
    action: "admin.lms.lesson.update",
    targetType: "LmsLesson",
    targetId: String(id),
  });

  return NextResponse.json(updated);
});

export const DELETE = withAdminAuth(async (req: Request) => {
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await LmsLesson.findByIdAndDelete(id);
  await logAdminAction({
    action: "admin.lms.lesson.delete",
    targetType: "LmsLesson",
    targetId: String(id),
  });
  return NextResponse.json({ ok: true });
});

