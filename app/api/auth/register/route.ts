import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import { validatePassword } from "@/lib/security/passwordPolicy";
import { rateLimit } from "@/lib/security/rateLimit";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePhone } from "@/lib/auth-phone";
import { metadataFromDbUser } from "@/lib/authMetadata";
import { syncAuthMetadata } from "@/lib/syncUser";

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const rl = rateLimit({
      key: `auth:register:${ip}`,
      limit: 10,
      windowMs: 10 * 60 * 1000,
    });
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

    const { fullName, email, phone, password } = await req.json();

    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();
    const normalizedPhone = phone ? normalizePhone(String(phone)) : "";

    if (!normalizedEmail || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!normalizedEmail.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const pw = validatePassword(String(password));
    if (!pw.ok) return NextResponse.json({ error: pw.error }, { status: 400 });

    const authEmail = normalizedEmail;

    await connectToDB();
    const existing = await User.findOne({
      $or: [
        { email: normalizedEmail },
        ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
      ],
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const admin = createAdminClient();
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: authEmail,
      password: String(password),
      email_confirm: true,
      user_metadata: {
        full_name: fullName || "New User",
        ...(normalizedPhone ? { phone: normalizedPhone } : {}),
        profile_complete: true,
      },
    });

    if (authError || !authData.user) {
      const message = authError?.message || "Registration failed";
      if (message.toLowerCase().includes("already")) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: message }, { status: 500 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      supabaseId: authData.user.id,
      fullName: fullName || "New User",
      email: normalizedEmail,
      ...(normalizedPhone ? { phone: normalizedPhone } : {}),
      password: hashedPassword,
      authProvider: "credentials",
      role: "guest",
    });

    await syncAuthMetadata(authData.user.id, metadataFromDbUser(user));

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
