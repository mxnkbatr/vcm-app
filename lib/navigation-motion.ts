/** Route-aware transition presets for native-feel SPA navigation */

export type TransitionKind = "instant" | "push" | "pop" | "modal" | "tab";

const LOCALES = ["en", "mn", "de"] as const;

const TAB_ROOTS = new Set([
  "/",
  "/programs",
  "/shop",
  "/events",
  "/lessons",
  "/profile",
]);

/** Full-screen overlays that still use push chrome */
export const OVERLAY_ROUTES = new Set(["/notifications"]);

/**
 * Immersive stack screens (hero + own RN header).
 * AppHeader is hidden — screen owns back/share chrome.
 */
export function isImmersiveDetail(pathname: string): boolean {
  const path = stripLocale(pathname);
  if (/^\/news\/[^/]+$/.test(path)) return true;
  if (/^\/events\/[^/]+$/.test(path)) return true;
  if (/^\/shop\/[^/]+$/.test(path)) return true;
  if (/^\/programs\/[^/]+$/.test(path)) return true;
  if (/^\/opportunities\/[^/]+$/.test(path)) return true;
  if (/^\/lessons\/[^/]+$/.test(path)) return true;
  if (/^\/lessons\/[^/]+\/[^/]+$/.test(path)) return true;
  return false;
}

/** Routes that slide up like iOS sheets */
const MODAL_ROUTES = new Set([
  "/cart",
  "/settings",
  "/join",
  "/complete-profile",
]);

/**
 * Auth forms must NOT use transform-based page transitions.
 * Safari/Chrome password focus + ancestor transform = blank white screen.
 */
const AUTH_ROUTES = new Set([
  "/sign-in",
  "/sign-up",
  "/register",
]);

export function stripLocale(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length > 0 && (LOCALES as readonly string[]).includes(parts[0])) {
    const rest = parts.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname || "/";
}

function routeDepth(path: string): number {
  if (path === "/") return 0;
  return path.split("/").filter(Boolean).length;
}

function isTabRoot(path: string): boolean {
  return TAB_ROOTS.has(path);
}

function isModalRoute(path: string): boolean {
  if (MODAL_ROUTES.has(path)) return true;
  return [...MODAL_ROUTES].some((r) => path.startsWith(`${r}/`));
}

function isAuthRoute(path: string): boolean {
  if (AUTH_ROUTES.has(path)) return true;
  return [...AUTH_ROUTES].some((r) => path.startsWith(`${r}/`));
}

export function getTransitionKind(from: string, to: string): TransitionKind {
  const fromPath = stripLocale(from);
  const toPath = stripLocale(to);

  if (fromPath === toPath) return "instant";
  if (isTabRoot(fromPath) && isTabRoot(toPath)) return "instant";
  // Never leave translateY/X on auth pages (password keyboard white-screen bug)
  if (isAuthRoute(toPath) || isAuthRoute(fromPath)) return "instant";

  if (isModalRoute(toPath) && !isModalRoute(fromPath)) return "modal";
  if (isModalRoute(fromPath) && !isModalRoute(toPath)) return "pop";

  const fromDepth = routeDepth(fromPath);
  const toDepth = routeDepth(toPath);

  if (toDepth > fromDepth) return "push";
  if (toDepth < fromDepth) return "pop";
  return "push";
}

export function canSwipeBack(pathname: string): boolean {
  const path = stripLocale(pathname);
  if (isTabRoot(path)) return false;
  if (path === "/admin" || path.startsWith("/admin/")) return false;
  return true;
}

export function isTabRoute(pathname: string): boolean {
  return isTabRoot(stripLocale(pathname));
}
