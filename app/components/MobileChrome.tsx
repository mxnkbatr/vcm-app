"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { Link, usePathname, useRouter } from "@/navigation";
import { useLocale } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home, Plane, Ticket, BookOpen, Bell, X, User, ShoppingBag, ClipboardList,
} from "lucide-react";
import { useSession } from "@/lib/hooks/useSession";
import { formatRelativeTime } from "@/lib/format-time";
import { hapticImpact } from "@/lib/haptics";
import { ImpactStyle } from "@capacitor/haptics";
import { isNativeApp } from "@/lib/native-perf";
import { springNative } from "@/lib/motion";

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

function NotifIcon({ type }: { type: string }) {
  const Icon =
    type.includes("event") ? Ticket
    : type.includes("course") || type.includes("lesson") ? BookOpen
    : type.includes("order") || type.includes("shop") ? ShoppingBag
    : type.includes("application") ? ClipboardList
    : Bell;
  return <Icon size={16} strokeWidth={1.75} />;
}

export default function MobileChrome() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [showNotif, setShowNotif] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dockCompact, setDockCompact] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [bounceId, setBounceId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<
    Array<{ _id: string; type: string; title: string; body: string; createdAt: string; readAt?: string | null }>
  >([]);
  const [notifLoading, setNotifLoading] = useState(false);

  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const nativeApp = isMounted && isNativeApp();
  const visible = !AUTH_PATHS.some((p) => pathname.includes(p));

  const tabs = nativeApp
    ? [
        TABS[0],
        TABS[1],
        { id: "events", href: "/events", label: { en: "Events", mn: "Эвент" }, Icon: Ticket },
        TABS[4],
      ]
    : TABS;

  useEffect(() => {
    const routes = nativeApp
      ? ["/", "/programs", "/events", "/profile"]
      : ["/", "/programs", "/shop", "/events", "/lessons", "/profile"];
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

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    fetch("/api/user/notifications", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { notifications: [] }))
      .then((d) => {
        if (!cancelled) setNotifications(d.notifications || []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [status]);

  useEffect(() => {
    const onRefresh = () => {
      if (status !== "authenticated") return;
      fetch("/api/user/notifications", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : { notifications: [] }))
        .then((d) => setNotifications(d.notifications || []))
        .catch(() => {});
    };
    window.addEventListener("vcm:notifications-changed", onRefresh);
    return () => window.removeEventListener("vcm:notifications-changed", onRefresh);
  }, [status]);

  useEffect(() => {
    if (!showNotif || status !== "authenticated") return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setNotifLoading(true);
    });
    fetch("/api/user/notifications", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { notifications: [] }))
      .then((d) => {
        if (!cancelled) setNotifications(d.notifications || []);
      })
      .catch(() => {
        if (!cancelled) setNotifications([]);
      })
      .finally(() => {
        if (!cancelled) setNotifLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [showNotif, status]);

  useEffect(() => {
    queueMicrotask(() => setShowNotif(false));
  }, [pathname]);

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
      setScrolled(y > 28);
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

  const visibleNotifications = status === "authenticated" ? notifications : [];
  const unreadCount = visibleNotifications.filter((n) => !n.readAt).length;
  const user = session?.user as { name?: string; image?: string } | undefined;
  const initial = (user?.name || "V").charAt(0).toUpperCase();

  return (
    <>
      <header className={`ios-chrome-header lg:hidden ${scrolled ? "is-solid is-compact" : ""}`}>
        <div className="ios-chrome-header__bar">
          <span className="ios-chrome-header__spacer" aria-hidden />
          <span className="ios-chrome-header__title">{pageTitle || "VCM"}</span>
          <div className="ios-chrome-header__actions">
            <button
              type="button"
              onClick={() => setShowNotif((v) => !v)}
              className="ios-icon-btn glass-press"
              aria-label="Мэдэгдэл"
            >
              <Bell size={22} strokeWidth={1.75} />
              {unreadCount > 0 && !showNotif && (
                <span className="ios-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
              )}
            </button>
            <Link href="/profile" prefetch className="ios-icon-btn glass-press" aria-label="Профайл">
              <span className="ios-avatar-btn">{initial}</span>
            </Link>
          </div>
        </div>
      </header>

      {!showNotif && (
        <>
          <div className="ios-dock-fade lg:hidden" aria-hidden />
          <motion.nav
            className={`ios-tabbar liquid-glass-dock lg:hidden ${tabs.length === 4 ? "cols-4" : "cols-5"} ${dockCompact ? "is-compact" : ""}`}
            aria-label="Үндсэн цэс"
            animate={{
              height: dockCompact ? 52 : 64,
              paddingTop: dockCompact ? 4 : 4,
              paddingBottom: dockCompact ? 4 : 4,
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
                    void hapticImpact(ImpactStyle.Light);
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
                    animate={bounceId === id ? { y: [0, -4, 0], scale: [1, 1.12, 1] } : { y: 0, scale: 1 }}
                    transition={springNative}
                  >
                    <Icon size={dockCompact ? 26 : 24} strokeWidth={active ? 2 : 1.75} />
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
      )}

      <AnimatePresence>
        {showNotif && (
          <motion.div
            key="notif"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={springNative}
            className="ios-notif-panel liquid-glass-panel fixed right-3 z-[120] lg:hidden overflow-hidden"
            style={{
              top: "calc(env(safe-area-inset-top, 0px) + 52px)",
              width: "min(320px, calc(100vw - 24px))",
            }}
          >
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "0.5px solid var(--sep)" }}>
              <span className="ios-headline">Мэдэгдэл</span>
              <button type="button" onClick={() => setShowNotif(false)} className="ios-icon-btn" aria-label="Хаах">
                <X size={18} strokeWidth={1.75} />
              </button>
            </div>
            {status !== "authenticated" ? (
              <div className="px-4 py-6 text-center">
                <p className="ios-footnote">Мэдэгдэл харахын тулд нэвтэрнэ үү</p>
                <Link href="/sign-in" onClick={() => setShowNotif(false)} className="inline-flex min-h-[44px] items-center ios-headline" style={{ color: "var(--blue)" }}>
                  Нэвтрэх
                </Link>
              </div>
            ) : notifLoading ? (
              <div className="px-4 py-4 space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="ios-skel h-12" />)}
              </div>
            ) : visibleNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="ios-headline">Мэдэгдэл байхгүй</p>
                <p className="ios-footnote mt-1">Шинэ мэдээлэл энд харагдана</p>
              </div>
            ) : (
              visibleNotifications.slice(0, 8).map((n) => (
                <div key={n._id} className="flex items-start gap-3 px-4 py-3" style={{ borderTop: "0.5px solid var(--sep)" }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "var(--blue-light)", color: "var(--blue)" }}>
                    <NotifIcon type={n.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="ios-headline" style={{ fontSize: 15 }}>{n.title || "VCM"}</p>
                    <p className="ios-footnote mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="ios-caption mt-1">{formatRelativeTime(n.createdAt, locale)}</p>
                  </div>
                  {!n.readAt && <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: "var(--blue)" }} />}
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
