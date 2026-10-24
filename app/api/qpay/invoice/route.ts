import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUserId } from "@/lib/authHelpers";
import { parseJsonBody } from "@/lib/api/validate";
import { jsonError } from "@/lib/api/errors";
import { createShopPurchaseInvoice } from "@/lib/shop-payment";
import { rateLimit } from "@/lib/security/rateLimit";

export const dynamic = "force-dynamic";

const lineSchema = z.object({
  itemId: z.string().min(1).optional(),
  id: z.string().min(1).optional(),
  quantity: z.coerce.number().int().min(1).max(99).default(1),
});

const bodySchema = z
  .object({
    itemId: z.string().min(1).optional(),
    quantity: z.coerce.number().int().min(1).max(99).optional(),
    items: z.array(lineSchema).optional(),
    promoCode: z.string().max(64).optional(),
    phoneNumber: z.string().max(32).optional(),
    description: z.string().max(200).optional(),
  })
  .refine(
    (b) => Boolean(b.itemId) || (Array.isArray(b.items) && b.items.length > 0),
    { message: "items required" }
  );

function toLines(body: z.infer<typeof bodySchema>) {
  if (body.items?.length) {
    return body.items.map((i) => ({
      itemId: String(i.itemId || i.id || ""),
      quantity: i.quantity,
    })).filter((i) => i.itemId);
  }
  return [{ itemId: String(body.itemId), quantity: body.quantity || 1 }];
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return jsonError(401, "Unauthorized");

    const rl = rateLimit({ key: `shop-pay:${userId}`, limit: 20, windowMs: 60_000 });
    if (!rl.ok) return jsonError(429, "Too many requests");

    const parsed = await parseJsonBody(req, bodySchema);
    if ("error" in parsed) return parsed.error;

    const lines = toLines(parsed.data);
    if (!lines.length) return jsonError(400, "Invalid request");

    const result = await createShopPurchaseInvoice({
      userId,
      lines,
      phoneNumber: parsed.data.phoneNumber || "USER",
      promoCode: parsed.data.promoCode,
      description: parsed.data.description || "VCM Shop Order",
    });

    return NextResponse.json({
      success: true,
      purchaseId: result.purchase._id,
      invoice_id: result.invoiceId,
      qPay_url: result.qpay.qPay_shortUrl || result.qpay.qPay_url || result.qpay.url,
      urls: result.qpay.urls,
      amount: result.finalAmount,
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
    if (msg === "ITEM_NOT_FOUND" || msg === "EMPTY_CART") {
      return jsonError(400, "Item not found");
    }
    if (msg === "PROMO_NOT_FOUND" || msg.includes("промо") || msg.includes("код")) {
      return jsonError(400, msg || "Invalid promo");
    }
    return jsonError(500, "Failed to create invoice", e);
  }
}
