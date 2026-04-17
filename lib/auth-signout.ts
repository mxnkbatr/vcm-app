"use client";

import { signOut } from "next-auth/react";

/**
 * Reliable sign-out with next-intl (`localePrefix: always`):
 * `callbackUrl` alone can fail to land on `/[locale]/sign-in`.
 * We clear the session then hard-navigate so the user always hits the login screen.
 */
export async function signOutToSignIn(locale: string) {
  const target = `/${locale}/sign-in`;
  try {
    await signOut({ redirect: false });
  } catch {
    /* still navigate away */
  }
  if (typeof window !== "undefined") {
    window.location.assign(target);
  }
}
