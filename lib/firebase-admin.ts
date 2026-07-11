import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getMessaging, type MulticastMessage } from "firebase-admin/messaging";

function getPrivateKey() {
  const raw = process.env.FIREBASE_PRIVATE_KEY;
  if (!raw) return null;
  return raw.replace(/\\n/g, "\n");
}

export function getFirebaseAdminApp(): App | null {
  if (getApps().length > 0) return getApps()[0]!;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = getPrivateKey();

  if (!projectId || !clientEmail || !privateKey) return null;

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    projectId,
  });
}

export function isFirebasePushConfigured() {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
  );
}

export type FcmPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

export async function sendFcmMulticast(tokens: string[], payload: FcmPayload) {
  const app = getFirebaseAdminApp();
  if (!app || tokens.length === 0) return { success: 0, invalidTokens: [] as string[] };

  const messaging = getMessaging(app);
  const message: MulticastMessage = {
    tokens,
    notification: { title: payload.title, body: payload.body },
    data: payload.data ?? {},
    android: { priority: "high", notification: { sound: "default" } },
    apns: { payload: { aps: { sound: "default" } } },
    webpush: {
      fcmOptions: { link: process.env.NEXT_PUBLIC_APP_URL || "/" },
    },
  };

  const result = await messaging.sendEachForMulticast(message);
  const invalidTokens: string[] = [];

  result.responses.forEach((res, i) => {
    if (res.success) return;
    const code = res.error?.code;
    if (
      code === "messaging/invalid-registration-token" ||
      code === "messaging/registration-token-not-registered"
    ) {
      invalidTokens.push(tokens[i]!);
    }
  });

  return { success: result.successCount, invalidTokens };
}
