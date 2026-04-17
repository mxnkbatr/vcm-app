import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import { withAdminAuth } from "@/lib/adminAuth";
import AuditLog from "@/lib/models/AuditLog";

export const GET = withAdminAuth(async (req: Request) => {
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(10, Number(searchParams.get("limit") || "25")));
  const action = searchParams.get("action") || "";
  const targetType = searchParams.get("targetType") || "";

  const q: any = {};
  if (action) q.action = action;
  if (targetType) q.targetType = targetType;

  const [items, total] = await Promise.all([
    AuditLog.find(q).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    AuditLog.countDocuments(q),
  ]);

  return NextResponse.json({ items, page, limit, total });
});

