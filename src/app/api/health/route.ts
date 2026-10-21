import { ok } from "@/lib/http";

export async function GET() {
  return ok({
    status: "ok",
    service: "scottish-dental-marketplace",
    time: new Date().toISOString(),
  });
}
