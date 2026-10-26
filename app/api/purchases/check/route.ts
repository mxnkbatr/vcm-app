import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDB } from "@/lib/db";
import Purchase from "@/lib/models/Purchase";
import { getAuthUserId } from "@/lib/authHelpers";
import { parseJsonBody } from "@/lib/api/validate";
import { jsonError } from "@/lib/api/errors";
import { markPurchasePaidIfValid } from "@/lib/shop-payment";
import { normalizeShopPhone } from "@/lib/shop-guest";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  purchaseId: z.string().min(1),
  invoiceId: z.string().min(1),
  phoneNumber: z.string().min(8).max(32).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();

    const parsed = await parseJsonBody(req, bodySchema);
    if ("error" in parsed) return parsed.error;

    await connectToDB();
    const purchase = await Purchase.findById(parsed.data.purchaseId);
    if (!purchase) return jsonError(404, "Purchase not found");

    if (userId) {
      if (String(purchase.userId) !== String(userId)) {
        return jsonError(403, "Forbidden");
      }
    } else if (parsed.data.phoneNumber) {
      const a = normalizeShopPhone(purchase.phoneNumber);
      const b = normalizeShopPhone(parsed.data.phoneNumber);
      if (!a || a !== b) return jsonError(403, "Forbidden");
    } else {
      return jsonError(401, "Нэвтэрч орно уу эсвэл утасны дугаараа дахин оруулна уу.");
    }

    if (!purchase.invoiceId || purchase.invoiceId !== parsed.data.invoiceId) {
      return jsonError(400, "Invoice mismatch");
    }

    const result = await markPurchasePaidIfValid(purchase, {
      invoiceId: parsed.data.invoiceId,
    });

    if (result.status === "paid") {
      return NextResponse.json({
        success: true,
        status: "paid",
        purchase: {
          _id: result.purchase._id,
          status: "completed",
          amount: result.purchase.amount,
        },
      });
    }

    return NextResponse.json(
      { success: false, status: "pending", message: "Payment not completed" },
      { status: 402 }
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "INVOICE_MISMATCH") return jsonError(400, "Invoice mismatch");
    return jsonError(500, "Failed to check payment", e);
  }
}
