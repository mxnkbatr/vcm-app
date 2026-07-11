"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/lib/hooks/useSession";
import { clientCache } from "@/lib/client-cache";

export type DashboardData = {
  user: {
    _id: string;
    fullName: string;
    email: string;
    role: string;
    studentId?: string;
    country?: string;
    step?: string;
    profile?: {
      address?: { city?: string };
      [key: string]: unknown;
    } | null;
    phone?: string | null;
    hasPassword?: boolean;
    affiliation?: string | null;
    program?: string | null;
  };
  applications: unknown[];
  attendedEvents: unknown[];
  availableEvents: unknown[];
  purchases: unknown[];
  enrolledLessons: unknown[];
  lmsEnrollments: unknown[];
  lessons: unknown[];
  studentLms?: {
    enrollments: unknown[];
    courses: unknown[];
    certificates: unknown[];
  };
};

const CACHE_KEY = "/api/user/dashboard";

async function fetchDashboard(): Promise<DashboardData | null> {
  const res = await fetch(CACHE_KEY, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  clientCache.set(CACHE_KEY, data);
  return data;
}

/** Shared dashboard data — one fetch for profile + dashboard pages. */
export function useDashboard(options?: { enabled?: boolean }) {
  const { status } = useSession();
  const enabled = options?.enabled !== false && status === "authenticated";

  const [data, setData] = useState<DashboardData | null>(() =>
    enabled ? clientCache.get<DashboardData>(CACHE_KEY) : null
  );
  const [loading, setLoading] = useState(enabled && !clientCache.has(CACHE_KEY));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return null;
    setLoading(true);
    setError(null);
    try {
      const next = await fetchDashboard();
      setData(next);
      if (!next) setError("Failed to load");
      return next;
    } catch {
      setError("Failed to load");
      return null;
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setData(null);
      setLoading(false);
      return;
    }
    const cached = clientCache.get<DashboardData>(CACHE_KEY);
    if (cached) {
      setData(cached);
      setLoading(false);
      if (clientCache.age(CACHE_KEY) > 30_000) void refresh();
      return;
    }
    void refresh();
  }, [enabled, refresh]);

  return { data, loading, error, refresh };
}

export function invalidateDashboardCache() {
  clientCache.remove("/api/user/dashboard");
}
