"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { AccountNotReady } from "@/components/account-not-ready";
import type { Role } from "@/lib/types";

export interface DashboardProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  phone: string | null;
  organisation_id: string | null;
}

export interface DashboardLocation {
  id: string;
  name: string;
  slug: string;
  status: string;
}

interface AuthState {
  loading: boolean;
  user: { id: string; email: string } | null;
  profile: DashboardProfile | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  loading: true,
  user: null,
  profile: null,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const ALLOWED_ROLES: Role[] = ["practice_owner", "practice_member", "admin", "super_admin"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<DashboardProfile | null>(null);
  const [profileMissing, setProfileMissing] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function load(sessionUser: { id: string; email?: string } | null) {
      if (!sessionUser) {
        setUser(null);
        setProfile(null);
        setProfileMissing(false);
        setLoading(false);
        router.replace("/login?next=/dashboard/clinic");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("id, email, full_name, role, phone, organisation_id")
        .eq("id", sessionUser.id)
        .maybeSingle();

      if (!data || !ALLOWED_ROLES.includes(data.role)) {
        setProfile(null);
        setLoading(false);
        if (data?.role === "patient") {
          setProfileMissing(false);
          setUser({ id: data.id, email: data.email });
          router.replace("/patient");
        } else if (data?.role === "business_development") {
          setProfileMissing(false);
          setUser({ id: data.id, email: data.email });
          router.replace("/admin/prospects");
        } else if (data?.role === "admin" || data?.role === "super_admin") {
          setProfileMissing(false);
          setUser({ id: data.id, email: data.email });
          router.replace("/admin");
        } else {
          // Session exists but there is no profile row. Redirecting to
          // /login here would bounce back through middleware forever.
          setUser({ id: sessionUser.id, email: sessionUser.email ?? "" });
          setProfileMissing(true);
        }
        return;
      }

      setProfileMissing(false);
      setUser({ id: data.id, email: data.email });
      setProfile(data as DashboardProfile);
      setLoading(false);

      // Silently claim any pending team invitations for this email.
      fetch("/api/clinic/link-invitations", { method: "POST" }).catch(() => {});
    }

    supabase.auth.getSession().then(({ data }) => load(data.session?.user ?? null));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, sess) => {
      load(sess?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const signOut = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setProfileMissing(false);
    router.push("/");
    router.refresh();
  }, [router]);

  const value = useMemo(
    () => ({ loading, user, profile, signOut }),
    [loading, user, profile, signOut]
  );

  if (!loading && profileMissing) {
    return <AccountNotReady email={user?.email} />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

interface LocationsState {
  locations: DashboardLocation[];
  loading: boolean;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  /** Location ids this user may edit — empty means "all" is unavailable. */
  scopedIds: string[];
  refresh: () => void;
}

const LocationsContext = createContext<LocationsState>({
  locations: [],
  loading: true,
  selectedId: null,
  setSelectedId: () => {},
  scopedIds: [],
  refresh: () => {},
});

export function useLocations() {
  return useContext(LocationsContext);
}

const STORAGE_KEY = "clinic.selectedPracticeId";

export function LocationsProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [locations, setLocations] = useState<DashboardLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedIdState] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!profile) {
        setLocations([]);
        setSelectedIdState(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const supabase = createSupabaseBrowserClient();
      const isAdmin = profile.role === "admin" || profile.role === "super_admin";

      let query = supabase
        .from("practice_locations")
        .select("id, name, slug, status")
        .order("name");

      if (!isAdmin) {
        if (!profile.organisation_id) {
          setLocations([]);
          setSelectedIdState(null);
          setLoading(false);
          return;
        }
        query = query.eq("organisation_id", profile.organisation_id);
      }

      const { data } = await query;

      if (cancelled) return;

      const rows = (data ?? []) as DashboardLocation[];
      setLocations(rows);

      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && rows.some((r) => r.id === stored)) {
        setSelectedIdState(stored);
      } else {
        setSelectedIdState(rows[0]?.id ?? null);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [profile, tick]);

  function setSelectedId(id: string | null) {
    setSelectedIdState(id);
    if (id) {
      window.localStorage.setItem(STORAGE_KEY, id);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  const value = useMemo(
    () => ({
      locations,
      loading,
      selectedId,
      setSelectedId,
      scopedIds: locations.map((l) => l.id),
      refresh: () => setTick((t) => t + 1),
    }),
    [locations, loading, selectedId]
  );

  return <LocationsContext.Provider value={value}>{children}</LocationsContext.Provider>;
}
