import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDB } from "@/lib/db";
import { getAuthSession } from "@/lib/authHelpers";
import ChatMessage from "@/lib/models/ChatMessage";

const QuerySchema = z.object({
  room: z.string().min(1),
});

const PostSchema = z.object({
  room: z.string().min(1),
  text: z.string().min(1).max(2000),
});

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const parsed = QuerySchema.safeParse({ room: url.searchParams.get("room") });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectToDB();
    const items = await ChatMessage.find({ room: parsed.data.room })
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error("Fetch chat error:", error);
    return NextResponse.json({ error: "Failed to fetch chat" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = PostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectToDB();
    const created = await ChatMessage.create({
      room: parsed.data.room,
      userId: session.userId,
      name: session.name ?? "",
      text: parsed.data.text,
    });

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (error) {
    console.error("Create chat error:", error);
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
  }
}

