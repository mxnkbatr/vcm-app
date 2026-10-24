import { connectToDB } from "@/lib/db";
import AuditLog from "@/lib/models/AuditLog";
import { getAuthUser } from "@/lib/authHelpers";

export async function logAdminAction({
  action,
  targetType,
  targetId = "",
  meta,
}: {
  action: string;
  targetType: string;
  targetId?: string;
  meta?: any;
}) {
  try {
    await connectToDB();
    const actor = await getAuthUser();
    await AuditLog.create({
      actorUserId: actor?._id,
      actorName: actor?.fullName || actor?.email || "Admin",
      actorRole: actor?.role || "",
      action,
      targetType,
      targetId,
      meta,
    });
  } catch {
    // Never block main operation due to logging failure.
  }
}

export async function logSystemAction({
  action,
  targetType,
  targetId = "",
  meta,
  actorName = "system",
}: {
  action: string;
  targetType: string;
  targetId?: string;
  meta?: unknown;
  actorName?: string;
}) {
  try {
    await connectToDB();
    await AuditLog.create({
      actorName,
      actorRole: "system",
      action,
      targetType,
      targetId,
      meta,
    });
  } catch {
    // Never block main operation due to logging failure.
  }
}

