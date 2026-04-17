import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";
import { getAuthUserId } from "@/lib/authHelpers";
import bcrypt from "bcryptjs";
import { validatePassword } from "@/lib/security/passwordPolicy";
import { rateLimit } from "@/lib/security/rateLimit";

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const rl = rateLimit({ key: `auth:complete-profile:${userId}:${ip}`, limit: 20, windowMs: 10 * 60 * 1000 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          },
        }
      );
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
       const normalizedPhone = String(phone).trim();
       const existingPhone = await User.findOne({ phone: normalizedPhone, _id: { $ne: userId } });
       if (existingPhone) {
         return NextResponse.json({ error: "This phone number is already registered to another account." }, { status: 409 });
       }
       updateData.phone = normalizedPhone;
    }

    if (!user.password) {
       if (!password) return NextResponse.json({ error: "Password is required." }, { status: 400 });
       const pw = validatePassword(String(password));
       if (!pw.ok) return NextResponse.json({ error: pw.error }, { status: 400 });
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
