"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CreateLocationForm } from "@/components/create-location-form";
import { useLocations } from "@/components/dashboard/providers";

export default function NewLocationPage() {
  const router = useRouter();
  const { locations, loading, refresh } = useLocations();

  useEffect(() => {
    if (!loading && locations.length > 0) {
      refresh();
    }
  }, [loading, locations.length, refresh]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ow-ink">Add your practice</h1>
        <p className="mt-1 text-sm text-ow-text-secondary">
          Create your listing. It will be reviewed by our team before going live.
        </p>
      </div>
      <section className="rounded-ow-lg border border-ow-line bg-white p-5">
        <CreateLocationForm />
      </section>
      <button
        type="button"
        onClick={() => router.back()}
        className="text-sm font-medium text-ow-text-secondary hover:text-ow-ink"
      >
        ← Back
      </button>
    </div>
  );
}
