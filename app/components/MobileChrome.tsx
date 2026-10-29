"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { Link, usePathname, useRouter } from "@/navigation";
import { useLocale } from "next-intl";
import {
  Home, Plane, Ticket, BookOpen, ShoppingBag,
} from "lucide-react";
import { useSession } from "@/lib/hooks/useSession";
import { hapticSelection } from "@/lib/haptics";
import { isNativeApp } from "@/lib/native-perf";
import { isImmersiveDetail, isTabRoute } from "@/lib/navigation-motion";
import AppHeader from "@/app/components/AppHeader";
import { nativeShare } from "@/lib/native-share";

type Tab = {
  id: string;
  href: string;
  label: { en: string; mn: string };
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
};

/** dcapital-style 4-tab dock — profile lives in header avatar */
const TABS: Tab[] = [
  { id: "home", href: "/", label: { en: "Home", mn: "Нүүр" }, Icon: Home },
  { id: "programs", href: "/programs", label: { en: "Programs", mn: "Хөтөлбөр" }, Icon: Plane },
  { id: "shop", href: "/shop", label: { en: "Shop", mn: "Дэлгүүр" }, Icon: ShoppingBag },
  { id: "lessons", href: "/lessons", label: { en: "Learn", mn: "Сургалт" }, Icon: BookOpen },
];

const AUTH_PATHS = ["/sign-in", "/sign-up", "/register", "/admin"];

const TAB_TITLES: Record<string, { mn: string; en: string }> = {
  "/": { mn: "Нүүр", en: "Home" },
  "/programs": { mn: "Хөтөлбөр", en: "Programs" },
  "/shop": { mn: "Дэлгүүр", en: "Shop" },
  "/lessons": { mn: "Сургалт", en: "Learn" },
  "/events": { mn: "Эвент", en: "Events" },
  "/profile": { mn: "Профайл", en: "Profile" },
  "/notifications": { mn: "Мэдэгдэл", en: "Notifications" },
};

function bookmarkKey(path: string) {
  return `vcm-bookmark:${path}`;
}

export default function MobileChrome() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [scrolled, setScrolled] = useState(false);
  const [tabMinimized, setTabMinimized] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [bookmarkVersion, setBookmarkVersion] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const nativeApp = isMounted && isNativeApp();
  const visible = !AUTH_PATHS.some((p) => pathname.includes(p));
  const tabMode = isTabRoute(pathname);
  const immersiveDetail = isImmersiveDetail(pathname);
  // Detail screens: hide tab bar so floating dock doesn't overlap
  const hideTabBar = immersiveDetail || tabMinimized;

  // Native keeps the web order and adds Events (lessons there list free courses only).
  const tabs = nativeApp
    ? [...TABS, { id: "events", href: "/events", label: { en: "Events", mn: "Эвент" }, Icon: Ticket }]
    : TABS;

  useEffect(() => {
    const routes = nativeApp
      ? ["/", "/programs", "/shop", "/lessons", "/events", "/profile", "/notifications", "/news"]
      : ["/", "/programs", "/shop", "/events", "/lessons", "/profile", "/notifications", "/news"];
    const run = () => {
      routes.forEach((href) => {
        try { router.prefetch(href); } catch { /* noop */ }
      });
    };
    let idleId: number | undefined;
    let timerId: ReturnType<typeof setTimeout> | undefined;
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(run, { timeout: 5000 });
    } else {
      timerId = setTimeout(run, 5000);
    }
    return () => {
      if (idleId != null) window.cancelIdleCallback?.(idleId);
      if (timerId != null) clearTimeout(timerId);
    };
  }, [router, nativeApp]);

  const refreshUnread = () => {
    if (status !== "authenticated") {
      setUnreadCount(0);
      return;
    }
    fetch("/api/user/notifications", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { notifications: [] }))
      .then((d) => {
        const list = (d.notifications || []) as Array<{ readAt?: string | null }>;
        setUnreadCount(list.filter((n) => !n.readAt).length);
      })
      .catch(() => {});
  };

  useEffect(() => {
    refreshUnread();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- status gate
  }, [status]);

  useEffect(() => {
    const onRefresh = () => refreshUnread();
    window.addEventListener("vcm:notifications-changed", onRefresh);
    return () => window.removeEventListener("vcm:notifications-changed", onRefresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    const onTitle = (e: Event) => {
      const detail = (e as CustomEvent<{ title?: string }>).detail;
      setPageTitle(detail?.title || "");
    };
    window.addEventListener("vcm:page-title", onTitle);
    return () => window.removeEventListener("vcm:page-title", onTitle);
  }, []);

  useEffect(() => {
    const main = document.querySelector(".native-app-main");
    if (!main) return;
    let lastY = main.scrollTop;
    const onScroll = () => {
      const y = main.scrollTop;
      // Detail pages: wait until past hero before solid title bar (avoids double title)
      setScrolled(y > (tabMode ? 40 : 120));
      const delta = y - lastY;
      if (y < 24) setTabMinimized(false);
      else if (delta > 8 && y > 80) setTabMinimized(true);
      else if (delta < -6) setTabMinimized(false);
      lastY = y;
    };
    onScroll();
    main.addEventListener("scroll", onScroll, { passive: true });
    return () => main.removeEventListener("scroll", onScroll);
  }, [visible, pathname, tabMode]);

  useEffect(() => {
    setTabMinimized(false);
  }, [pathname]);

  if (!isMounted || !visible) return null;

  const user = session?.user as { name?: string; image?: string } | undefined;
  const initial = (user?.name || "V").charAt(0).toUpperCase();

  const tabTitle =
    TAB_TITLES[pathname]?.[locale === "mn" ? "mn" : "en"] ||
    pageTitle ||
    "VCM";
  const headerTitle = tabMode ? tabTitle : pageTitle || tabTitle;
  let bookmarked = false;
  try {
    bookmarked = localStorage.getItem(bookmarkKey(pathname)) === "1";
  } catch {
    bookmarked = false;
  }
  void bookmarkVersion;

  return (
    <>
      <AppHeader
        title={headerTitle}
        scrolled={scrolled}
        unreadCount={unreadCount}
        avatarInitial={initial}
        onSearch={() => window.dispatchEvent(new CustomEvent("vcm:open-search"))}
        onBell={() => router.push("/notifications")}
        onShare={() => {
          void nativeShare({
            title: headerTitle || "VCM",
            url: typeof window !== "undefined" ? window.location.href : undefined,
          });
        }}
        onBookmark={() => {
          try {
            if (bookmarked) localStorage.removeItem(bookmarkKey(pathname));
            else localStorage.setItem(bookmarkKey(pathname), "1");
          } catch {
            /* noop */
          }
          setBookmarkVersion((v) => v + 1);
        }}
        bookmarked={bookmarked}
      />

      <nav
        className={`ios-tabbar ios-tabbar--native ios-tabbar--dc lg:hidden cols-${tabs.length}${hideTabBar ? " is-minimized" : ""}`}
        aria-label="Үндсэн цэс"
        aria-hidden={hideTabBar}
      >
        {tabs.map(({ id, Icon, href, label }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          const text = locale === "mn" ? label.mn : label.en;
          return (
            <Link
              key={id}
              href={href}
              prefetch
              onTouchStart={() => {
                try { router.prefetch(href); } catch { /* noop */ }
              }}
              onClick={() => void hapticSelection()}
              className={`ios-tabbar__item ${active ? "on" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={22} strokeWidth={active ? 2.3 : 1.75} />
              <span className="ios-tabbar__label">{text}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
