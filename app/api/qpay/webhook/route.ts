import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Purchase from "@/lib/models/Purchase";
import { jsonError } from "@/lib/api/errors";
import { markPurchasePaidIfValid } from "@/lib/shop-payment";

export const dynamic = "force-dynamic";

function authorizeWebhook(req: NextRequest): boolean {
  const secret = process.env.QPAY_WEBHOOK_SECRET;
  if (!secret) {
    // Fail closed in production when secret is expected; allow only if unset for local.
    return process.env.NODE_ENV !== "production";
  }
  const header =
    req.headers.get("x-qpay-secret") ||
    req.headers.get("x-webhook-secret") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return header === secret;
}

export async function POST(req: NextRequest) {
  try {
    if (!authorizeWebhook(req)) {
      return jsonError(401, "Unauthorized");
    }

    const body = await req.json().catch(() => ({}));
    const invoiceId =
      body.invoice_id ||
      body.invoiceId ||
      body.object_id ||
      body.qpay_invoice_id ||
      "";
    const senderInvoiceNo =
      body.sender_invoice_no || body.senderInvoiceNo || body.payment_id || "";

    if (!invoiceId && !senderInvoiceNo) {
      return jsonError(400, "Missing invoice reference");
    }

    await connectToDB();
    let purchase = null;
    if (senderInvoiceNo) {
      purchase = await Purchase.findById(senderInvoiceNo);
    }
    if (!purchase && invoiceId) {
      purchase = await Purchase.findOne({ invoiceId });
    }
    if (!purchase) {
      return NextResponse.json({ ok: true, status: "ignored" });
    }

    const result = await markPurchasePaidIfValid(purchase, {
      invoiceId: invoiceId || purchase.invoiceId,
    });

    return NextResponse.json({
      ok: true,
      status: result.status,
      purchaseId: String(purchase._id),
    });
  } catch (e) {
    return jsonError(500, "Webhook failed", e);
  }
}
