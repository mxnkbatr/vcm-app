import { getAuthSession } from "@/lib/authHelpers";

export type AppRole =
  | "guest"
  | "volunteer"
  | "general_and"
  | "general_edu"
  | "general_vclub"
  | "admin";

export async function requireSession() {
  const session = await getAuthSession();
  if (!session?.userId) {
    return null;
  }
  return session;
}

export async function requireNonGuest() {
  const session = await requireSession();
  if (!session) return null;
  if ((session.role as AppRole) === "guest") return null;
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  if (!session) return null;
  if ((session.role as AppRole) !== "admin") return null;
  return session;
}

