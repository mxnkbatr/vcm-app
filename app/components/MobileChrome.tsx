"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { Link, usePathname, useRouter } from "@/navigation";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import {
  Home, Plane, Ticket, BookOpen, User, ShoppingBag,
} from "lucide-react";
import { useSession } from "@/lib/hooks/useSession";
import { hapticSelection } from "@/lib/haptics";
import { isNativeApp } from "@/lib/native-perf";
import { springNative } from "@/lib/motion";
import { isTabRoute } from "@/lib/navigation-motion";
import AppHeader from "@/app/components/AppHeader";
import { nativeShare } from "@/lib/native-share";

type Tab = {
  id: string;
  href: string;
  label: { en: string; mn: string };
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
};

const TABS: Tab[] = [
  { id: "home", href: "/", label: { en: "Home", mn: "Нүүр" }, Icon: Home },
  { id: "programs", href: "/programs", label: { en: "Programs", mn: "Хөтөлбөр" }, Icon: Plane },
  { id: "shop", href: "/shop", label: { en: "Shop", mn: "Дэлгүүр" }, Icon: ShoppingBag },
  { id: "lessons", href: "/lessons", label: { en: "Learn", mn: "Сургалт" }, Icon: BookOpen },
  { id: "profile", href: "/profile", label: { en: "Profile", mn: "Профайл" }, Icon: User },
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
  const [dockCompact, setDockCompact] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [bounceId, setBounceId] = useState<string | null>(null);
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

  const tabs = nativeApp
    ? [
        TABS[0],
        TABS[1],
        { id: "events", href: "/events", label: { en: "Events", mn: "Эвент" }, Icon: Ticket },
        TABS[2], // shop
        TABS[4],
      ]
    : TABS;

  useEffect(() => {
    const routes = nativeApp
      ? ["/", "/programs", "/events", "/shop", "/profile", "/notifications", "/news"]
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
      setScrolled(y > 40);
      if (y > lastY + 10 && y > 48) setDockCompact(true);
      else if (y < lastY - 8) setDockCompact(false);
      if (y < 12) setDockCompact(false);
      lastY = y;
    };
    onScroll();
    main.addEventListener("scroll", onScroll, { passive: true });
    return () => main.removeEventListener("scroll", onScroll);
  }, [visible, pathname]);

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

      <div className="ios-dock-fade lg:hidden" aria-hidden />
      <motion.nav
        className={`ios-tabbar liquid-glass-dock lg:hidden ${tabs.length === 4 ? "cols-4" : "cols-5"} ${dockCompact ? "is-compact" : ""}`}
        aria-label="Үндсэн цэс"
        animate={{
          height: dockCompact ? 52 : 60,
          paddingTop: 4,
          paddingBottom: 4,
        }}
        transition={springNative}
      >
        {tabs.map(({ id, Icon, href, label }) => {
          const active =
            id === "profile"
              ? pathname === "/profile" || pathname.startsWith("/profile/")
              : pathname === href || (href !== "/" && pathname.startsWith(href));
          const text = locale === "mn" ? label.mn : label.en;
          return (
            <Link
              key={id}
              href={href}
              prefetch
              onTouchStart={() => {
                try { router.prefetch(href); } catch { /* noop */ }
              }}
              onClick={() => {
                void hapticSelection();
                setBounceId(id);
                setTimeout(() => setBounceId(null), 320);
              }}
              className={`ios-tabbar__item glass-press ${active ? "on" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {active && (
                <motion.span
                  layoutId="tab-pill"
                  className="ios-tabbar__pill"
                  transition={springNative}
                />
              )}
              <motion.span
                animate={bounceId === id ? { y: -4, scale: 1.1 } : { y: 0, scale: 1 }}
                transition={
                  bounceId === id
                    ? { type: "spring", stiffness: 520, damping: 28, mass: 0.7 }
                    : { duration: 0.16 }
                }
              >
                <Icon size={22} strokeWidth={active ? 2 : 1.75} />
              </motion.span>
              <motion.span
                className="ios-tabbar__label"
                animate={{ opacity: dockCompact ? 0 : 1, height: dockCompact ? 0 : "auto" }}
                transition={{ duration: 0.18 }}
              >
                {text}
              </motion.span>
            </Link>
          );
        })}
      </motion.nav>
    </>
  );
}
