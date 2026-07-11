"use client";

import React, { useMemo } from "react";
import { Link, usePathname } from "@/navigation";
import { useSearchParams } from "next/navigation";
import {
  LayoutDashboard, Users, BookOpen, ShoppingBag, GraduationCap,
  Calendar, Newspaper, ClipboardList, Plane, ImageIcon,
} from "lucide-react";

const NAV = [
  { id: "dashboard", label: "Dashboard", href: "/admin", Icon: LayoutDashboard },
  { id: "users", label: "Users", href: "/admin?tab=users", Icon: Users },
  { id: "programs", label: "Programs", href: "/admin?tab=programs", Icon: Plane },
  { id: "applications", label: "Applications", href: "/admin?tab=applications", Icon: ClipboardList },
  { id: "events", label: "Events", href: "/admin?tab=events", Icon: Calendar },
  { id: "news", label: "News", href: "/admin?tab=news", Icon: Newspaper },
  { id: "banners", label: "Banners", href: "/admin?tab=banners", Icon: ImageIcon },
  { id: "lessons", label: "Lessons", href: "/admin?tab=lessons", Icon: BookOpen },
  { id: "lms", label: "LMS", href: "/admin?tab=lms", Icon: GraduationCap },
  { id: "shop", label: "Shop", href: "/admin?tab=shop", Icon: ShoppingBag },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const sp = useSearchParams();
  const tab = sp.get("tab") || "dashboard";

  const active = useMemo(() => {
    if (!pathname.includes("/admin")) return "";
    return tab;
  }, [pathname, tab]);

  return (
    <div className="min-h-dvh" style={{ background: "var(--bg)", paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 lg:py-6 pb-safe">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          <aside className="hidden lg:block">
            <div className="card p-3 sticky top-6">
              <div className="px-3 py-2">
                <div className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--label3)" }}>Admin</div>
                <div className="t-title3 mt-1">Control Center</div>
              </div>
              <div className="divider my-2" />
              <nav className="space-y-1">
                {NAV.map(({ id, label, href, Icon }) => {
                  const isActive = id === active;
                  return (
                    <Link
                      key={id}
                      href={href}
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
            </div>
          </aside>
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
