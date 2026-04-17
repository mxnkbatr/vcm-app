import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import News from "@/lib/models/News";
import { withCache } from "@/lib/server-cache";

export const revalidate = 0;

export async function GET() {
  try {
    const news = await withCache("news:all", 120_000, async () => {
      await connectToDB();
      return News.find({})
        .select("_id title summary image author publishedDate tags featured views")
        .sort({ publishedDate: -1 })
        .limit(30)
        .lean();
    });

    return NextResponse.json(news, {
      status: 200,
      headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
