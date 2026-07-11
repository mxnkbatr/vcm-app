import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Program from "@/lib/models/Program";
import { ensureDefaultPrograms } from "@/lib/programDefaults";

export async function GET() {
  try {
    await connectToDB();
    await ensureDefaultPrograms();
    const programs = await Program.find({ active: true }).sort({ order: 1, code: 1 }).lean();
    return NextResponse.json(programs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch programs" }, { status: 500 });
  }
}
