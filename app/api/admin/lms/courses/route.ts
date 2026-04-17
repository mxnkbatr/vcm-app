import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";
import { connectToDB } from "@/lib/db";
import LmsCourse from "@/lib/models/LmsCourse";
import { z } from "zod";
import { logAdminAction } from "@/lib/audit";

const CourseSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(2),
  title: z.object({ en: z.string().min(1), mn: z.string().min(1), de: z.string().optional() }),
  description: z.object({ en: z.string().min(1), mn: z.string().min(1), de: z.string().optional() }),
  thumbnailUrl: z.string().optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
  isFree: z.boolean().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  tags: z.array(z.string()).optional(),
});

export const GET = withAdminAuth(async () => {
  await connectToDB();
  const items = await LmsCourse.find({}).sort({ updatedAt: -1 }).lean();
  return NextResponse.json(items);
});

export const POST = withAdminAuth(async (req: Request) => {
  await connectToDB();
  const json = await req.json();
  const parsed = CourseSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }
  const created = await LmsCourse.create({
    slug: parsed.data.slug,
    title: { ...parsed.data.title, de: parsed.data.title.de ?? "" },
    description: { ...parsed.data.description, de: parsed.data.description.de ?? "" },
    thumbnailUrl: parsed.data.thumbnailUrl ?? "",
    price: parsed.data.price ?? 0,
    currency: parsed.data.currency ?? "MNT",
    isFree: parsed.data.isFree ?? ((parsed.data.price ?? 0) === 0),
    status: parsed.data.status ?? "draft",
    tags: parsed.data.tags ?? [],
  });
  await logAdminAction({
    action: "admin.lms.course.create",
    targetType: "LmsCourse",
    targetId: created._id.toString(),
    meta: { slug: created.slug, status: created.status },
  });
  return NextResponse.json(created, { status: 201 });
});

export const PUT = withAdminAuth(async (req: Request) => {
  await connectToDB();
  const json = await req.json();
  const parsed = CourseSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }
  const id = parsed.data.id;
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const updated = await LmsCourse.findByIdAndUpdate(
    id,
    {
      $set: {
        slug: parsed.data.slug,
        title: { ...parsed.data.title, de: parsed.data.title.de ?? "" },
        description: { ...parsed.data.description, de: parsed.data.description.de ?? "" },
        thumbnailUrl: parsed.data.thumbnailUrl ?? "",
        price: parsed.data.price ?? 0,
        currency: parsed.data.currency ?? "MNT",
        isFree: parsed.data.isFree ?? ((parsed.data.price ?? 0) === 0),
        status: parsed.data.status ?? "draft",
        tags: parsed.data.tags ?? [],
      },
    },
    { new: true }
  );
  if (!updated) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  await logAdminAction({
    action: "admin.lms.course.update",
    targetType: "LmsCourse",
    targetId: String(id),
  });

  return NextResponse.json(updated);
});

export const DELETE = withAdminAuth(async (req: Request) => {
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await LmsCourse.findByIdAndDelete(id);
  await logAdminAction({
    action: "admin.lms.course.delete",
    targetType: "LmsCourse",
    targetId: String(id),
  });
  return NextResponse.json({ ok: true });
});

