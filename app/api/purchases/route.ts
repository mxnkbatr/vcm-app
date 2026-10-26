import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDB } from "@/lib/db";
import Purchase from "@/lib/models/Purchase";
import { getAuthSession, getAuthUserId } from "@/lib/authHelpers";
import { parseJsonBody } from "@/lib/api/validate";
import { jsonError } from "@/lib/api/errors";
import { createShopPurchaseInvoice } from "@/lib/shop-payment";
import { resolveShopBuyerUserId } from "@/lib/shop-guest";
import { rateLimit } from "@/lib/security/rateLimit";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  itemId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(99).default(1),
  phoneNumber: z.string().min(8).max(32),
  promoCode: z
    .string()
    .max(64)
    .optional()
    .transform((v) => {
      const t = (v || "").trim();
      return t.length ? t : undefined;
    }),
});

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.userId) return jsonError(401, "Unauthorized");

    await connectToDB();
    const isAdmin = session.role === "admin" || session.role === "manager";
    const filter = isAdmin ? {} : { userId: session.userId };
    const purchases = await Purchase.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("itemId")
      .lean();

    return NextResponse.json(purchases);
  } catch (e) {
    return jsonError(500, "Failed to fetch purchases", e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUserId = await getAuthUserId();

    const parsed = await parseJsonBody(req, bodySchema);
    if ("error" in parsed) return parsed.error;

    const userId = await resolveShopBuyerUserId({
      authUserId,
      phoneNumber: parsed.data.phoneNumber,
    });

    const rl = rateLimit({
      key: `shop-pay:${userId}`,
      limit: 20,
      windowMs: 60_000,
    });
    if (!rl.ok) return jsonError(429, "Too many requests");

    const result = await createShopPurchaseInvoice({
      userId,
      lines: [{ itemId: parsed.data.itemId, quantity: parsed.data.quantity }],
      phoneNumber: parsed.data.phoneNumber,
      promoCode: parsed.data.promoCode,
      description: "VCM Shop Purchase",
    });

    return NextResponse.json({
      purchase: {
        _id: result.purchase._id,
        amount: result.finalAmount,
        status: "pending",
        invoiceId: result.invoiceId,
      },
      qpay: result.qpay,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "PHONE_REQUIRED") {
      return jsonError(400, "Утасны дугаараа зөв оруулна уу.");
    }
    if (msg === "ITEM_NOT_FOUND") return jsonError(400, "Item not found");
    if (msg === "PROMO_NOT_FOUND") return jsonError(400, "Invalid promo");
    if (msg && !msg.includes("QPay") && msg.length < 120) {
      return jsonError(400, msg);
    }
    return jsonError(500, "Failed to create purchase", e);
  }
}
