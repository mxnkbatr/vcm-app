import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import PromoCode from "@/lib/models/PromoCode";
import Event from "@/lib/models/Events";
import {
  validatePromoForEvent,
  validatePromoForShop,
  type PromoLineItem,
} from "@/lib/promo";

export async function POST(req: Request) {
  try {
    await connectToDB();
    const body = await req.json();
    const code = String(body.code || "").trim().toUpperCase();
    const context = body.context as "shop" | "event";

    if (!code) {
      return NextResponse.json({ valid: false, error: "Промо код оруулна уу." }, { status: 400 });
    }

    const promo = await PromoCode.findOne({ code }).lean();
    if (!promo) {
      return NextResponse.json({ valid: false, error: "Промо код олдсонгүй." }, { status: 404 });
    }

    if (context === "event") {
      const eventId = String(body.eventId || "");
      if (!eventId) {
        return NextResponse.json({ valid: false, error: "Арга хэмжээ сонгоно уу." }, { status: 400 });
      }
      const event = await Event.findById(eventId).lean();
      if (!event) {
        return NextResponse.json({ valid: false, error: "Арга хэмжээ олдсонгүй." }, { status: 404 });
      }
      const ticketPrice = Number(body.ticketPrice ?? (event as any).ticketPrice ?? 0);
      const result = validatePromoForEvent(promo as any, eventId, ticketPrice);
      return NextResponse.json(result, { status: result.valid ? 200 : 400 });
    }

    const items: PromoLineItem[] = Array.isArray(body.items) ? body.items : [];
    if (!items.length) {
      return NextResponse.json({ valid: false, error: "Бараа сонгоно уу." }, { status: 400 });
    }

    const result = validatePromoForShop(promo as any, items);
    return NextResponse.json(result, { status: result.valid ? 200 : 400 });
  } catch (error) {
    console.error("Promo validate error:", error);
    return NextResponse.json({ valid: false, error: "Алдаа гарлаа." }, { status: 500 });
  }
}
