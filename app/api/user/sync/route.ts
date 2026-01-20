import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(req: Request) {
  console.log("--------------- STARTING USER SYNC ---------------");
  try {
    // 1. Connect DB
    console.log("1. Connecting to DB...");
    await connectToDB();
    console.log("   - Connected.");

    // 2. Check Auth
    console.log("2. Checking Clerk Auth...");
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      console.log("   - No Clerk user found!");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("   - User Authenticated:", clerkUser.id);

    // 3. Parse Body
    const body = await req.json();
    console.log("3. Payload Received:", body);
    
    const { fullName, studentId, university } = body;

    // 4. Database Operation
    console.log("4. Attempting MongoDB Update/Create...");
    
    // Using simple create first to see if findOneAndUpdate is the issue,
    // but findOneAndUpdate is safer for duplicates.
    const user = await User.findOneAndUpdate(
      { clerkId: clerkUser.id },
      {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0].emailAddress,
        studentId: studentId ? studentId.toUpperCase() : "NO-ID",
        fullName: fullName || "New User",
        university: university || "MNUMS",
        role: "guest", // Default role
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log("5. SUCCESS! User Saved:", user._id);
    console.log("--------------------------------------------------");

    return NextResponse.json({ success: true, user }, { status: 200 });

  } catch (error: any) {
    console.error("!!!!! SYNC FAILED !!!!!");
    console.error(error);
    // Return the actual error message so you can see it in the browser Console/Network tab
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}