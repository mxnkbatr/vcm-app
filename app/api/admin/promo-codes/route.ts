import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import PromoCode from "@/lib/models/PromoCode";
import { withAdminAuth } from "@/lib/adminAuth";
import { logAdminAction } from "@/lib/audit";

export const GET = withAdminAuth(async () => {
  await connectToDB();
  const promos = await PromoCode.find({})
    .sort({ createdAt: -1 })
    .populate("shopItemIds", "name price")
    .populate("eventIds", "title date")
    .lean();
  return NextResponse.json(promos);
});

export const POST = withAdminAuth(async (req: Request) => {
  try {
    await connectToDB();
    const body = await req.json();
    const code = String(body.code || "").trim().toUpperCase();
    if (!code) return NextResponse.json({ error: "Код шаардлагатай" }, { status: 400 });

    const discountPercent = Number(body.discountPercent);
    if (!discountPercent || discountPercent < 1 || discountPercent > 100) {
      return NextResponse.json({ error: "Хөнгөлөлт 1-100% байх ёстой" }, { status: 400 });
    }

    const promo = await PromoCode.create({
      code,
      label: body.label || "",
      discountPercent,
      shopItemIds: body.shopItemIds || [],
      eventIds: body.eventIds || [],
      allShopItems: Boolean(body.allShopItems),
      allEvents: Boolean(body.allEvents),
      active: body.active !== false,
      maxUses: body.maxUses ? Number(body.maxUses) : null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    });

    await logAdminAction({
      action: "admin.promo.create",
      targetType: "PromoCode",
      targetId: String(promo._id),
    });

    return NextResponse.json(promo, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
});

export const PUT = withAdminAuth(async (req: Request) => {
  try {
    await connectToDB();
    const body = await req.json();
    const id = body.id || body._id;
    if (!id) return NextResponse.json({ error: "ID шаардлагатай" }, { status: 400 });

    const update: Record<string, unknown> = {};
    if (body.code) update.code = String(body.code).trim().toUpperCase();
    if (body.label !== undefined) update.label = body.label;
    if (body.discountPercent !== undefined) update.discountPercent = Number(body.discountPercent);
    if (body.shopItemIds !== undefined) update.shopItemIds = body.shopItemIds;
    if (body.eventIds !== undefined) update.eventIds = body.eventIds;
    if (body.allShopItems !== undefined) update.allShopItems = Boolean(body.allShopItems);
    if (body.allEvents !== undefined) update.allEvents = Boolean(body.allEvents);
    if (body.active !== undefined) update.active = Boolean(body.active);
    if (body.maxUses !== undefined) update.maxUses = body.maxUses ? Number(body.maxUses) : null;
    if (body.expiresAt !== undefined) update.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

    const promo = await PromoCode.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!promo) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await logAdminAction({
      action: "admin.promo.update",
      targetType: "PromoCode",
      targetId: String(id),
    });

    return NextResponse.json(promo);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
});

export const DELETE = withAdminAuth(async (req: Request) => {
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID шаардлагатай" }, { status: 400 });
  await PromoCode.findByIdAndDelete(id);
  await logAdminAction({
    action: "admin.promo.delete",
    targetType: "PromoCode",
    targetId: id,
  });
  return NextResponse.json({ success: true });
});
