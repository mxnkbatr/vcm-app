import type { User as SupabaseUser } from "@supabase/supabase-js";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";
import { isPhoneAuthEmail } from "@/lib/auth-phone";
import { metadataFromDbUser } from "@/lib/authMetadata";
import type { AuthMetadata } from "@/lib/authJwt";

export { isProfileComplete } from "@/lib/profileComplete";

export async function syncAuthMetadata(supabaseId: string, data: AuthMetadata) {
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    await admin.auth.admin.updateUserById(supabaseId, {
      user_metadata: data,
    });
    await admin
      .from("profiles")
      .update({
        full_name: data.full_name,
        phone: data.phone,
        role: data.role,
        profile_complete: data.profile_complete,
        updated_at: new Date().toISOString(),
      })
      .eq("id", supabaseId);
  } catch (error) {
    console.warn("Auth metadata sync skipped:", error);
  }
}

/** @deprecated Use syncAuthMetadata with metadataFromDbUser */
export async function syncProfileMetadata(
  supabaseId: string,
  data: { full_name?: string; phone?: string; profile_complete?: boolean }
) {
  await syncAuthMetadata(supabaseId, data);
}

async function maybeSyncMetadata(supabaseUser: SupabaseUser, dbUser: Parameters<typeof metadataFromDbUser>[0]) {
  const meta = supabaseUser.user_metadata ?? {};
  if (!meta.mongo_user_id) {
    await syncAuthMetadata(supabaseUser.id, metadataFromDbUser(dbUser));
  }
}

export async function ensureMongoUser(supabaseUser: SupabaseUser) {
  await connectToDB();

  let dbUser = await User.findOne({ supabaseId: supabaseUser.id });
  if (dbUser) {
    await maybeSyncMetadata(supabaseUser, dbUser);
    return dbUser;
  }

  const meta = supabaseUser.user_metadata ?? {};

  if (supabaseUser.email) {
    dbUser = await User.findOne({
      $or: [{ email: supabaseUser.email }, { googleId: supabaseUser.id }],
    });
    if (dbUser) {
      dbUser.supabaseId = supabaseUser.id;
      if (!dbUser.email && supabaseUser.email) dbUser.email = supabaseUser.email;
      if (!dbUser.fullName && meta.full_name) dbUser.fullName = meta.full_name;
      if (!dbUser.photo && meta.avatar_url) dbUser.photo = meta.avatar_url;
      await dbUser.save();
      await maybeSyncMetadata(supabaseUser, dbUser);
      return dbUser;
    }
  }

  if (meta.phone) {
    dbUser = await User.findOne({ phone: String(meta.phone).trim() });
    if (dbUser) {
      dbUser.supabaseId = supabaseUser.id;
      await dbUser.save();
      await maybeSyncMetadata(supabaseUser, dbUser);
      return dbUser;
    }
  }

  const created = await User.create({
    supabaseId: supabaseUser.id,
    email: isPhoneAuthEmail(supabaseUser.email) ? undefined : supabaseUser.email,
    phone: meta.phone ? String(meta.phone).trim() : undefined,
    fullName: meta.full_name || supabaseUser.email?.split("@")[0] || "New User",
    photo: meta.avatar_url || "",
    authProvider:
      supabaseUser.app_metadata?.provider === "google" ? "google" : "credentials",
    role: "guest",
  });

  await syncAuthMetadata(supabaseUser.id, metadataFromDbUser(created));
  return created;
}
