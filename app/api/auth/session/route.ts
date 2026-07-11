import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthSession } from "@/lib/authHelpers";

export async function GET() {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: session.userId,
      name: session.name,
      email: session.email,
      image: session.image,
      role: session.role,
      phone: session.phone,
      profileComplete: session.profileComplete,
    },
  });
}

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.refreshSession();
  return GET();
}
