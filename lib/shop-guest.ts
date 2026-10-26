import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";

export function normalizeShopPhone(phone: string) {
  return String(phone || "").replace(/\D/g, "");
}

/** Logged-in user, or find/create a guest account keyed by phone. */
export async function resolveShopBuyerUserId(opts: {
  authUserId?: string | null;
  phoneNumber: string;
}): Promise<string> {
  if (opts.authUserId) return opts.authUserId;

  const phone = normalizeShopPhone(opts.phoneNumber);
  if (phone.length < 8) {
    throw new Error("PHONE_REQUIRED");
  }

  await connectToDB();
  let user = await User.findOne({ phone });
  if (!user) {
    // Some records store phone with formatting — try digits-only match via regex fallback
    user = await User.findOne({
      $or: [{ phone }, { phone: opts.phoneNumber.trim() }],
    });
  }
  if (!user) {
    user = await User.create({
      phone,
      fullName: `Зочин ${phone.slice(-4)}`,
      role: "guest",
      authProvider: "guest",
    });
  }
  return String(user._id);
}
