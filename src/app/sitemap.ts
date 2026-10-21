import type { MetadataRoute } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL;

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/search",
    "/treatments",
    "/emergency",
    "/for-practices",
    "/help",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  try {
    const supabase = await createSupabaseServerClient();
    const { data: practices } = await supabase
      .from("practice_locations")
      .select("slug, updated_at")
      .eq("status", "published");

    const { data: treatments } = await supabase
      .from("treatments")
      .select("slug, updated_at")
      .eq("is_patient_facing", true);

    const practiceRoutes: MetadataRoute.Sitemap = (practices ?? []).map((p) => ({
      url: `${base}/practices/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const treatmentRoutes: MetadataRoute.Sitemap = (treatments ?? []).map((t) => ({
      url: `${base}/treatments/${t.slug}`,
      lastModified: t.updated_at ? new Date(t.updated_at) : new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

    return [...staticRoutes, ...practiceRoutes, ...treatmentRoutes];
  } catch {
    return staticRoutes;
  }
}
