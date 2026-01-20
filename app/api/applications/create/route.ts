import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Application from "@/lib/models/Application";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    await connectToDB();
    
    // Get current user if logged in
    const user = await currentUser();
    
    const body = await req.json();
    
    const application = await Application.create({
      ...body,
      userId: user ? user.id : undefined // Link to Clerk ID if available
    });

    return NextResponse.json({ success: true, application }, { status: 201 });
  } catch (error) {
    console.error("Application submission error:", error);
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}