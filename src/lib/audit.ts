import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function logAudit(
  actorId: string | null,
  action: string,
  entity: string,
  entityId: string | null,
  metadata: Record<string, unknown> = {}
) {
  try {
    const admin = createSupabaseAdminClient();
    await admin.from("audit_events").insert({
      actor_id: actorId,
      action,
      entity,
      entity_id: entityId,
      metadata,
    });
  } catch (err) {
    console.error("audit log failed", err);
  }
}
