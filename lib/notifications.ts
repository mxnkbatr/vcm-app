import { connectToDB } from "@/lib/db";
import Notification from "@/lib/models/Notification";
import User from "@/lib/models/User";
import { sendFcmMulticast } from "@/lib/firebase-admin";

export type CreateNotificationInput = {
  userId: string;
  type: string;
  title: string;
  body: string;
  payload?: Record<string, unknown>;
};

/** In-app notification + Firebase Cloud Messaging push. */
export async function createUserNotification(input: CreateNotificationInput) {
  await connectToDB();

  await Notification.create({
    userId: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    payload: input.payload ?? {},
  });

  await sendPushToUser(input.userId, {
    title: input.title,
    body: input.body,
    data: stringifyData({ type: input.type, ...(input.payload || {}) }),
  });
}

function stringifyData(data: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined || v === null) continue;
    out[k] = typeof v === "string" ? v : JSON.stringify(v);
  }
  return out;
}

async function sendPushToUser(
  userId: string,
  message: { title: string; body: string; data?: Record<string, string> }
) {
  const user = await User.findById(userId).select("deviceTokens settings").lean();
  if (!user || (user as { settings?: { notificationsEnabled?: boolean } }).settings?.notificationsEnabled === false) {
    return;
  }

  const tokens = ((user as { deviceTokens?: { token: string }[] }).deviceTokens || [])
    .map((t) => t.token)
    .filter(Boolean);

  if (!tokens.length) return;

  try {
    const { invalidTokens } = await sendFcmMulticast(tokens, message);
    if (invalidTokens.length > 0) {
      await User.findByIdAndUpdate(userId, {
        $pull: { deviceTokens: { token: { $in: invalidTokens } } },
      });
    }
  } catch (error) {
    console.warn("FCM send failed:", error);
  }
}
