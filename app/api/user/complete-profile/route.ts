import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";
import { getAuthUserId } from "@/lib/authHelpers";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { phone, password, affiliation } = await req.json();

    await connectToDB();
    const user = await User.findById(userId);
    if (!user) {
       return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let updateData: any = {
       affiliation: affiliation || "None",
    };

    if (!user.phone) {
       if (!phone) {
          return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
       }
       const existingPhone = await User.findOne({ phone, _id: { $ne: userId } });
       if (existingPhone) {
         return NextResponse.json({ error: "This phone number is already registered to another account." }, { status: 409 });
       }
       updateData.phone = phone;
    }

    if (!user.password) {
       if (!password || password.length < 6) {
          return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
       }
       updateData.password = await bcrypt.hash(password, 12);
    }

    // Update user profile
    await User.findByIdAndUpdate(userId, { $set: updateData });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Profile completion error:", error);
    return NextResponse.json(
      { error: "Failed to complete profile" },
      { status: 500 }
    );
  }
}
