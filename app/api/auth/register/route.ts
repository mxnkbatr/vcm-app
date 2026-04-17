// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import { validatePassword } from "@/lib/security/passwordPolicy";
import { rateLimit } from "@/lib/security/rateLimit";

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const rl = rateLimit({ key: `auth:register:${ip}`, limit: 10, windowMs: 10 * 60 * 1000 });
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

    const { fullName, phone, password } = await req.json();

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Phone and password are required" },
        { status: 400 }
      );
    }

    const pw = validatePassword(String(password));
    if (!pw.ok) return NextResponse.json({ error: pw.error }, { status: 400 });

    await connectToDB();

    // Check if phone already exists
    const normalizedPhone = String(phone).trim();
    const existing = await User.findOne({ phone: normalizedPhone });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this phone number already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      fullName: fullName || "New User",
      phone: normalizedPhone,
      password: hashedPassword,
      authProvider: "credentials",
      role: "guest",
    });

    return NextResponse.json(
      { success: true, userId: user._id.toString() },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}