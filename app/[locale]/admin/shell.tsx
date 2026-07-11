"use client";

import React, { useMemo, useState } from "react";
import { Link, usePathname } from "@/navigation";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, LayoutGrid, X } from "lucide-react";
import {
  ADMIN_TABS,
  ADMIN_MOBILE_PRIMARY,
  adminTabById,
  adminTabHref,
  type AdminTabId,
} from "@/lib/admin-nav";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const sp = useSearchParams();
  const tab = (sp.get("tab") as AdminTabId) || "dashboard";
  const [menuOpen, setMenuOpen] = useState(false);

  const active = useMemo(() => {
    if (!pathname.includes("/admin")) return "dashboard";
    return ADMIN_TABS.some((t) => t.id === tab) ? tab : "dashboard";
  }, [pathname, tab]);

  const current = adminTabById(active);

  return (
    <div
      className="min-h-dvh admin-shell"
      style={{ background: "var(--bg)", paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      {/* Mobile header */}
      <header className="admin-mobile-header lg:hidden sticky top-0 z-40">
        <div className="admin-mobile-header__inner">
          <Link href="/" className="admin-mobile-header__back press" aria-label="Буцах">
            <ArrowLeft size={20} />
          </Link>
          <div className="min-w-0 flex-1 text-center px-2">
            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--label3)" }}>
              Админ
            </div>
            <div className="t-headline truncate">{current.label}</div>
          </div>
          <button
            type="button"
            className="admin-mobile-header__back press"
            aria-label="Бүх цэс"
            onClick={() => setMenuOpen(true)}
          >
            <LayoutGrid size={20} />
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 lg:py-6 admin-shell__body">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="card p-3 sticky top-6">
              <div className="px-3 py-2">
                <div className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--label3)" }}>
                  Admin
                </div>
                <div className="t-title3 mt-1">Удирдлага</div>
              </div>
              <div className="divider my-2" />
              <nav className="space-y-1">
                {ADMIN_TABS.map(({ id, label, Icon }) => {
                  const isActive = id === active;
                  return (
                    <Link
                      key={id}
                      href={adminTabHref(id)}
                      className={`press flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${isActive ? "bg-[var(--fill2)]" : "hover:bg-[var(--fill3)]"}`}
                      style={{ color: isActive ? "var(--label)" : "var(--label2)" }}
                    >
                      <div className="icon-box-sm" style={{ background: "var(--fill2)", color: "var(--label2)" }}>
                        <Icon size={16} />
                      </div>
                      {label}
                    </Link>
                  );
                })}
              </nav>
              <div className="divider my-2" />
              <Link
                href="/"
                className="press flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold"
                style={{ color: "var(--label2)" }}
              >
                <ArrowLeft size={16} />
                Програм руу буцах
              </Link>
            </div>
          </aside>

          <main className="min-w-0">{children}</main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="admin-bottom-nav lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label="Admin navigation"
      >
        {ADMIN_MOBILE_PRIMARY.map(({ id, shortLabel, Icon }) => {
          const isActive = id === active;
          return (
            <Link
              key={id}
              href={adminTabHref(id)}
              className={`admin-bottom-nav__item press ${isActive ? "on" : ""}`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
              <span>{shortLabel}</span>
            </Link>
          );
        })}
        <button
          type="button"
          className={`admin-bottom-nav__item press ${menuOpen ? "on" : ""}`}
          onClick={() => setMenuOpen(true)}
        >
          <LayoutGrid size={22} />
          <span>Цэс</span>
        </button>
      </nav>

      {/* Mobile menu sheet */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-[80] lg:hidden">
            <motion.button
              type="button"
              aria-label="Хаах"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 340 }}
              className="absolute bottom-0 left-0 right-0 rounded-t-[24px] overflow-hidden"
              style={{
                background: "var(--bg)",
                paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
                maxHeight: "85dvh",
              }}
            >
              <div className="h-1.5 w-10 rounded-full mx-auto my-3" style={{ background: "var(--fill)" }} />
              <div className="px-5 pb-3 flex items-center justify-between">
                <div>
                  <div className="t-title3">Бүх хэсэг</div>
                  <div className="t-caption">Админ удирдлага</div>
                </div>
                <button
                  type="button"
                  className="icon-box-sm press"
                  style={{ background: "var(--fill2)", color: "var(--label2)" }}
                  onClick={() => setMenuOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="px-4 pb-4 overflow-y-auto admin-menu-grid">
                {ADMIN_TABS.map(({ id, label, description, Icon }) => {
                  const isActive = id === active;
                  return (
                    <Link
                      key={id}
                      href={adminTabHref(id)}
                      onClick={() => setMenuOpen(false)}
                      className={`admin-menu-tile press ${isActive ? "on" : ""}`}
                    >
                      <div className="icon-box-sm" style={{ background: "var(--fill2)", color: "var(--blue)" }}>
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm">{label}</div>
                        <div className="text-xs truncate" style={{ color: "var(--label3)" }}>
                          {description}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
