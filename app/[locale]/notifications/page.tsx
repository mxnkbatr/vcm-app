"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { useSession } from "@/lib/hooks/useSession";
import { Link, useRouter } from "@/navigation";
import {
  Bell, Calendar, GraduationCap, Plane, Settings2, ShoppingBag,
} from "lucide-react";
import PremiumPageShell from "@/app/components/PremiumPageShell";
import IOSLargeTitle from "@/app/components/ui/IOSLargeTitle";
import NotificationSwipeRow from "@/app/components/NotificationSwipeRow";
import { formatRelativeTime } from "@/lib/format-time";
import { dismissNotificationId, loadDismissedIds } from "@/lib/notif-dismissed";
import { hapticImpact } from "@/lib/haptics";
import { ImpactStyle } from "@capacitor/haptics";

type Notif = {
  _id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  readAt?: string | null;
};

type GroupKey = "today" | "week" | "earlier";

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

function groupKey(createdAt: string): GroupKey {
  const t = new Date(createdAt).getTime();
  const today = startOfDay();
  if (t >= today) return "today";
  const weekAgo = today - 7 * 24 * 60 * 60 * 1000;
  if (t >= weekAgo) return "week";
  return "earlier";
}

function typeMeta(type: string) {
  const t = (type || "").toLowerCase();
  if (t.includes("event") || t.includes("live")) {
    return { Icon: Calendar, color: "#0A84FF", bg: "rgba(10,132,255,0.14)" };
  }
  if (t.includes("program") || t.includes("application") || t.includes("course") || t.includes("lesson")) {
    return { Icon: t.includes("course") || t.includes("lesson") ? GraduationCap : Plane, color: "#30D158", bg: "rgba(48,209,88,0.14)" };
  }
  if (t.includes("order") || t.includes("shop")) {
    return { Icon: ShoppingBag, color: "#FF9F0A", bg: "rgba(255,159,10,0.14)" };
  }
  if (t.includes("system") || t.includes("admin")) {
    return { Icon: Settings2, color: "#8E8E93", bg: "rgba(142,142,147,0.16)" };
  }
  return { Icon: Bell, color: "#1E5BD8", bg: "rgba(30,91,216,0.14)" };
}

const GROUP_LABEL: Record<GroupKey, string> = {
  today: "Өнөөдөр",
  week: "Энэ долоо хоног",
  earlier: "Өмнө",
};

