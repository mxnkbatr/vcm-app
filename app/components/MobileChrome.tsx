"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Link, usePathname, useRouter } from "@/navigation";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Plane, LayoutDashboard, Ticket, BookOpen,
  Search, Bell, Menu, X, ChevronRight, ArrowRight,
  User, Settings, LogOut, Info, ShoppingBag,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { signOutToSignIn } from "@/lib/auth-signout";

import { hapticImpact } from "@/lib/haptics";
import { ImpactStyle } from "@capacitor/haptics";

type Tab = { id: string; href: string; label: { en: string; mn: string }; Icon: any; FilledIcon?: any };

const TABS: Tab[] = [
  { id: "home",      href: "/",          label: { en: "Home",     mn: "Нүүр"    }, Icon: Home },
  { id: "programs",  href: "/programs",  label: { en: "Programs", mn: "Хөтөлбөр" }, Icon: Plane },
  { id: "dashboard", href: "/dashboard", label: { en: "Me",       mn: "Миний"   }, Icon: LayoutDashboard },
  { id: "events",    href: "/events",    label: { en: "Events",   mn: "Арга"    }, Icon: Ticket },
  { id: "lessons",   href: "/lessons",   label: { en: "Learn",    mn: "Сургалт" }, Icon: BookOpen },
];

const AUTH_PATHS = ["/sign-in", "/sign-up", "/register"];

const MENU_SECTIONS = [
  {
    title: "Үндсэн",
    items: [
      { label: "Нүүр",       href: "/",          icon: Home },
      { label: "Хөтөлбөр",   href: "/programs",  icon: Plane },
      { label: "Арга хэмжээ",href: "/events",     icon: Ticket },
      { label: "Сургалт",    href: "/lessons",    icon: BookOpen },
      { label: "Дэлгүүр",    href: "/shop",       icon: ShoppingBag },
    ],
  },
  {
    title: "Миний",
    items: [
      { label: "Профайл",    href: "/dashboard",  icon: User },
      { label: "Тохиргоо",   href: "/settings",   icon: Settings },
      { label: "Тухай",      href: "/about",      icon: Info },
    ],
  },
];

import { useCart } from "@/app/context/CartContext";

const PREFETCH_ROUTES = [
  "/",
  "/programs",
  "/programs/apply",
  "/events",
  "/lessons",
  "/dashboard",
  "/shop",
  "/cart",
  "/about",
  "/settings",
  "/profile",
  "/news",
];

