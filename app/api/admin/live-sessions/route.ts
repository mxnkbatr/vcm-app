import { NextResponse } from "next/server";
import { z } from "zod";
import { withAdminAuth } from "@/lib/adminAuth";
import { connectToDB } from "@/lib/db";
import LiveSession from "@/lib/models/LiveSession";

const CreateSchema = z.object({
  title: z.string().min(1),
  startsAt: z.string().min(1), // ISO string
});

export const GET = withAdminAuth(async () => {
  await connectToDB();
  const items = await LiveSession.find({}).sort({ startsAt: -1 }).limit(100);
  return NextResponse.json({ items }, { status: 200 });
});

export const POST = withAdminAuth(async (req: Request) => {
  await connectToDB();
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const startsAt = new Date(parsed.data.startsAt);
  if (Number.isNaN(startsAt.getTime())) {
    return NextResponse.json({ error: "Invalid startsAt" }, { status: 400 });
  }

  // Deterministic-ish room id based on time; uniqueness enforced by schema.
  const room = `live_${startsAt.getTime()}`;

  // TODO: store createdByUserId once adminAuth exposes it; for now rely on DB audit/logging elsewhere.
  const createdByUserId = "admin";

  const created = await LiveSession.create({
    title: parsed.data.title,
    room,
    startsAt,
    status: "scheduled",
    createdByUserId,
  });

  return NextResponse.json({ item: created }, { status: 201 });
});

