import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import PromoCode from "@/lib/models/PromoCode";
import { qpayCreateInvoice } from "@/lib/qpay";
import { validatePromoForShop, incrementPromoUsage } from "@/lib/promo";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { description, items, promoCode } = body;

    if (!Array.isArray(items) || !items.length) {
      return NextResponse.json({ error: "Сагс хоосон байна." }, { status: 400 });
    }

    const subtotal = items.reduce(
      (sum: number, i: { price: number; quantity?: number }) =>
        sum + i.price * (i.quantity ?? 1),
      0
    );

    let finalAmount = subtotal;
    let discountAmount = 0;
    let promoId: string | undefined;
    let appliedCode: string | undefined;

    if (promoCode) {
      await connectToDB();
      const promo = await PromoCode.findOne({
        code: String(promoCode).trim().toUpperCase(),
      }).lean();
      if (!promo) {
        return NextResponse.json({ error: "Промо код олдсонгүй." }, { status: 400 });
      }
      const result = validatePromoForShop(
        promo as any,
        items.map((i: { id: string; price: number; quantity?: number }) => ({
          id: i.id,
          price: i.price,
          quantity: i.quantity ?? 1,
        }))
      );
      if (!result.valid) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      finalAmount = result.finalAmount;
      discountAmount = result.discountAmount;
      promoId = result.promoId;
      appliedCode = result.code;
    }

    const qpayData = await qpayCreateInvoice({
      amount: finalAmount,
      description: description || "VCM Shop Order",
      senderInvoiceNo: `INV-${Date.now()}`,
      receiverCode: "USER",
    });

    if (promoId) {
      await incrementPromoUsage(promoId);
    }

    return NextResponse.json({
      ...qpayData,
      subtotal,
      discountAmount,
      finalAmount,
      promoCode: appliedCode,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invoice failed";
    console.error("QPay Invoice Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
