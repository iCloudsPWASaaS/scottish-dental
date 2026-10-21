import { createSupabaseServerClient } from "@/lib/supabase/server";
import { badRequest, ok } from "@/lib/http";
import { getAuthContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/clinic/link-invitations
 * When a signed-in user's email matches a pending invitation, activate the
 * membership and point their profile at the organisation (OpenWide parity).
 */
export async function POST() {
  const ctx = await getAuthContext();
  if (!ctx.user || !ctx.profile) return badRequest("Sign in required");

  const email = (ctx.profile.email ?? "").toLowerCase();
  if (!email) return ok({ linked: 0 });

  const supabase = await createSupabaseServerClient();

  const { data: invites } = await supabase
    .from("organisation_members")
    .select("id, organisation_id")
    .is("profile_id", null)
    .eq("invited_email", email)
    .eq("status", "invited");

  if (!invites || invites.length === 0) {
    return ok({ linked: 0 });
  }

  let linked = 0;
  for (const invite of invites) {
    const { error } = await supabase
      .from("organisation_members")
      .update({
        profile_id: ctx.user.id,
        status: "active",
      })
      .eq("id", invite.id)
      .is("profile_id", null);

    if (!error) {
      linked += 1;
      if (!ctx.profile.organisation_id) {
        await supabase
          .from("profiles")
          .update({ organisation_id: invite.organisation_id })
          .eq("id", ctx.user.id);
      }
    }
  }

  return ok({ linked });
}
