// lib/authHelpers.ts
// Server-side auth helper to replace Clerk's auth() pattern
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";

/**
 * Get the authenticated user from the session.
 * Returns null if not authenticated.
 * Use this to replace all `auth()` / `currentUser()` from Clerk.
 */
export async function getAuthUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const userId = (session.user as any).id;
  if (!userId) return null;

  await connectToDB();
  const user = await User.findById(userId);
  return user;
}

/**
 * Get just the session user ID (lightweight, no DB call).
 * Use this to replace `const { userId } = await auth()` from Clerk.
 */
export async function getAuthUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.id || null;
}

/**
 * Get the session with role info (no DB call).
 */
export async function getAuthSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return {
    userId: (session.user as any).id as string,
    role: (session.user as any).role as string,
    phone: (session.user as any).phone as string,
    name: session.user.name,
    email: session.user.email,
  };
}
