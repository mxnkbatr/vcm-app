import { isProfileComplete } from "@/lib/profileComplete";
import type { AppSession, AuthMetadata } from "@/lib/authJwt";

type DbUserLike = {
  _id: { toString(): string };
  role?: string;
  phone?: string | null;
  fullName?: string | null;
  email?: string | null;
  photo?: string | null;
  password?: string | null;
  authProvider?: string;
};

export function sessionFromDbUser(dbUser: DbUserLike): AppSession {
  return {
    userId: dbUser._id.toString(),
    role: (dbUser.role as string) || "guest",
    phone: dbUser.phone || undefined,
    name: dbUser.fullName,
    email: dbUser.email,
    image: dbUser.photo,
    profileComplete: isProfileComplete(dbUser),
  };
}

export function metadataFromDbUser(dbUser: DbUserLike): AuthMetadata {
  return {
    mongo_user_id: dbUser._id.toString(),
    full_name: dbUser.fullName || undefined,
    phone: dbUser.phone || undefined,
    role: (dbUser.role as string) || "guest",
    avatar_url: dbUser.photo || undefined,
    profile_complete: isProfileComplete(dbUser),
    auth_provider: dbUser.authProvider || undefined,
  };
}
