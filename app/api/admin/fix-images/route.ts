import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Event from "@/lib/models/Events";
import News from "@/lib/models/News";
import { invalidatePrefix } from "@/lib/server-cache";

// One-time fix: replace broken Unsplash image URLs in DB
// Call once: GET /api/admin/fix-images
const BROKEN = "https://images.unsplash.com/photo-1461301214746-1e790926d323";

const EVENT_REPLACEMENTS: Record<string, string> = {
  campaign:   "https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2070&auto=format&fit=crop",
  fundraiser: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop",
  workshop:   "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop",
  meeting:    "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=2070&auto=format&fit=crop",
  default:    "https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2070&auto=format&fit=crop",
};

export async function GET() {
  try {
    await connectToDB();

    // Fix events with broken image
    const brokenEvents = await Event.find({ image: { $regex: "photo-1461301214746" } }).lean();
    let eventsFixed = 0;

    for (const ev of brokenEvents) {
      const replacement = EVENT_REPLACEMENTS[(ev as any).category] || EVENT_REPLACEMENTS.default;
      await Event.updateOne({ _id: ev._id }, { $set: { image: replacement } });
      eventsFixed++;
    }

    // Fix news with broken image
    const brokenNews = await News.find({ image: { $regex: "photo-1461301214746" } }).lean();
    let newsFixed = 0;

    for (const n of brokenNews) {
      await News.updateOne(
        { _id: n._id },
        { $set: { image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop" } }
      );
      newsFixed++;
    }

    // Clear server cache so fresh data is served
    invalidatePrefix("events:");
    invalidatePrefix("news:");

    return NextResponse.json({
      ok: true,
      eventsFixed,
      newsFixed,
      message: `Fixed ${eventsFixed} events and ${newsFixed} news items.`,
    });
  } catch (error) {
    console.error("fix-images error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
