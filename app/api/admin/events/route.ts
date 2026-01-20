import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/db";
import Event from "@/lib/models/Events";
import User from "@/lib/models/User";
import { v2 as cloudinary } from 'cloudinary';

// --- CONFIG CLOUDINARY ---
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- HELPER: CHECK ADMIN ---
async function isAdmin() {
  const clerkUser = await currentUser();
  if (!clerkUser) return false;
  if (clerkUser.publicMetadata?.role === 'admin') return true;
  await connectToDB();
  const dbUser = await User.findOne({ clerkId: clerkUser.id });
  return dbUser?.role === 'admin';
}

export async function GET() {
  try {
    await connectToDB();
    const events = await Event.find({}).sort({ date: 1 }).populate('attendees', 'fullName email');
    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!await isAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await connectToDB();
    let data: any;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        data = await req.json();
    } else {
        const formData = await req.formData();
        data = {
            title: { en: formData.get("titleEn"), mn: formData.get("titleMn") },
            description: { en: formData.get("descEn"), mn: formData.get("descMn") },
            date: formData.get("date"),
            timeString: formData.get("timeString") || "All Day",
            location: { en: formData.get("locEn"), mn: formData.get("locMn") },
            category: formData.get("category") || "workshop",
            image: ""
        };
        const imageFile = formData.get("image") as File | null;
        if (imageFile) {
            const arrayBuffer = await imageFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const fileBase64 = `data:${imageFile.type};base64,${buffer.toString('base64')}`;
            const uploadRes = await cloudinary.uploader.upload(fileBase64, { folder: 'unicef_club_events' });
            data.image = uploadRes.secure_url;
        }
    }

    const newEvent = await Event.create({
        ...data,
        university: data.university || "MNUMS",
        status: data.status || "upcoming"
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error: any) {
    console.error("Event Create Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    if (!await isAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await connectToDB();
    let data: any;
    let id: string;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        data = await req.json();
        id = data.id || data._id;
        if (data.image === "") delete data.image;
        delete data.id;
        delete data._id;
    } else {
        const formData = await req.formData();
        id = formData.get("id") as string;
        data = {
            title: { en: formData.get("titleEn"), mn: formData.get("titleMn") },
            description: { en: formData.get("descEn"), mn: formData.get("descMn") },
            date: formData.get("date"),
            timeString: formData.get("timeString"),
            location: { en: formData.get("locEn"), mn: formData.get("locMn") },
            category: formData.get("category"),
        };
        const imageFile = formData.get("image");
        if (imageFile && imageFile instanceof File) {
            const arrayBuffer = await imageFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const fileBase64 = `data:${imageFile.type};base64,${buffer.toString('base64')}`;
            const uploadRes = await cloudinary.uploader.upload(fileBase64, { folder: 'unicef_club_events' });
            data.image = uploadRes.secure_url;
        }
    }

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const updated = await Event.findByIdAndUpdate(id, data, { new: true });
    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await Event.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}