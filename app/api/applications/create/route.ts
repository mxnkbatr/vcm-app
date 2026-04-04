import { NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import Application from "@/lib/models/Application";
import { getAuthUserId } from "@/lib/authHelpers";

export async function POST(req: Request) {
  try {
    await connectToDB();
    const userId = await getAuthUserId();
    const data = await req.json();

    const {
      programId,
      firstName,
      lastName,
      email,
      phone,
      age,
      level,
      message,
      generalId,
    } = data;

    // Validation
    if (!programId || !firstName || !lastName || !email || !phone || !age || !level || !generalId || !message) {
      return NextResponse.json(
        { error: "Registration incomplete. Please fill all required fields." },
        { status: 400 }
      );
    }

    const application = await Application.create({
      programId,
      firstName,
      lastName,
      email,
      phone,
      age,
      level,
      message,
      generalId,
      userId: userId, // Store the db id directly
      status: 'pending_general'
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error: any) {
    console.error("Application creation error:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}