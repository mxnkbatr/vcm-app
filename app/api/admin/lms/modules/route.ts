import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";
import { connectToDB } from "@/lib/db";
import LmsModule from "@/lib/models/LmsModule";
import { z } from "zod";
import { logAdminAction } from "@/lib/audit";

const ModuleSchema = z.object({
  id: z.string().optional(),
  courseId: z.string().min(1),
  title: z.object({ en: z.string().min(1), mn: z.string().min(1), de: z.string().optional() }),
  order: z.number().int().optional(),
});

export const GET = withAdminAuth(async (req: Request) => {
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  if (!courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }
  const items = await LmsModule.find({ courseId }).sort({ order: 1, updatedAt: -1 }).lean();
  return NextResponse.json(items);
});

export const POST = withAdminAuth(async (req: Request) => {
  await connectToDB();
  const json = await req.json();
  const parsed = ModuleSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }
  const created = await LmsModule.create({
    courseId: parsed.data.courseId,
    title: { ...parsed.data.title, de: parsed.data.title.de ?? "" },
    order: parsed.data.order ?? 0,
  });
  await logAdminAction({
    action: "admin.lms.module.create",
    targetType: "LmsModule",
    targetId: created._id.toString(),
    meta: { courseId: parsed.data.courseId, order: created.order },
  });
  return NextResponse.json(created, { status: 201 });
});

export const PUT = withAdminAuth(async (req: Request) => {
  await connectToDB();
  const json = await req.json();
  const parsed = ModuleSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }
  const id = parsed.data.id;
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const updated = await LmsModule.findByIdAndUpdate(
    id,
    {
      $set: {
        title: { ...parsed.data.title, de: parsed.data.title.de ?? "" },
        order: parsed.data.order ?? 0,
      },
    },
    { new: true }
  );
  if (!updated) return NextResponse.json({ error: "Module not found" }, { status: 404 });

  await logAdminAction({
    action: "admin.lms.module.update",
    targetType: "LmsModule",
    targetId: String(id),
  });
  return NextResponse.json(updated);
});

export const DELETE = withAdminAuth(async (req: Request) => {
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await LmsModule.findByIdAndDelete(id);
  await logAdminAction({
    action: "admin.lms.module.delete",
    targetType: "LmsModule",
    targetId: String(id),
  });
  return NextResponse.json({ ok: true });
});

