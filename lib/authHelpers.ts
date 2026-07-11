import { createClient } from "@/lib/supabase/server";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";
import { ensureMongoUser, syncAuthMetadata } from "@/lib/syncUser";
import { sessionFromJwt } from "@/lib/authJwt";
import { sessionFromDbUser, metadataFromDbUser } from "@/lib/authMetadata";
import type { AppSession } from "@/lib/authJwt";

export type { AppSession };
export { sessionFromJwt, appUserFromJwt } from "@/lib/authJwt";

export async function getSupabaseUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

function needsMetadataHydration(meta: Record<string, unknown> | undefined) {
  return !meta?.mongo_user_id;
}

export async function getAuthSession(): Promise<AppSession | null> {
  const supabaseUser = await getSupabaseUser();
  if (!supabaseUser) return null;

  const jwtSession = sessionFromJwt(supabaseUser);
  if (jwtSession) return jwtSession;

  await connectToDB();
  let dbUser = await User.findOne({ supabaseId: supabaseUser.id });
  if (!dbUser) {
    dbUser = await ensureMongoUser(supabaseUser);
  }
  if (!dbUser) return null;

  void syncAuthMetadata(supabaseUser.id, metadataFromDbUser(dbUser));
  return sessionFromDbUser(dbUser);
}

/** Lightweight: reads mongo_user_id from JWT when available. */
export async function getAuthUserId(): Promise<string | null> {
  const supabaseUser = await getSupabaseUser();
  if (!supabaseUser) return null;

  const mongoId = supabaseUser.user_metadata?.mongo_user_id as string | undefined;
  if (mongoId) return mongoId;

  const session = await getAuthSession();
  return session?.userId ?? null;
}

/** Full Mongo user document for routes that need DB fields. */
export async function getAuthUser() {
  const supabaseUser = await getSupabaseUser();
  if (!supabaseUser) return null;

  const meta = supabaseUser.user_metadata ?? {};
  await connectToDB();

  if (meta.mongo_user_id) {
    const user = await User.findById(String(meta.mongo_user_id));
    if (user) return user;
  }

  let dbUser = await User.findOne({ supabaseId: supabaseUser.id });
  if (!dbUser) {
    dbUser = await ensureMongoUser(supabaseUser);
  }
  if (!dbUser) return null;

  if (needsMetadataHydration(meta)) {
    void syncAuthMetadata(supabaseUser.id, metadataFromDbUser(dbUser));
  }

  return dbUser;
}
