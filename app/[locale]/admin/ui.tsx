"use client";

import React, { useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/navigation";
import {
  ADMIN_TABS,
  adminTabById,
  adminTabHref,
  type AdminTabId,
} from "@/lib/admin-nav";
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
  const tab = (sp.get("tab") as AdminTabId) || "dashboard";

  const active: AdminTabId = useMemo(() => {
    if (ADMIN_TABS.some((t) => t.id === tab)) return tab;
    return "dashboard";
  }, [tab]);

  const current = adminTabById(active);

  const programs = useAdminResource<any>("/api/admin/programs", active === "programs" || active === "applications");
  const events = useAdminResource<any>("/api/admin/events", active === "events");
  const news = useAdminResource<any>("/api/admin/news", active === "news");
  const banners = useAdminResource<any>("/api/admin/banners", active === "banners");
  const applications = useAdminResource<any>("/api/admin/applications?status=all", active === "applications");
  const promos = useAdminResource<any>("/api/admin/promo-codes", active === "promos");
  const lessons = useAdminResource<any>("/api/admin/lessons", active === "lessons");

  return (
    <div className="space-y-4 lg:space-y-5 admin-content">
      {/* Tablet/desktop tab strip — mobile uses bottom nav + menu sheet */}
      <div className="hidden md:block card p-3 lg:p-4">
        <div className="flex flex-col gap-3">
          <div className="hidden lg:block">
            <div className="t-title2">{current.label}</div>
            <div className="t-caption">{current.description}</div>
          </div>
          <div className="admin-scroll-tabs">
            {ADMIN_TABS.map(({ id, shortLabel, Icon }) => {
              const on = id === active;
              return (
                <Link
                  key={id}
                  href={adminTabHref(id)}
                  className={`admin-scroll-tabs__item ${on ? "on" : ""}`}
                >
                  <Icon size={15} />
                  <span>{shortLabel}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile section hint */}
      <div className="md:hidden card p-4">
        <div className="t-caption">{current.description}</div>
      </div>

      {active === "dashboard" && <DashboardTab />}
      {active === "users" && <UsersTab />}
      {active === "programs" && (
        programs.loading ? <LoadingCard label="хөтөлбөр" /> :
        <ProgramsManager programs={programs.data} onRefresh={programs.refresh} />
      )}
      {active === "events" && (
        events.loading ? <LoadingCard label="арга хэмжээ" /> :
        <EventsManager events={events.data} onRefresh={events.refresh} />
      )}
      {active === "news" && (
        news.loading ? <LoadingCard label="мэдээ" /> :
        <NewsManager news={news.data} onRefresh={news.refresh} />
      )}
      {active === "banners" && (
        banners.loading ? <LoadingCard label="баннер" /> :
        <BannersManager banners={banners.data} onRefresh={banners.refresh} />
      )}
      {active === "applications" && (
        applications.loading ? <LoadingCard label="өргөдөл" /> :
        <ApplicationsManager
          applications={applications.data}
          programs={programs.data}
          onRefresh={applications.refresh}
        />
      )}
      {active === "lessons" && (
        lessons.loading ? <LoadingCard label="хичээл" /> :
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
        promos.loading ? <LoadingCard label="промо код" /> :
        <PromoCodesManager promos={promos.data} onRefresh={promos.refresh} />
      )}
    </div>
  );
}

function LoadingCard({ label }: { label: string }) {
  return (
    <div className="card p-6">
      <div className="t-headline">{label} ачаалж байна…</div>
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

  if (loading) return <LoadingCard label="статистик" />;
  if (!stats) {
    return (
      <div className="card p-6">
        <div className="t-headline">Статистик ачаалахад алдаа гарлаа</div>
      </div>
    );
  }

  const items = [
    { label: "Нийт хэрэглэгч", value: stats.totalUsers, accent: "var(--blue)" },
    { label: "Нийтлэгдсэн мэдээ", value: stats.blogsPublished, accent: "var(--teal, #2dd4bf)" },
    { label: "Хүлээгдэж буй өргөдөл", value: stats.pendingApplications, accent: "var(--gold, #fbbf24)" },
    { label: "Сурагч", value: stats.studentsCount, accent: "var(--label)" },
    { label: "Админ", value: stats.adminsCount, accent: "var(--emerald)" },
    { label: "Зочин", value: stats.guestsCount, accent: "var(--label2)" },
  ];

  const quickLinks = ADMIN_TABS.filter((t) =>
    ["applications", "users", "programs", "events", "news"].includes(t.id)
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((x) => (
          <div key={x.label} className="card p-4 md:p-5 admin-stat-card">
            <div className="t-caption2 uppercase tracking-widest">{x.label}</div>
            <div className="t-title1 mt-2" style={{ color: x.accent }}>
              {x.value ?? 0}
            </div>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <div className="t-headline mb-3">Хурдан шилжих</div>
        <div className="admin-quick-grid">
          {quickLinks.map(({ id, label, Icon }) => (
            <Link key={id} href={adminTabHref(id)} className="admin-quick-tile press">
              <div className="icon-box-sm" style={{ background: "var(--blue-dim)", color: "var(--blue)" }}>
                <Icon size={18} />
              </div>
              <span className="font-bold text-sm">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
