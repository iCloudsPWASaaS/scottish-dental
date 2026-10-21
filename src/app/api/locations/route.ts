import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { badRequest, created, forbidden } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

const createLocationSchema = z.object({
  name: z.string().trim().min(2).max(160),
  address: z.string().trim().min(3).max(300),
  postcode: z.string().trim().min(3).max(12),
  local_authority: z.string().trim().max(120).optional(),
  nhs_board: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(40).optional(),
  email: z.string().email().max(200).optional().or(z.literal("")),
  website: z.string().url().max(300).optional().or(z.literal("")),
  nhs_private: z.enum(["nhs", "private", "mixed"]).optional(),
  accepting_new_nhs: z.boolean().optional(),
});

/** POST /api/locations - practice owner creates a location (draft). */
export async function POST(request: Request) {
  const ctx = await requireUser();
  if (!ctx) return forbidden("Sign in required");

  const allowed = ["practice_owner", "practice_member", "admin", "super_admin"];
  if (!allowed.includes(ctx.profile!.role)) {
    return forbidden("Practice account required");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = createLocationSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }

  const supabase = await createSupabaseServerClient();

  let organisationId = ctx.profile!.organisation_id;

  if (!organisationId) {
    const { data: org, error: orgError } = await supabase
      .from("organisations")
      .insert({ name: parsed.data.name, owner_id: ctx.user!.id })
      .select("id")
      .single();

    if (orgError || !org) {
      return badRequest("Could not create organisation", orgError?.message);
    }
    organisationId = org.id;

    await supabase
      .from("profiles")
      .update({ organisation_id: org.id })
      .eq("id", ctx.user!.id);

    await supabase.from("organisation_members").insert({
      organisation_id: org.id,
      profile_id: ctx.user!.id,
      membership_role: "owner",
    });
  }

  const baseSlug = slugify(parsed.data.name);
  const { data: slugExists } = await supabase
    .from("practice_locations")
    .select("id")
    .eq("slug", baseSlug)
    .maybeSingle();

  const slug = slugExists
    ? `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`
    : baseSlug;

  const { data, error } = await supabase
    .from("practice_locations")
    .insert({
      organisation_id: organisationId,
      name: parsed.data.name,
      slug,
      address: parsed.data.address,
      postcode: parsed.data.postcode,
      local_authority: parsed.data.local_authority ?? null,
      nhs_board: parsed.data.nhs_board ?? null,
      phone: parsed.data.phone ?? null,
      email: parsed.data.email || null,
      website: parsed.data.website || null,
      nhs_private: parsed.data.nhs_private ?? "private",
      accepting_new_nhs: parsed.data.accepting_new_nhs ?? false,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) {
    return badRequest("Could not create location", error.message);
  }

  await logAudit(ctx.user!.id, "location.create", "practice_locations", data.id);

  return created({ location: data });
}
