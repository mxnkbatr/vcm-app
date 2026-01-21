import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/db";
import Lesson from "@/lib/models/Lesson";
import User from "@/lib/models/User";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        await connectToDB();

        // Parse Query Parameters
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (id) {
            const lesson = await Lesson.findById(id).populate('attendees', '_id clerkId fullName email photo');
            if (!lesson) {
                return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
            }
            return NextResponse.json(lesson);
        }

        // Return visible lessons, sort by newest
        const lessons = await Lesson.find({ status: { $ne: 'archived' } })
            .sort({ createdAt: -1 })
            .populate('attendees', '_id clerkId fullName email photo');

        return NextResponse.json(lessons);
    } catch (error) {
        console.error("Failed to fetch lessons", error);
        return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDB();

        // Find internal user ID based on Clerk ID
        const user = await User.findOne({ clerkId });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { lessonId } = await req.json();
        if (!lessonId) {
            return NextResponse.json({ error: "Lesson ID required" }, { status: 400 });
        }

        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
        }

        // Check if already registered
        const isRegistered = lesson.attendees.includes(user._id);

        if (isRegistered) {
            return NextResponse.json({ message: "Already registered", lesson }, { status: 200 });
        }

        // Add user
        lesson.attendees.push(user._id);
        await lesson.save();

        return NextResponse.json({ message: "Registered successfully", lesson }, { status: 200 });
    } catch (error) {
        console.error("Lesson registration error:", error);
        return NextResponse.json({ error: "Registration failed" }, { status: 500 });
    }
}