export default function NotificationsPage() {
  const locale = useLocale();
  const router = useRouter();
  const { status } = useSession();
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setDismissed(loadDismissedIds());
  }, []);

  const load = useCallback(async (soft = false) => {
    if (!soft) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch("/api/user/notifications", { cache: "no-store" });
      if (res.status === 401) {
        setItems([]);
        return;
      }
      const data = await res.json();
      setItems(data.notifications || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }
    void load();
  }, [status, load]);

  useEffect(() => {
    const onChange = () => void load(true);
    window.addEventListener("vcm:notifications-changed", onChange);
    return () => window.removeEventListener("vcm:notifications-changed", onChange);
  }, [load]);

  // Local pull-to-refresh on this page
  useEffect(() => {
    const main = document.querySelector<HTMLElement>(".native-app-main");
    if (!main) return;
    let startY = 0;
    let tracking = false;

    const onStart = (e: TouchEvent) => {
      if (main.scrollTop > 4 || refreshing) return;
      const t = e.touches[0];
      if (!t) return;
      tracking = true;
      startY = t.clientY;
    };
    const onEnd = (e: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      if (!t) return;
      if (t.clientY - startY > 72) {
        void hapticImpact(ImpactStyle.Medium);
        void load(true);
      }
    };
    main.addEventListener("touchstart", onStart, { passive: true });
    main.addEventListener("touchend", onEnd);
    return () => {
      main.removeEventListener("touchstart", onStart);
      main.removeEventListener("touchend", onEnd);
    };
  }, [load, refreshing]);

  const visible = useMemo(
    () => items.filter((n) => !dismissed.has(n._id)),
    [items, dismissed]
  );

  const groups = useMemo(() => {
    const map: Record<GroupKey, Notif[]> = { today: [], week: [], earlier: [] };
    for (const n of visible) map[groupKey(n.createdAt)].push(n);
    return (["today", "week", "earlier"] as GroupKey[])
      .map((k) => ({ key: k, items: map[k] }))
      .filter((g) => g.items.length > 0);
  }, [visible]);

  const unread = visible.filter((n) => !n.readAt);

  const markRead = async (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n._id === id ? { ...n, readAt: n.readAt || new Date().toISOString() } : n))
    );
    try {
      await fetch("/api/user/notifications/read", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      window.dispatchEvent(new CustomEvent("vcm:notifications-changed"));
    } catch {
      /* optimistic */
    }
  };

  const markAllRead = async () => {
    const ids = unread.map((n) => n._id);
    setItems((prev) =>
      prev.map((n) => (n.readAt ? n : { ...n, readAt: new Date().toISOString() }))
    );
    await Promise.all(
      ids.map((id) =>
        fetch("/api/user/notifications/read", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id }),
        }).catch(() => null)
      )
    );
    window.dispatchEvent(new CustomEvent("vcm:notifications-changed"));
  };

  const removeLocal = (id: string) => {
    dismissNotificationId(id);
    setDismissed((prev) => new Set([...prev, id]));
  };

  if (status === "unauthenticated") {
    return (
      <PremiumPageShell className="ios26-page">
        <IOSLargeTitle title="Мэдэгдэл" />
        <div className="notif-empty">
          <Bell size={48} strokeWidth={1.5} style={{ color: "var(--label3)" }} />
          <p className="ios-headline mt-3">Нэвтэрч үзнэ үү</p>
          <p className="ios-subhead mt-1">Мэдэгдэл харахын тулд нэвтрэх шаардлагатай</p>
          <Link href="/sign-in" className="btn btn-primary mt-5">
            Нэвтрэх
          </Link>
        </div>
      </PremiumPageShell>
    );
  }

  return (
    <PremiumPageShell className="ios26-page">
      <div className="flex items-start justify-between gap-3">
        <IOSLargeTitle title="Мэдэгдэл" />
        {unread.length > 0 && (
          <button
            type="button"
            className="press text-[14px] font-semibold shrink-0 mt-2"
            style={{ color: "var(--blue)" }}
            onClick={() => void markAllRead()}
          >
            Бүгдийг уншсан
          </button>
        )}
      </div>

      {refreshing && (
        <p className="ios-caption text-center mb-2" style={{ color: "var(--blue)" }}>
          Шинэчилж байна…
        </p>
      )}

      {loading ? (
        <div className="space-y-3 mt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="ios-skel h-16 rounded-2xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="notif-empty">
          <div className="notif-empty__art" aria-hidden>
            <Bell size={56} strokeWidth={1.4} />
          </div>
          <p className="ios-headline mt-4">Мэдэгдэл байхгүй</p>
          <p className="ios-subhead mt-1 max-w-[260px]">
            Шинэ эвент, хөтөлбөр, системийн мэдээлэл энд харагдана
          </p>
          <button type="button" className="btn btn-primary mt-5" onClick={() => router.push("/")}>
            Нүүр рүү
          </button>
        </div>
      ) : (
        <div className="space-y-5 mt-1">
          {groups.map(({ key, items: list }) => (
            <section key={key}>
              <p className="ios-caption uppercase tracking-wide px-1 mb-2">{GROUP_LABEL[key]}</p>
              <div className="ios-list overflow-hidden">
                {list.map((n) => {
                  const meta = typeMeta(n.type);
                  const Icon = meta.Icon;
                  const unreadDot = !n.readAt;
                  return (
                    <NotificationSwipeRow
                      key={n._id}
                      onDelete={() => removeLocal(n._id)}
                      onRead={() => void markRead(n._id)}
                    >
                      <button
                        type="button"
                        className="notif-row press"
                        onClick={() => {
                          if (!n.readAt) void markRead(n._id);
                        }}
                      >
                        <span className="notif-row__icon" style={{ background: meta.bg, color: meta.color }}>
                          <Icon size={18} strokeWidth={1.75} />
                        </span>
                        <span className="notif-row__text">
                          <span className="notif-row__title">{n.title || "VCM"}</span>
                          <span className="notif-row__body">{n.body}</span>
                        </span>
                        <span className="notif-row__meta">
                          <span className="notif-row__time">{formatRelativeTime(n.createdAt, locale)}</span>
                          {unreadDot ? <span className="notif-row__dot" /> : null}
                        </span>
                      </button>
                    </NotificationSwipeRow>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </PremiumPageShell>
  );
}
