import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Lesson from "@/lib/models/Lesson";
import User from "@/lib/models/User"; // Ensure User model is registered

export async function GET() {
    try {
        await connectToDB();
        const lessons = await Lesson.find({}).sort({ createdAt: -1 }).populate('attendees');
        return NextResponse.json(lessons);
    } catch (error) {
        console.error("GET /api/admin/lessons error:", error);
        return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectToDB();
        const body = await req.json();
        const newLesson = await Lesson.create(body);
        return NextResponse.json(newLesson, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await connectToDB();
        const body = await req.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json({ error: "Lesson ID is required" }, { status: 400 });
        }

        const updatedLesson = await Lesson.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedLesson) {
            return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
        }

        return NextResponse.json(updatedLesson);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update lesson" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await connectToDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Lesson ID is required" }, { status: 400 });
        }

        await Lesson.findByIdAndDelete(id);
        return NextResponse.json({ message: "Lesson deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete lesson" }, { status: 500 });
    }
}
