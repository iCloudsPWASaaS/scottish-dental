import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile, Role } from "@/lib/types";

export interface AuthContext {
  user: { id: string; email?: string } | null;
  profile: Profile | null;
}

export async function getAuthContext(): Promise<AuthContext> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile: profile as Profile | null };
}

export async function requireUser() {
  const ctx = await getAuthContext();
  if (!ctx.user || !ctx.profile) return null;
  return ctx;
}

export async function requireRole(...roles: Role[]) {
  const ctx = await requireUser();
  if (!ctx) return null;
  if (!roles.includes(ctx.profile!.role)) return null;
  return ctx;
}

export async function requireAdmin() {
  return requireRole("admin", "super_admin");
}

export async function requirePracticeStaff() {
  return requireRole(
    "practice_owner",
    "practice_member",
    "admin",
    "super_admin"
  );
}

export async function requireOperator() {
  return requireRole("business_development", "admin", "super_admin");
}

export function canAccessOrganisation(
  profile: Profile | null,
  organisationIds: string[]
): boolean {
  if (!profile) return false;
  if (profile.role === "admin" || profile.role === "super_admin") return true;
  return organisationIds.includes(profile.organisation_id ?? "");
}
