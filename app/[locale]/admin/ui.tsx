"use client";

import React, { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { LayoutDashboard, Users, BookOpen, ShoppingBag, GraduationCap, Calendar } from "lucide-react";
import UsersTab from "./users";
import LessonsManager from "@/app/components/admin/LessonsManager";
import ShoppingManager from "@/app/components/admin/ShoppingManager";
import PurchasesManager from "@/app/components/admin/PurchasesManager";
import LmsAdmin from "./lms";

type TabId = "dashboard" | "users" | "lessons" | "lms" | "shop" | "events";

const TABS: Array<{ id: TabId; label: string; Icon: any }> = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "users", label: "Users", Icon: Users },
  { id: "events", label: "Events", Icon: Calendar },
  { id: "lessons", label: "Lessons", Icon: BookOpen },
  { id: "lms", label: "LMS", Icon: GraduationCap },
  { id: "shop", label: "Shop", Icon: ShoppingBag },
];

export default function AdminClient() {
  const sp = useSearchParams();
  const tab = (sp.get("tab") as TabId) || "dashboard";

  const active: TabId = useMemo(() => {
    if (TABS.some((t) => t.id === tab)) return tab;
    return "dashboard";
  }, [tab]);

  return (
    <div className="space-y-5">
      <div className="card p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="t-title2">Admin</div>
            <div className="t-caption">Manage content, users, and operations</div>
          </div>
          <div className="seg">
            {TABS.map(({ id, label, Icon }) => {
              const on = id === active;
              return (
                <a
                  key={id}
                  href={id === "dashboard" ? "/admin" : `/admin?tab=${id}`}
                  className={`seg-item ${on ? "on" : ""}`}
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon size={14} />
                    {label}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {active === "dashboard" && <DashboardTab />}
      {active === "users" && <UsersTab />}
      {active === "events" && <div className="card p-6"><div className="t-headline">Events Management Coming Soon</div></div>}
      {active === "lessons" && <LessonsTab />}
      {active === "lms" && <LmsAdmin />}
      {active === "shop" && (
        <div className="space-y-4">
          <ShoppingManager />
          <PurchasesManager />
        </div>
      )}
    </div>
  );
}

function LessonsTab() {
  const [lessons, setLessons] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(() => {
    setLoading(true);
    fetch("/api/admin/lessons")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setLessons(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading) {
    return (
      <div className="card p-6">
        <div className="t-headline">Loading lessons…</div>
      </div>
    );
  }

  return <LessonsManager lessons={lessons} onRefresh={refresh} />;
}

function DashboardTab() {
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setStats(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card p-6">
        <div className="t-headline">Loading…</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="card p-6">
        <div className="t-headline">Failed to load stats</div>
      </div>
    );
  }

  const items = [
    { label: "Total users", value: stats.totalUsers },
    { label: "Blogs published", value: stats.blogsPublished },
    { label: "Pending applications", value: stats.pendingApplications },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((x) => (
        <div key={x.label} className="card p-5">
          <div className="t-caption2 uppercase tracking-widest">{x.label}</div>
          <div className="t-title1 mt-2">{x.value}</div>
        </div>
      ))}
    </div>
  );
}

