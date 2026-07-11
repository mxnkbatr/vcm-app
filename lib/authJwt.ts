import type { User as SupabaseUser } from "@supabase/supabase-js";

export type AppSession = {
  userId: string;
  role: string;
  phone?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  profileComplete: boolean;
};

export type AuthMetadata = {
  mongo_user_id?: string;
  full_name?: string;
  phone?: string;
  role?: string;
  avatar_url?: string;
  profile_complete?: boolean;
  auth_provider?: string;
};

/** Build session from Supabase JWT user_metadata (no Mongo). */
export function sessionFromJwt(supabaseUser: SupabaseUser): AppSession | null {
  const meta = supabaseUser.user_metadata ?? {};
  const mongoUserId = meta.mongo_user_id as string | undefined;
  if (!mongoUserId) return null;

  return {
    userId: mongoUserId,
    role: (meta.role as string) || "guest",
    phone: meta.phone ? String(meta.phone) : undefined,
    name: (meta.full_name as string) || supabaseUser.email?.split("@")[0] || null,
    email: supabaseUser.email ?? null,
    image: (meta.avatar_url as string) || null,
    profileComplete: meta.profile_complete !== false,
  };
}

/** Client-side: map Supabase user → app user without API call. */
export function appUserFromJwt(supabaseUser: SupabaseUser) {
  const session = sessionFromJwt(supabaseUser);
  if (!session) return null;
  return {
    id: session.userId,
    name: session.name,
    email: session.email,
    image: session.image,
    role: session.role,
    phone: session.phone,
    profileComplete: session.profileComplete,
  };
}
