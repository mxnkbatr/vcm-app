import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import BannerModel from "@/lib/models/Banner";
import { withAdminAuth } from "@/lib/adminAuth";
import { logAdminAction } from "@/lib/audit";
import { invalidatePrefix } from "@/lib/server-cache";

function bustBannerCache() {
  invalidatePrefix("home:banners");
}

const DEFAULT_BANNERS = [
  {
    title: { mn: "Shoebox Project Mongolia", en: "Shoebox Project Mongolia" },
    subtitle: {
      mn: "Хуучин гутлын хайрцагтаа ид шид бүтээ",
      en: "Create magic in your old shoebox",
    },
    image: "/banners/shoebox-project.png",
    link: "/events",
    active: true,
    order: 0,
    intervalSec: 8,
  },
  {
    title: { mn: "Сайн дурын үйлс", en: "Inspiration in Action" },
    subtitle: {
      mn: "Жижиг үйлдэл — том өөрчлөлт",
      en: "Small actions, big differences",
    },
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&q=80",
    link: "/about",
    active: true,
    order: 1,
    intervalSec: 8,
  },
];

function normalizePayload(data: Record<string, unknown>) {
  const titleMn = String((data.title as any)?.mn || data.titleMn || "").trim();
  const titleEn = String((data.title as any)?.en || data.titleEn || titleMn).trim();
  const subtitleMn = String((data.subtitle as any)?.mn || data.subtitleMn || "").trim();
  const subtitleEn = String((data.subtitle as any)?.en || data.subtitleEn || subtitleMn).trim();

  if (!titleMn) throw new Error("Гарчиг (MN) шаардлагатай");
  if (!data.image) throw new Error("Зураг шаардлагатай");

  return {
    title: { mn: titleMn, en: titleEn || titleMn },
    subtitle: { mn: subtitleMn, en: subtitleEn || subtitleMn },
    image: String(data.image),
    link: data.link ? String(data.link) : "",
    active: data.active !== false,
    order: Number(data.order) || 0,
    intervalSec: Math.max(5, Math.min(30, Number(data.intervalSec) || 8)),
  };
}

export const GET = withAdminAuth(async () => {
  try {
    await connectToDB();
    const banners = await BannerModel.find({}).sort({ order: 1, createdAt: -1 }).lean();
    return NextResponse.json(
      banners.map((b: any) => ({ ...b, _id: b._id.toString() })),
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch banners", error);
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
  }
});

export const POST = withAdminAuth(async (request: Request) => {
  try {
    await connectToDB();
    const data = await request.json();
    const payload = normalizePayload(data);
    const banner = await BannerModel.create(payload);
    bustBannerCache();
    await logAdminAction({ action: "banner_create", targetType: "banner", targetId: banner._id.toString() });
    return NextResponse.json({ ...banner.toObject(), _id: banner._id.toString() }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create" }, { status: 400 });
  }
});

export const PUT = withAdminAuth(async (request: Request) => {
  try {
    await connectToDB();
    const data = await request.json();
    const id = data.id || data._id;
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const payload = normalizePayload(data);
    const updated = await BannerModel.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

    bustBannerCache();
    await logAdminAction({ action: "banner_update", targetType: "banner", targetId: id });
    return NextResponse.json({ ...updated.toObject(), _id: updated._id.toString() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update" }, { status: 400 });
  }
});

export const DELETE = withAdminAuth(async (request: Request) => {
  try {
    await connectToDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await BannerModel.findByIdAndDelete(id);
    bustBannerCache();
    await logAdminAction({ action: "banner_delete", targetType: "banner", targetId: id });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
});

/** Seed defaults if collection is empty (admin utility) */
export const PATCH = withAdminAuth(async () => {
  try {
    await connectToDB();
    const count = await BannerModel.countDocuments();
    if (count > 0) {
      return NextResponse.json({ message: "Already seeded", count });
    }
    await BannerModel.insertMany(DEFAULT_BANNERS);
    return NextResponse.json({ message: "Seeded", count: DEFAULT_BANNERS.length });
  } catch (error) {
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
});
