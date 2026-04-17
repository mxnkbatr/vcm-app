import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(1).optional(),

  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),

  // LiveKit (server token generation + client connection)
  LIVEKIT_API_KEY: z.string().optional(),
  LIVEKIT_API_SECRET: z.string().optional(),
  NEXT_PUBLIC_LIVEKIT_URL: z.string().optional(),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  // Keep error readable in server logs.
  throw new Error(
    "Invalid environment variables:\n" +
      JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)
  );
}

export const env = parsed.data;

export function requireNextAuthSecret() {
  if (env.NODE_ENV !== "production") {
    return env.NEXTAUTH_SECRET ?? "temporary-dev-secret-change-me";
  }
  if (!env.NEXTAUTH_SECRET) {
    throw new Error("NEXTAUTH_SECRET is required in production");
  }
  return env.NEXTAUTH_SECRET;
}

