import { NextResponse } from "next/server";

import { connectToDB } from "@/lib/db";
import Event from "@/lib/models/Events";
import { v2 as cloudinary } from "cloudinary";
import { withAdminAuth } from "@/lib/adminAuth";
import { invalidatePrefix } from "@/lib/server-cache";
import { logAdminAction } from "@/lib/audit";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800";

function normalizeEventPayload(data: Record<string, unknown>) {
  const titleMn = String((data.title as any)?.mn || "").trim();
  const titleEn = String((data.title as any)?.en || titleMn).trim();
  const descMn = String((data.description as any)?.mn || titleMn).trim();
  const descEn = String((data.description as any)?.en || titleEn || descMn).trim();
  const locMn = String((data.location as any)?.mn || "Улаанбаатар").trim();
  const locEn = String((data.location as any)?.en || "Ulaanbaatar").trim();

  if (!titleMn) throw new Error("Гарчиг (MN) шаардлагатай");
  if (!data.date) throw new Error("Огноо шаардлагатай");

  const parsedDate = new Date(String(data.date));
  if (Number.isNaN(parsedDate.getTime())) throw new Error("Огноо буруу байна");

  return {
    title: { mn: titleMn, en: titleEn || titleMn },
    description: { mn: descMn, en: descEn || descMn },
    date: parsedDate,
    timeString: String(data.timeString || "All Day"),
    location: { mn: locMn, en: locEn },
    category: String(data.category || "workshop"),
    status: String(data.status || "upcoming"),
    image: String(data.image || DEFAULT_IMAGE),
    link: data.link ? String(data.link) : undefined,
    university: String(data.university || "VCM"),
    featured: Boolean(data.featured),
    ticketPrice: Number(data.ticketPrice) || 0,
  };
}

function bustEventCache() {
  invalidatePrefix("events:");
}
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const GET = withAdminAuth(async () => {
  try {
    await connectToDB();
    const events = await Event.find({}).sort({ date: 1 }).populate('attendees', 'fullName email');
    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
});

export const POST = withAdminAuth(async (req: Request) => {
  try {
    await connectToDB();
    let raw: Record<string, unknown>;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      raw = await req.json();
    } else {
      const formData = await req.formData();
      raw = {
        title: { en: formData.get("titleEn"), mn: formData.get("titleMn") },
        description: { en: formData.get("descEn"), mn: formData.get("descMn") },
        date: formData.get("date"),
        timeString: formData.get("timeString") || "All Day",
        location: { en: formData.get("locEn"), mn: formData.get("locMn") },
        category: formData.get("category") || "workshop",
        status: formData.get("status") || "upcoming",
        image: "",
        featured: formData.get("featured") === "true",
        link: formData.get("link") || "",
      };
      const imageFile = formData.get("image") as File | null;
      if (imageFile && imageFile.size > 0) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileBase64 = `data:${imageFile.type};base64,${buffer.toString("base64")}`;
        const uploadRes = await cloudinary.uploader.upload(fileBase64, {
          folder: "vcm_events",
        });
        raw.image = uploadRes.secure_url;
      }
    }

    const payload = normalizeEventPayload(raw);
    const newEvent = await Event.create(payload);
    bustEventCache();

    await logAdminAction({
      action: "admin.event.create",
      targetType: "Event",
      targetId: String(newEvent._id),
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error: unknown) {
    console.error("Event Create Error:", error);
    const message = error instanceof Error ? error.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
});

export const PUT = withAdminAuth(async (req: Request) => {
  try {
    await connectToDB();
    let raw: Record<string, unknown>;
    let id: string;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      raw = await req.json();
      id = String(raw.id || raw._id || "");
      delete raw.id;
      delete raw._id;
      if (raw.image === "") delete raw.image;
    } else {
      const formData = await req.formData();
      id = formData.get("id") as string;
      raw = {
        title: { en: formData.get("titleEn"), mn: formData.get("titleMn") },
        description: { en: formData.get("descEn"), mn: formData.get("descMn") },
        date: formData.get("date"),
        timeString: formData.get("timeString"),
        location: { en: formData.get("locEn"), mn: formData.get("locMn") },
        category: formData.get("category"),
        status: formData.get("status"),
        featured: formData.get("featured") === "true",
        link: formData.get("link") || "",
      };
      const imageFile = formData.get("image");
      if (imageFile && imageFile instanceof File && imageFile.size > 0) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileBase64 = `data:${imageFile.type};base64,${buffer.toString("base64")}`;
        const uploadRes = await cloudinary.uploader.upload(fileBase64, {
          folder: "vcm_events",
        });
        raw.image = uploadRes.secure_url;
      }
    }

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const existing = await Event.findById(id).lean();
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const merged = {
      title: raw.title || existing.title,
      description: raw.description || existing.description,
      date: raw.date || existing.date,
      timeString: raw.timeString ?? existing.timeString,
      location: raw.location || existing.location,
      category: raw.category ?? existing.category,
      status: raw.status ?? existing.status,
      image: raw.image ?? existing.image,
      link: raw.link ?? existing.link,
      university: raw.university ?? existing.university,
      featured: raw.featured ?? existing.featured,
      ticketPrice: raw.ticketPrice ?? (existing as any).ticketPrice,
    };

    const payload = normalizeEventPayload(merged);
    const updated = await Event.findByIdAndUpdate(id, payload, { new: true });
    bustEventCache();

    await logAdminAction({
      action: "admin.event.update",
      targetType: "Event",
      targetId: id,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
});

export const DELETE = withAdminAuth(async (req: Request) => {
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await Event.findByIdAndDelete(id);
  bustEventCache();
  await logAdminAction({
    action: "admin.event.delete",
    targetType: "Event",
    targetId: id,
  });
  return NextResponse.json({ success: true });
});