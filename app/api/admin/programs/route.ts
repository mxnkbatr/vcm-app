import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Program from "@/lib/models/Program";
import { ensureDefaultPrograms } from "@/lib/programDefaults";
import { withAdminAuth } from "@/lib/adminAuth";
import { logAdminAction } from "@/lib/audit";

export const GET = withAdminAuth(async () => {
  await connectToDB();
  await ensureDefaultPrograms();
  const programs = await Program.find({}).sort({ order: 1, code: 1 }).lean();
  return NextResponse.json(programs);
});

export const POST = withAdminAuth(async (req: Request) => {
  try {
    await connectToDB();
    const body = await req.json();
    const code = String(body.code || "").trim().toUpperCase();
    const slug = String(body.slug || code).trim().toLowerCase();
    if (!code) return NextResponse.json({ error: "Code is required" }, { status: 400 });

    const program = await Program.create({
      code,
      slug,
      emoji: body.emoji || "🌍",
      color: body.color || "#0EA5E9",
      gradFrom: body.gradFrom || body.color || "#0ea5e9",
      gradTo: body.gradTo || "#3b82f6",
      name: body.name || { mn: code, en: code },
      description: body.description || { mn: "", en: "" },
      why: body.why || { mn: "", en: "" },
      href: body.href || `/programs/${slug}`,
      duration: body.duration || "",
      location: body.location || "",
      slots: Number(body.slots) || 10,
      tags: body.tags || [],
      features: body.features || [],
      order: Number(body.order) || 0,
      active: body.active !== false,
      applicationQuestions: Array.isArray(body.applicationQuestions)
        ? body.applicationQuestions
        : [],
    });

    await logAdminAction({ action: "admin.program.create", targetType: "Program", targetId: String(program._id) });
    return NextResponse.json(program, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Create failed" }, { status: 500 });
  }
});

export const PUT = withAdminAuth(async (req: Request) => {
  try {
    await connectToDB();
    const body = await req.json();
    const id = body.id || body._id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const { _id, id: _id2, ...update } = body;
    const program = await Program.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!program) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await logAdminAction({ action: "admin.program.update", targetType: "Program", targetId: String(id) });
    return NextResponse.json(program);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Update failed" }, { status: 500 });
  }
});

export const DELETE = withAdminAuth(async (req: Request) => {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await Program.findByIdAndDelete(id);
    await logAdminAction({ action: "admin.program.delete", targetType: "Program", targetId: id });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Delete failed" }, { status: 500 });
  }
});
