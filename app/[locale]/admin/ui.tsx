"use client";

import React, { useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  LayoutDashboard, Users, BookOpen, ShoppingBag, GraduationCap,
  Calendar, Newspaper, ClipboardList, Plane, Tag, ImageIcon,
} from "lucide-react";
import UsersTab from "./users";
import LessonsManager from "@/app/components/admin/LessonsManager";
import ShoppingManager from "@/app/components/admin/ShoppingManager";
import PurchasesManager from "@/app/components/admin/PurchasesManager";
import ProgramsManager from "@/app/components/admin/ProgramsManager";
import EventsManager from "@/app/components/admin/EventsManager";
import NewsManager from "@/app/components/admin/NewsManager";
import ApplicationsManager from "@/app/components/admin/ApplicationsManager";
import PromoCodesManager from "@/app/components/admin/PromoCodesManager";
import BannersManager from "@/app/components/admin/BannersManager";
import LmsAdmin from "./lms";

type TabId =
  | "dashboard" | "users" | "programs" | "events" | "news" | "applications"
  | "lessons" | "lms" | "shop" | "promos" | "banners";

const TABS: Array<{ id: TabId; label: string; Icon: React.ComponentType<{ size?: number }> }> = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "users", label: "Users", Icon: Users },
  { id: "programs", label: "Programs", Icon: Plane },
  { id: "applications", label: "Apps", Icon: ClipboardList },
  { id: "events", label: "Events", Icon: Calendar },
  { id: "news", label: "News", Icon: Newspaper },
  { id: "banners", label: "Banner", Icon: ImageIcon },
  { id: "lessons", label: "Lessons", Icon: BookOpen },
  { id: "lms", label: "LMS", Icon: GraduationCap },
  { id: "shop", label: "Shop", Icon: ShoppingBag },
  { id: "promos", label: "Promo", Icon: Tag },
];

function useAdminResource<T>(url: string, active: boolean) {
  const [data, setData] = React.useState<T[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = useCallback(() => {
    if (!active) return;
    setLoading(true);
    fetch(url)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setData(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, [url, active]);

  React.useEffect(() => { refresh(); }, [refresh]);

  return { data, loading, refresh };
}

export default function AdminClient() {
  const sp = useSearchParams();
  const tab = (sp.get("tab") as TabId) || "dashboard";

  const active: TabId = useMemo(() => {
    if (TABS.some((t) => t.id === tab)) return tab;
    return "dashboard";
  }, [tab]);

  const programs = useAdminResource<any>("/api/admin/programs", active === "programs" || active === "applications");
  const events = useAdminResource<any>("/api/admin/events", active === "events");
  const news = useAdminResource<any>("/api/admin/news", active === "news");
  const banners = useAdminResource<any>("/api/admin/banners", active === "banners");
  const applications = useAdminResource<any>("/api/admin/applications?status=all", active === "applications");
  const promos = useAdminResource<any>("/api/admin/promo-codes", active === "promos");
  const lessons = useAdminResource<any>("/api/admin/lessons", active === "lessons");

  return (
    <div className="space-y-5 pb-8">
      <div className="card p-4">
        <div className="flex flex-col gap-4">
          <div>
            <div className="t-title2">Admin</div>
            <div className="t-caption">Бүх контент, хэрэглэгч, өргөдөл удирдах</div>
          </div>
          <div className="seg flex flex-wrap gap-1">
            {TABS.map(({ id, label, Icon }) => {
              const on = id === active;
              return (
                <a
                  key={id}
                  href={id === "dashboard" ? "/admin" : `/admin?tab=${id}`}
                  className={`seg-item ${on ? "on" : ""}`}
                >
                  <span className="inline-flex items-center gap-1.5">
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
      {active === "programs" && (
        programs.loading ? <LoadingCard label="programs" /> :
        <ProgramsManager programs={programs.data} onRefresh={programs.refresh} />
      )}
      {active === "events" && (
        events.loading ? <LoadingCard label="events" /> :
        <EventsManager events={events.data} onRefresh={events.refresh} />
      )}
      {active === "news" && (
        news.loading ? <LoadingCard label="news" /> :
        <NewsManager news={news.data} onRefresh={news.refresh} />
      )}
      {active === "banners" && (
        banners.loading ? <LoadingCard label="banners" /> :
        <BannersManager banners={banners.data} onRefresh={banners.refresh} />
      )}
      {active === "applications" && (
        applications.loading ? <LoadingCard label="applications" /> :
        <ApplicationsManager
          applications={applications.data}
          programs={programs.data}
          onRefresh={applications.refresh}
        />
      )}
      {active === "lessons" && (
        lessons.loading ? <LoadingCard label="lessons" /> :
        <LessonsManager lessons={lessons.data} onRefresh={lessons.refresh} />
      )}
      {active === "lms" && <LmsAdmin />}
      {active === "shop" && (
        <div className="space-y-4">
          <ShoppingManager />
          <PurchasesManager />
        </div>
      )}
      {active === "promos" && (
        promos.loading ? <LoadingCard label="promos" /> :
        <PromoCodesManager promos={promos.data} onRefresh={promos.refresh} />
      )}
    </div>
  );
}

function LoadingCard({ label }: { label: string }) {
  return (
    <div className="card p-6">
      <div className="t-headline">Loading {label}…</div>
    </div>
  );
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

  if (loading) return <LoadingCard label="stats" />;
  if (!stats) return <div className="card p-6"><div className="t-headline">Failed to load stats</div></div>;

  const items = [
    { label: "Хэрэглэгч", value: stats.totalUsers },
    { label: "Мэдээ", value: stats.blogsPublished },
    { label: "Өргөдөл хүлээгдэж буй", value: stats.pendingApplications },
    { label: "Сурагч", value: stats.studentsCount },
    { label: "Admin", value: stats.adminsCount },
    { label: "Зочин", value: stats.guestsCount },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {items.map((x) => (
        <div key={x.label} className="card p-5">
          <div className="t-caption2 uppercase tracking-widest">{x.label}</div>
          <div className="t-title1 mt-2">{x.value}</div>
        </div>
      ))}
    </div>
  );
}
