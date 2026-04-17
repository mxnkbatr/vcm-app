import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import { getAuthUserId } from "@/lib/authHelpers";
import User from "@/lib/models/User";
import { z } from "zod";

const SettingsSchema = z.object({
  notificationsEnabled: z.boolean().optional(),
  marketingEmailsEnabled: z.boolean().optional(),
});

export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDB();
  const user = await User.findById(userId).lean();
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json(
    {
      settings: (user as any).settings || {
        notificationsEnabled: true,
        marketingEmailsEnabled: false,
      },
    },
    { status: 200 }
  );
}

export async function POST(req: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json();
  const parsed = SettingsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await connectToDB();
  const $set: any = {};
  if (typeof parsed.data.notificationsEnabled === "boolean") {
    $set["settings.notificationsEnabled"] = parsed.data.notificationsEnabled;
  }
  if (typeof parsed.data.marketingEmailsEnabled === "boolean") {
    $set["settings.marketingEmailsEnabled"] = parsed.data.marketingEmailsEnabled;
  }

  await User.findByIdAndUpdate(userId, { $set });
  return NextResponse.json({ ok: true }, { status: 200 });
}

