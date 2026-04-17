"use client";

import React, { useMemo } from "react";
import { Link, usePathname } from "@/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ShoppingBag,
  Calendar,
  Newspaper,
  Briefcase,
  ClipboardList,
  Settings,
} from "lucide-react";

const NAV = [
  { id: "dashboard", label: "Dashboard", href: "/admin", Icon: LayoutDashboard },
  { id: "users", label: "Users", href: "/admin?tab=users", Icon: Users },
  { id: "lms", label: "Lessons", href: "/admin?tab=lessons", Icon: BookOpen },
  { id: "shop", label: "Shop", href: "/admin?tab=shop", Icon: ShoppingBag },
  { id: "events", label: "Events", href: "/admin?tab=events", Icon: Calendar },
  { id: "news", label: "News", href: "/admin?tab=news", Icon: Newspaper },
  { id: "opps", label: "Opportunities", href: "/admin?tab=opportunities", Icon: Briefcase },
  { id: "apps", label: "Applications", href: "/admin?tab=applications", Icon: ClipboardList },
  { id: "settings", label: "Settings", href: "/admin?tab=settings", Icon: Settings },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const active = useMemo(() => {
    // Keep it simple: /admin highlights dashboard; tabs are handled by page itself.
    return pathname.startsWith("/admin") ? "dashboard" : "";
  }, [pathname]);

  return (
    <div className="min-h-dvh bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          <aside className="hidden lg:block">
            <div className="card p-3 sticky top-6">
              <div className="px-3 py-2">
                <div className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--label3)" }}>
                  Admin
                </div>
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
                      className={`press flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                        isActive ? "bg-[var(--fill2)]" : "hover:bg-[var(--fill3)]"
                      }`}
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

