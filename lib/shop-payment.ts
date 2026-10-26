import mongoose from "mongoose";
import { connectToDB } from "@/lib/db";
import Purchase, { type IPurchase } from "@/lib/models/Purchase";
import ShoppingItem from "@/lib/models/ShoppingItem";
import PromoCode from "@/lib/models/PromoCode";
import { validatePromoForShop, incrementPromoUsage } from "@/lib/promo";
import { qpayCheckInvoicePaid, qpayCreateInvoice } from "@/lib/qpay";

export type ShopLineInput = { itemId: string; quantity: number };

export async function priceLinesFromDb(lines: ShopLineInput[]) {
  await connectToDB();
  const ids = lines.map((l) => l.itemId);
  const items = await ShoppingItem.find({
    _id: { $in: ids },
    isActive: true,
  }).lean();

  const byId = new Map(items.map((i: any) => [String(i._id), i]));
  const priced: { itemId: string; quantity: number; unitPrice: number; name?: string }[] = [];

  for (const line of lines) {
    const item = byId.get(line.itemId);
    if (!item) {
      throw new Error("ITEM_NOT_FOUND");
    }
    const qty = Math.max(1, Math.floor(Number(line.quantity) || 1));
    priced.push({
      itemId: line.itemId,
      quantity: qty,
      unitPrice: Number(item.price) || 0,
    });
  }

  const subtotal = priced.reduce((s, p) => s + p.unitPrice * p.quantity, 0);
  return { priced, subtotal };
}

export async function createShopPurchaseInvoice(opts: {
  userId: string;
  lines: ShopLineInput[];
  phoneNumber: string;
  promoCode?: string;
  description?: string;
}) {
  const { priced, subtotal } = await priceLinesFromDb(opts.lines);
  if (!priced.length || subtotal < 0) {
    throw new Error("EMPTY_CART");
  }

  let finalAmount = subtotal;
  let discountAmount = 0;
  let promoId: string | undefined;
  let appliedCode: string | undefined;

  const rawPromo = String(opts.promoCode || "").trim();
  if (rawPromo) {
    const promo = await PromoCode.findOne({
      code: rawPromo.toUpperCase(),
    }).lean();
    if (!promo) throw new Error("PROMO_NOT_FOUND");
    const result = validatePromoForShop(
      promo as any,
      priced.map((p) => ({ id: p.itemId, price: p.unitPrice, quantity: p.quantity }))
    );
    if (!result.valid) throw new Error(result.error);
    finalAmount = result.finalAmount;
    discountAmount = result.discountAmount;
    promoId = result.promoId;
    appliedCode = result.code;
  }

  const primary = priced[0];
  const purchase = await Purchase.create({
    userId: new mongoose.Types.ObjectId(opts.userId),
    itemId: new mongoose.Types.ObjectId(primary.itemId),
    quantity: priced.reduce((s, p) => s + p.quantity, 0),
    lineItems: priced.map((p) => ({
      itemId: new mongoose.Types.ObjectId(p.itemId),
      quantity: p.quantity,
      unitPrice: p.unitPrice,
    })),
    phoneNumber: opts.phoneNumber,
    amount: finalAmount,
    originalAmount: subtotal,
    discountAmount,
    promoCode: appliedCode,
    promoId: promoId ? new mongoose.Types.ObjectId(promoId) : undefined,
    status: "pending",
    paymentMethod: "QPay",
    promoApplied: false,
  });

  const invoiceData = await qpayCreateInvoice({
    amount: finalAmount,
    description: opts.description || "VCM Shop Order",
    senderInvoiceNo: purchase._id.toString(),
    receiverCode: opts.phoneNumber || "USER",
  });

  const invoiceId =
    invoiceData.invoice_id ||
    invoiceData.id ||
    invoiceData.invoiceId ||
    invoiceData.qpay_invoice_id ||
    "";

  if (invoiceId) {
    await Purchase.findByIdAndUpdate(purchase._id, { $set: { invoiceId } });
    purchase.invoiceId = invoiceId;
  }

  return {
    purchase,
    invoiceId,
    qpay: invoiceData,
    subtotal,
    discountAmount,
    finalAmount,
    promoCode: appliedCode,
  };
}

/** Idempotent: mark purchase completed when QPay paid_amount >= purchase.amount */
export async function markPurchasePaidIfValid(
  purchase: IPurchase,
  opts?: { invoiceId?: string; skipQpay?: boolean; paidAmountOverride?: number }
): Promise<{ status: "paid" | "pending"; purchase: IPurchase; raw?: unknown }> {
  await connectToDB();

  if (purchase.status === "completed") {
    return { status: "paid", purchase };
  }

  const invoiceId = opts?.invoiceId || purchase.invoiceId;
  if (!invoiceId) {
    return { status: "pending", purchase };
  }

  if (purchase.invoiceId && opts?.invoiceId && purchase.invoiceId !== opts.invoiceId) {
    throw new Error("INVOICE_MISMATCH");
  }

  let paidAmount = opts?.paidAmountOverride ?? 0;
  let raw: unknown;

  if (!opts?.skipQpay) {
    const check = await qpayCheckInvoicePaid(invoiceId, purchase.amount);
    raw = check.raw;
    paidAmount = Number(check.raw?.paid_amount ?? 0);
    if (!check.isPaid || paidAmount < purchase.amount) {
      return { status: "pending", purchase, raw };
    }
  } else if (paidAmount < purchase.amount) {
    return { status: "pending", purchase };
  }

  const updated = await Purchase.findOneAndUpdate(
    { _id: purchase._id, status: { $ne: "completed" } },
    {
      $set: {
        status: "completed",
        invoiceId,
        ...(purchase.promoId && !purchase.promoApplied ? { promoApplied: true } : {}),
      },
    },
    { new: true }
  );

  if (updated && purchase.promoId && !purchase.promoApplied) {
    await incrementPromoUsage(String(purchase.promoId));
  }

  return {
    status: "paid",
    purchase: (updated || purchase) as IPurchase,
    raw,
  };
}
