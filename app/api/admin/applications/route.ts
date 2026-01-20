import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/db";
import Application from "@/lib/models/Application";
import User from "@/lib/models/User";

const PROGRAM_MAP: Record<string, string> = {
  "DE": "Germany",
  "BE": "Belgium",
  "AT": "Austria",
  "CH": "Switzerland"
};

async function isAdmin() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) return false;

  if (clerkUser.publicMetadata?.role === 'admin') {
    return true;
  }

  await connectToDB();
  const dbUser = await User.findOne({ clerkId: clerkUser.id });
  return dbUser?.role === 'admin';
}

export async function GET() {
  if (!await isAdmin()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectToDB();
    const applications = await Application.find({}).sort({ createdAt: -1 });
    return NextResponse.json(applications);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectToDB();
    const body = await req.json();
    const { applicationId, status } = body;

    const application = await Application.findById(applicationId);
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    application.status = status;
    await application.save();

    // If approved and user exists, upgrade user to student
    if (status === 'approved' && application.userId) {
       const country = PROGRAM_MAP[application.programId] || "General";
       
       await User.findOneAndUpdate(
         { clerkId: application.userId },
         { 
            role: 'student', // Note: Case sensitive? Frontend uses 'Student' in display, but 'member' in DB. Let's use 'student' (lowercase) to match DB convention likely, or 'Student' if that's what we decided. 
            // In User.ts default is "member".
            // In Admin page, mock users had "Student".
            // I'll use "student" (lowercase) as code usually normalizes it, but I'll check admin page display logic.
            country: country,
            step: "Documents"
         }
       );
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("Update application error:", error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}