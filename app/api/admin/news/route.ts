import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import News from "@/lib/models/News";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    await connectToDB();
    const news = await News.find({}).sort({ publishedDate: -1 });
    return NextResponse.json(news, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch news", error);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDB();
    let data: any;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        data = await request.json();
    } else {
        const formData = await request.formData();
        data = {
            title: { en: formData.get("titleEn"), mn: formData.get("titleMn") },
            summary: { en: formData.get("summaryEn"), mn: formData.get("summaryMn") },
            content: { en: formData.get("contentEn"), mn: formData.get("contentMn") },
            author: formData.get("author") || "Admin",
            tags: (formData.get("tags") as string || "").split(',').map(t => t.trim()),
            featured: formData.get("featured") === 'true',
            status: formData.get("status") || 'published',
            image: ""
        };
        const imageFile = formData.get("image") as File | null;
        if (imageFile) {
            const arrayBuffer = await imageFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const uploadResult = await new Promise<any>((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'unicef_news' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(buffer);
            });
            data.image = uploadResult.secure_url;
        }
    }

    const newArticle = await News.create(data);
    return NextResponse.json(newArticle, { status: 201 });
  } catch (error) {
    console.error("Failed to create news", error);
    return NextResponse.json({ error: "Failed to create news" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
    try {
        await connectToDB();
        let data: any;
        let id: string;
        const contentType = request.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            data = await request.json();
            id = data.id || data._id;
            if (data.image === "") delete data.image;
            delete data.id;
            delete data._id;
        } else {
            const formData = await request.formData();
            id = formData.get("id") as string;
            data = {
                title: { en: formData.get("titleEn"), mn: formData.get("titleMn") },
                summary: { en: formData.get("summaryEn"), mn: formData.get("summaryMn") },
                content: { en: formData.get("contentEn"), mn: formData.get("contentMn") },
                author: formData.get("author"),
                tags: (formData.get("tags") as string || "").split(',').map(t => t.trim()),
                featured: formData.get("featured") === 'true',
                status: formData.get("status")
            };
            const imageFile = formData.get("image") as File | null;
            if (imageFile && imageFile instanceof File) {
                const arrayBuffer = await imageFile.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const uploadResult = await new Promise<any>((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'unicef_news' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    uploadStream.end(buffer);
                });
                data.image = uploadResult.secure_url;
            }
        }

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        const updatedArticle = await News.findByIdAndUpdate(id, data, { new: true });
        return NextResponse.json(updatedArticle, { status: 200 });
    } catch (error) {
        console.error("Failed to update news", error);
        return NextResponse.json({ error: "Failed to update news" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await connectToDB();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await News.findByIdAndDelete(id);
        return NextResponse.json({ message: "Deleted" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
