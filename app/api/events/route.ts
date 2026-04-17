import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Event from "@/lib/models/Events";
import { requireNonGuest } from "@/lib/rbac";
import { CreateEventSchema } from "@/lib/modules/events/events.schemas";
import { withCache } from "@/lib/server-cache";

export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "all";
    const cacheKey = `events:${category}`;

    const events = await withCache(cacheKey, 45_000, async () => {
      await connectToDB();
      const query = category !== "all" ? { category } : {};
      return Event.find(query)
        .select("_id title description date timeString location image category status featured attendees university")
        .sort({ date: 1 })
        .lean();
    });

    return NextResponse.json(events, {
      status: 200,
      headers: { "Cache-Control": "public, s-maxage=45, stale-while-revalidate=30" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

// POST: Create a new event (Protected: Members/Admins only)
export async function POST(req: Request) {
  try {
    const session = await requireNonGuest();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const json = await req.json();
    const parsed = CreateEventSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const dto = parsed.data;
    if (isNaN(dto.date.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const newEvent = await Event.create({
      ...dto,
      link: dto.link || undefined,
      university: dto.university || "MNUMS",
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}