export default function MobileChrome() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { items } = useCart();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const [visible, setVisible] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  /* Warm RSC payloads for tab routes — native apps keep screens in memory */
  useEffect(() => {
    const run = () => {
      PREFETCH_ROUTES.forEach((href) => {
        try {
          router.prefetch(href);
        } catch {
          /* noop */
        }
      });
    };
    let idleId: number | undefined;
    let timerId: ReturnType<typeof setTimeout> | undefined;
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(run, { timeout: 1200 });
    } else {
      timerId = setTimeout(run, 350);
    }
    return () => {
      if (idleId != null) window.cancelIdleCallback?.(idleId);
      if (timerId != null) clearTimeout(timerId);
    };
  }, [router]);

  /* Hide on auth pages */
  useEffect(() => {
    setVisible(!AUTH_PATHS.some(p => pathname.includes(p)));
  }, [pathname]);

  /* Close overlays on route change */
  useEffect(() => {
    setShowMenu(false);
    setShowNotif(false);
    setShowSearch(false);
  }, [pathname]);

  if (!isMounted || !visible) return null;

  const user = session?.user as any;

  return (
    <>
      {/* ══════════════ TOP BAR ══════════════ */}
      <div
        className="fixed top-0 left-0 right-0 z-[100] lg:hidden"
        style={{
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          backgroundColor: "var(--glass)",
          borderBottom: "0.5px solid var(--sep)",
          height: "calc(56px + env(safe-area-inset-top))",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        <div className="h-14 px-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" prefetch className="flex items-center gap-2.5 press">
            <div
              className="relative w-8 h-8 overflow-hidden flex-shrink-0"
              style={{ borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}
            >
              <Image
                src="https://res.cloudinary.com/dc127wztz/image/upload/q_auto/f_auto/v1775390339/logos_xs3a5r.png"
                alt="VCM" fill priority sizes="32px" className="object-contain"
              />
            </div>
            <div className="leading-none">
              <div className="text-[13px] font-black tracking-tight" style={{ color: "var(--label)" }}>
                VCM
              </div>
              <div className="text-[10px] font-semibold" style={{ color: "var(--label3)" }}>
                Volunteer Center
              </div>
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Link
              href="/cart"
              prefetch
              className="press w-9 h-9 flex items-center justify-center rounded-full relative"
              style={{ background: "var(--fill2)" }}
            >
              <ShoppingBag size={17} strokeWidth={2.2} style={{ color: "var(--label)" }} />
              {cartCount > 0 && (
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2"
                  style={{ background: "var(--red)", borderColor: "rgba(255,255,255,0.85)" }}
                />
              )}
            </Link>
            <button
              onClick={() => { setShowSearch(true); setShowMenu(false); setShowNotif(false); }}
              className="press w-9 h-9 flex items-center justify-center rounded-full"
              style={{ background: "var(--fill2)" }}
            >
              <Search size={17} strokeWidth={2.2} style={{ color: "var(--label)" }} />
            </button>
            <button
              onClick={() => { setShowNotif(v => !v); setShowMenu(false); setShowSearch(false); }}
              className="press w-9 h-9 flex items-center justify-center rounded-full relative"
              style={{ background: showNotif ? "var(--blue)" : "var(--fill2)" }}
            >
              <Bell size={17} strokeWidth={2.2} style={{ color: showNotif ? "white" : "var(--label)" }} />
            </button>
            <button
              onClick={() => { setShowMenu(v => !v); setShowNotif(false); setShowSearch(false); }}
              className="press w-9 h-9 flex items-center justify-center rounded-full"
              style={{ background: showMenu ? "var(--blue)" : "var(--fill2)" }}
            >
              {showMenu
                ? <X size={17} strokeWidth={2.5} color="white" />
                : <Menu size={17} strokeWidth={2.2} style={{ color: "var(--label)" }} />
              }
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════ BOTTOM TAB BAR ══════════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden">
        <div
          style={{
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            backgroundColor: "var(--glass)",
            borderTop: "0.5px solid var(--sep)",
            paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)",
          }}
        >
          <div className="grid grid-cols-5 w-full">
            {TABS.map(({ id, Icon, href, label }) => {
              const active = pathname === href || (href !== "/" && pathname.startsWith(href));
              const text = locale === "mn" ? label.mn : label.en;

              return (
                <Link
                  key={id}
                  href={href}
                  prefetch
                  onClick={() => hapticImpact(ImpactStyle.Light)}
                  className="press flex flex-col items-center justify-center pt-2 pb-1 relative"
                >
                  {/* Pill background */}
                  {active && (
                    <motion.div
                      layoutId="tabPill"
                      className="absolute inset-x-2 top-1.5 bottom-0.5 rounded-full"
                      style={{ background: "var(--blue-light)" }}
                      transition={{ type: "spring", stiffness: 500, damping: 38 }}
                    />
                  )}
                  <motion.div
                    animate={active ? { scale: 1.08, y: -1 } : { scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="relative z-10"
                  >
                    <Icon
                      size={23}
                      strokeWidth={active ? 2.4 : 1.8}
                      style={{ color: active ? "var(--blue)" : "var(--label3)" }}
                    />
                  </motion.div>
                  <span
                    className="text-[10px] font-bold mt-0.5 relative z-10"
                    style={{
                      color: active ? "var(--blue)" : "var(--label3)",
                      letterSpacing: "-0.2px",
                    }}
                  >
                    {text}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══════════════ SEARCH OVERLAY ══════════════ */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed left-0 right-0 z-[99] lg:hidden px-4 pb-4"
            style={{
              top: "calc(56px + env(safe-area-inset-top))",
              backdropFilter: "blur(28px) saturate(200%)",
              WebkitBackdropFilter: "blur(28px) saturate(200%)",
              backgroundColor: "var(--glass)",
              borderBottom: "0.5px solid var(--sep)",
            }}
          >
            <div className="pt-3">
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ background: "var(--fill2)" }}
              >
                <Search size={16} style={{ color: "var(--label3)", flexShrink: 0 }} />
                <input
                  autoFocus
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="Хайх..."
                  className="flex-1 bg-transparent text-[15px] outline-none"
                  style={{ color: "var(--label)" }}
                />
                {searchQ && (
                  <button onClick={() => setSearchQ("")}>
                    <X size={15} style={{ color: "var(--label3)" }} />
                  </button>
                )}
              </div>
              {/* Quick links */}
              {!searchQ && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    { label: "Хөтөлбөр", href: "/programs" },
                    { label: "Арга хэмжээ", href: "/events" },
                    { label: "Сургалт", href: "/lessons" },
                    { label: "Дэлгүүр", href: "/shop" },
                  ].map(q => (
                    <Link
                      key={q.label}
                      href={q.href}
                      prefetch
                      onClick={() => { setShowSearch(false); setSearchQ(""); }}
                      className="px-3 py-1.5 rounded-xl text-[13px] font-medium press"
                      style={{ background: "var(--fill2)", color: "var(--label2)" }}
                    >
                      {q.label}
                    </Link>
                  ))}
                </div>
              )}
              <button
                onClick={() => { setShowSearch(false); setSearchQ(""); }}
                className="mt-3 w-full text-center text-[13px] font-semibold py-2 press"
                style={{ color: "var(--blue)" }}
              >
                Хаах
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════ NOTIFICATION PANEL ══════════════ */}
      <AnimatePresence>
        {showNotif && (
          <motion.div
            key="notif"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed right-4 z-[99] lg:hidden overflow-hidden"
            style={{
              top: "calc(60px + env(safe-area-inset-top))",
              width: 280,
              borderRadius: "var(--r-2xl)",
              background: "var(--card)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
              border: "0.5px solid var(--sep)",
            }}
          >
            <div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: "var(--sep)" }}>
              <span className="font-bold text-[15px]" style={{ color: "var(--label)" }}>Мэдэгдэл</span>
              <button onClick={() => setShowNotif(false)}>
                <X size={16} style={{ color: "var(--label3)" }} />
              </button>
            </div>
            {[
              { emoji: "🎉", title: "Шинэ арга хэмжээ", sub: "Workshop 2025 — 2 цагийн өмнө" },
              { emoji: "📚", title: "Сургалт нэмэгдлээ", sub: "VCM EDU — өчигдөр" },
              { emoji: "🛍", title: "Захиалга баталгаажлаа", sub: "Дэлгүүрийн захиалга — 2 өдрийн өмнө" },
            ].map((n, i) => (
              <div key={i}>
                <div className="flex items-start gap-3 px-4 py-3 press active:bg-black/5">
                  <div
                    className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: "var(--fill2)" }}
                  >
                    {n.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold" style={{ color: "var(--label)" }}>{n.title}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--label3)" }}>{n.sub}</p>
                  </div>
                </div>
                {i < 2 && <div className="h-px ml-16" style={{ background: "var(--sep)" }} />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════ SLIDE-IN MENU ══════════════ */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="fixed inset-0 z-[98] lg:hidden"
              style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)" }}
            />
            {/* Sheet */}
            <motion.div
              key="menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed top-0 right-0 bottom-0 z-[99] lg:hidden flex flex-col"
              style={{
                width: "80%",
                maxWidth: 320,
                background: "var(--bg)",
                boxShadow: "-8px 0 40px rgba(0,0,0,0.18)",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-4 flex-shrink-0"
                style={{
                  paddingTop: "calc(env(safe-area-inset-top, 16px) + 16px)",
                  borderBottom: "0.5px solid var(--sep)",
                }}
              >
                <div>
                  <p className="font-bold text-[16px]" style={{ color: "var(--label)" }}>VCM</p>
                  <p className="text-[11px]" style={{ color: "var(--label3)" }}>Volunteer Center Mongolia</p>
                </div>
                <button
                  onClick={() => setShowMenu(false)}
                  className="press w-8 h-8 flex items-center justify-center rounded-full"
                  style={{ background: "var(--fill2)" }}
                >
                  <X size={15} style={{ color: "var(--label)" }} />
                </button>
              </div>

              {/* User card */}
              {user && (
                <div className="mx-4 mt-4 flex items-center gap-3 p-3.5 rounded-2xl" style={{ background: "var(--card)", border: "0.5px solid var(--sep)" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[15px]"
                    style={{ background: "var(--blue)" }}>
                    {user.name?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[14px] truncate" style={{ color: "var(--label)" }}>{user.name}</p>
                    <p className="text-[11px] truncate" style={{ color: "var(--label3)" }}>{user.email || user.phone || ""}</p>
                  </div>
                  <ChevronRight size={16} style={{ color: "var(--label3)" }} />
                </div>
              )}

              {/* Nav sections */}
              <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-4 pb-8">
                {MENU_SECTIONS.map(sec => (
                  <div key={sec.title}>
                    <p className="text-[11px] font-semibold uppercase tracking-widest mb-2 px-1"
                      style={{ color: "var(--label3)" }}>
                      {sec.title}
                    </p>
                    <div className="overflow-hidden rounded-2xl" style={{ background: "var(--card)", border: "0.5px solid var(--sep)" }}>
                      {sec.items.map((item, i) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                        return (
                          <div key={item.href}>
                            <Link
                              href={item.href}
                              prefetch
                              className="press flex items-center gap-3 px-4 py-3.5"
                              style={{ background: isActive ? "var(--blue-dim)" : "transparent" }}
                            >
                              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: isActive ? "var(--blue)" : "var(--fill2)" }}>
                                <Icon size={15} color={isActive ? "white" : "var(--label2)"} />
                              </div>
                              <span className="flex-1 text-[14px] font-medium"
                                style={{ color: isActive ? "var(--blue)" : "var(--label)" }}>
                                {item.label}
                              </span>
                              <ChevronRight size={14} style={{ color: "var(--label3)" }} />
                            </Link>
                            {i < sec.items.length - 1 && (
                              <div className="h-px ml-[52px]" style={{ background: "var(--sep)" }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom: sign out */}
              <div className="px-4 flex-shrink-0" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 24px) + 76px)" }}>
                {user ? (
                  <button
                    type="button"
                    onClick={() => void signOutToSignIn(locale)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[14px] font-semibold press"
                    style={{ background: "var(--red-dim)", color: "var(--red)", border: "0.5px solid rgba(239,68,68,0.2)" }}
                  >
                    <LogOut size={16} />
                    Гарах
                  </button>
                ) : (
                  <Link
                    href="/sign-in"
                    prefetch
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[14px] font-semibold text-white press"
                    style={{ background: "var(--blue)" }}
                  >
                    Нэвтрэх <ArrowRight size={15} />
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
