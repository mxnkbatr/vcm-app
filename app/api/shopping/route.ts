import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import ShoppingItem from "@/lib/models/ShoppingItem";
import { withCache } from "@/lib/server-cache";

export const revalidate = 0;

export async function GET() {
  try {
    const items = await withCache("shopping:all", 90_000, async () => {
      await connectToDB();
      return ShoppingItem.find({ isActive: true })
        .select("_id name price image category stock isActive createdAt")
        .sort({ createdAt: -1 })
        .limit(60)
        .lean();
    });

    return NextResponse.json(items, {
      status: 200,
      headers: { "Cache-Control": "public, s-maxage=90, stale-while-revalidate=60" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch shopping items" }, { status: 500 });
  }
}
