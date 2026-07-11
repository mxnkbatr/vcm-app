"use client";

import { createClient } from "@/lib/supabase/client";

export async function signOutToSignIn(locale: string) {
  const target = `/${locale}/sign-in`;
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch {
    /* still navigate away */
  }
  if (typeof window !== "undefined") {
    window.location.assign(target);
  }
}
