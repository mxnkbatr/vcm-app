import type { Document } from "mongoose";

export type PromoDoc = {
  _id: unknown;
  code: string;
  discountPercent: number;
  shopItemIds?: { toString: () => string }[];
  eventIds?: { toString: () => string }[];
  allShopItems?: boolean;
  allEvents?: boolean;
  active?: boolean;
  maxUses?: number | null;
  usedCount?: number;
  expiresAt?: Date | null;
};

export type PromoLineItem = {
  id: string;
  price: number;
  quantity?: number;
};

export type PromoValidationResult =
  | {
      valid: true;
      promoId: string;
      code: string;
      discountPercent: number;
      eligibleSubtotal: number;
      discountAmount: number;
      finalAmount: number;
    }
  | { valid: false; error: string };

function isExpired(promo: PromoDoc) {
  if (!promo.expiresAt) return false;
  return new Date(promo.expiresAt).getTime() < Date.now();
}

function isUsageExceeded(promo: PromoDoc) {
  if (promo.maxUses == null) return false;
  return (promo.usedCount || 0) >= promo.maxUses;
}

export function validatePromoForShop(
  promo: PromoDoc,
  items: PromoLineItem[]
): PromoValidationResult {
  if (!promo.active) return { valid: false, error: "Промо код идэвхгүй байна." };
  if (isExpired(promo)) return { valid: false, error: "Промо кодын хугацаа дууссан." };
  if (isUsageExceeded(promo)) return { valid: false, error: "Промо кодын хязгаар дүүрсэн." };

  const allowedIds = new Set((promo.shopItemIds || []).map((id) => id.toString()));
  const useAll = Boolean(promo.allShopItems);

  if (!useAll && allowedIds.size === 0) {
    return { valid: false, error: "Энэ код дэлгүүрийн бараанд хамаарахгүй." };
  }

  let eligibleSubtotal = 0;
  for (const item of items) {
    const qty = item.quantity ?? 1;
    if (useAll || allowedIds.has(item.id)) {
      eligibleSubtotal += item.price * qty;
    }
  }

  if (eligibleSubtotal <= 0) {
    return { valid: false, error: "Сонгосон бараанд энэ промо код хамаарахгүй." };
  }

  const discountAmount = Math.round((eligibleSubtotal * promo.discountPercent) / 100);
  const cartTotal = items.reduce((sum, i) => sum + i.price * (i.quantity ?? 1), 0);

  return {
    valid: true,
    promoId: String(promo._id),
    code: promo.code,
    discountPercent: promo.discountPercent,
    eligibleSubtotal,
    discountAmount,
    finalAmount: Math.max(0, cartTotal - discountAmount),
  };
}

export function validatePromoForEvent(
  promo: PromoDoc,
  eventId: string,
  ticketPrice: number
): PromoValidationResult {
  if (!promo.active) return { valid: false, error: "Промо код идэвхгүй байна." };
  if (isExpired(promo)) return { valid: false, error: "Промо кодын хугацаа дууссан." };
  if (isUsageExceeded(promo)) return { valid: false, error: "Промо кодын хязгаар дүүрсэн." };

  const allowedIds = new Set((promo.eventIds || []).map((id) => id.toString()));
  const useAll = Boolean(promo.allEvents);

  if (!useAll && !allowedIds.has(eventId)) {
    return { valid: false, error: "Энэ код энэ арга хэмжээнд хамаарахгүй." };
  }

  if (ticketPrice <= 0) {
    return { valid: false, error: "Энэ арга хэмжээ үнэгүй — промо код шаардлагагүй." };
  }

  const discountAmount = Math.round((ticketPrice * promo.discountPercent) / 100);

  return {
    valid: true,
    promoId: String(promo._id),
    code: promo.code,
    discountPercent: promo.discountPercent,
    eligibleSubtotal: ticketPrice,
    discountAmount,
    finalAmount: Math.max(0, ticketPrice - discountAmount),
  };
}

export async function incrementPromoUsage(promoId: string) {
  const { connectToDB } = await import("@/lib/db");
  const PromoCode = (await import("@/lib/models/PromoCode")).default;
  await connectToDB();
  await PromoCode.findByIdAndUpdate(promoId, { $inc: { usedCount: 1 } });
}
