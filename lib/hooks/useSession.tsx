"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { appUserFromJwt } from "@/lib/authJwt";
import type { Session, User } from "@supabase/supabase-js";

type AppUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  phone?: string;
  profileComplete?: boolean;
};

type AuthContextValue = {
  data: { user: AppUser | null } | null;
  status: "loading" | "authenticated" | "unauthenticated";
  update: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  data: null,
  status: "loading",
  update: async () => {},
});

async function fetchAppSession(): Promise<AppUser | null> {
  const res = await fetch("/api/auth/session", { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.user ?? null;
}

async function resolveAppUser(supabaseUser: User): Promise<AppUser | null> {
  const fromJwt = appUserFromJwt(supabaseUser);
  if (fromJwt) return fromJwt;
  return fetchAppSession();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");
  const [user, setUser] = useState<AppUser | null>(null);

  const refresh = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      setUser(null);
      setStatus("unauthenticated");
      return;
    }
    const appUser = await resolveAppUser(session.user);
    setUser(appUser);
    setStatus(appUser ? "authenticated" : "unauthenticated");
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    const applySession = async (session: Session | null) => {
      if (!mounted) return;
      if (session?.user) {
        const appUser = await resolveAppUser(session.user);
        if (!mounted) return;
        setUser(appUser);
        setStatus(appUser ? "authenticated" : "unauthenticated");
      } else {
        setUser(null);
        setStatus("unauthenticated");
      }
    };

    void supabase.auth.getSession().then(({ data: { session } }) => applySession(session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      data: user ? { user } : null,
      status,
      update: refresh,
    }),
    [refresh, status, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useSession() {
  return useContext(AuthContext);
}

export function useSupabaseUser(): User | null {
  const [user, setUser] = useState<User | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  return user;
}
