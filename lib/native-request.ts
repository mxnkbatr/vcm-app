import type { NextRequest } from "next/server";
import { NATIVE_COOKIE, NATIVE_UA_MARKER } from "@/lib/native-constants";

/** True for Capacitor iOS/Android requests (User-Agent and/or cookie). */
export function isNativeRequest(req: NextRequest): boolean {
  const ua = req.headers.get("user-agent") || "";
  if (ua.includes(NATIVE_UA_MARKER)) return true;
  return req.cookies.get(NATIVE_COOKIE)?.value === "1";
}

/** Paths that expose shop checkout or digital LMS on web — blocked on native. */
export function isNativeBlockedPath(pathWithoutLocale: string): boolean {
  const blocked = ["/lessons", "/shop", "/cart", "/dashboard"];
  return blocked.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`)
  );
}

export function isNativeBlockedApi(pathname: string): boolean {
  return (
    pathname.startsWith("/api/lms") ||
    pathname.startsWith("/api/lessons") ||
    pathname.startsWith("/api/qpay") ||
    pathname.startsWith("/api/purchases")
  );
}
