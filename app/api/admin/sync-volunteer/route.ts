import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { withAdminAuth } from "@/lib/adminAuth";
import { syncVolunteerOrg } from "@/lib/sync/volunteerOrg";
import { invalidatePrefix } from "@/lib/server-cache";
import { logAdminAction } from "@/lib/audit";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export const POST = withAdminAuth(async () => {
  try {
    const result = await syncVolunteerOrg();

    invalidatePrefix("news:");
    invalidatePrefix("events:");
    invalidatePrefix("home:");
    revalidatePath("/");
    revalidatePath("/news");
    revalidatePath("/events");
    revalidatePath("/programs");

    await logAdminAction({
      action: "sync.volunteer_org",
      targetType: "sync",
      meta: result,
    });

    return NextResponse.json({ ok: true, result });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
