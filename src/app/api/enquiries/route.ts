import { createSupabaseServerClient } from "@/lib/supabase/server";
import { badRequest, created, notFound, ok } from "@/lib/http";
import { createEnquirySchema } from "@/lib/validations";
import { ENQUIRY_NOT_CONFIRMED_MESSAGE } from "@/lib/constants";
import { getAuthContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/enquiries
 * Public patient enquiry submission.
 * Clearly records the request as UNCONFIRMED.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = createEnquirySchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }

  const input = parsed.data;

  const supabase = await createSupabaseServerClient();

  // Only allow enquiries to published practices.
  const { data: practice, error: practiceError } = await supabase
    .from("practice_locations")
    .select("id, name, email, organisation_id")
    .eq("id", input.practice_location_id)
    .eq("status", "published")
    .maybeSingle();

  if (practiceError || !practice) {
    return notFound("Practice not found");
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const ipHash = ip ? await sha256(ip) : null;

  const { data: enquiry, error } = await supabase
    .from("enquiries")
    .insert({
      practice_location_id: input.practice_location_id,
      patient_name: input.patient_name,
      patient_email: input.patient_email,
      patient_phone: input.patient_phone ?? null,
      preferred_contact: input.preferred_contact,
      treatment_id: input.treatment_id ?? null,
      message: input.message ?? null,
      status: "received",
      consent_given: true,
      ip_hash: ipHash,
    })
    .select("*")
    .single();

  if (error) {
    return badRequest("Could not create enquiry", error.message);
  }

  await notifyPractice(practice.name, enquiry);

  return created({
    enquiry: {
      id: enquiry.id,
      status: enquiry.status,
      message: ENQUIRY_NOT_CONFIRMED_MESSAGE,
    },
  });
}

/**
 * GET /api/enquiries
 * Practice staff/admin: list enquiries for practices they own.
 */
export async function GET(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx.user || !ctx.profile) {
    return Response.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("enquiries")
    .select(
      "*, practice:practice_locations(id, name, slug), treatment:treatments(id, title, slug)"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (ctx.profile.role !== "admin" && ctx.profile.role !== "super_admin") {
    const { data: locations } = await supabase
      .from("practice_locations")
      .select("id")
      .eq("organisation_id", ctx.profile.organisation_id ?? "");
    const ids = (locations ?? []).map((l) => l.id);
    if (ids.length === 0) {
      return ok({ enquiries: [] });
    }
    query = query.in("practice_location_id", ids);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    return badRequest("Could not load enquiries", error.message);
  }

  return ok({ enquiries: data ?? [] });
}

async function notifyPractice(
  practiceName: string,
  enquiry: { id: string; patient_name: string }
) {
  const topic = process.env.NTFY_TOPIC;
  const server = process.env.NTFY_SERVER ?? "https://ntfy.sh";
  const token = process.env.NTFY_TOKEN;
  if (!topic) return;

  try {
    await fetch(`${server}/${topic}`, {
      method: "POST",
      headers: {
        Title: `New dental enquiry - ${practiceName}`,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: `New enquiry from ${enquiry.patient_name} (${enquiry.id})`,
    });
  } catch (err) {
    console.error("ntfy notification failed", err);
  }
}

async function sha256(value: string) {
  const buffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  );
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
