import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { syncVolunteerOrg } from "@/lib/sync/volunteerOrg";
import { invalidatePrefix } from "@/lib/server-cache";
import { logSystemAction } from "@/lib/audit";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

function authorize(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization") || "";
  return auth === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncVolunteerOrg();

    invalidatePrefix("news:");
    invalidatePrefix("events:");
    invalidatePrefix("home:");
    revalidatePath("/");
    revalidatePath("/news");
    revalidatePath("/events");
    revalidatePath("/programs");

    await logSystemAction({
      action: "sync.volunteer_org",
      targetType: "sync",
      actorName: "cron",
      meta: result,
    });

    return NextResponse.json({ ok: true, result });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Sync failed";
    await logSystemAction({
      action: "sync.volunteer_org.error",
      targetType: "sync",
      actorName: "cron",
      meta: { message },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
