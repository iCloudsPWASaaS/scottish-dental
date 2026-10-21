"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const [postcode, setPostcode] = useState(defaultValue);
  const [treatment, setTreatment] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (postcode.trim()) params.set("postcode", postcode.trim());
    if (treatment) params.set("treatment", treatment);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-2 rounded-[20px] border border-[#d0dff8] bg-white p-2 shadow-card sm:flex-row"
      role="search"
      aria-label="Search for dental practices"
    >
      <label htmlFor="search-postcode" className="sr-only">
        Postcode or town
      </label>
      <input
        id="search-postcode"
        type="text"
        value={postcode}
        onChange={(e) => setPostcode(e.target.value)}
        placeholder="Postcode or town (e.g. G1 1AB)"
        className="input flex-1"
        autoComplete="postal-code"
      />
      <label htmlFor="search-treatment" className="sr-only">
        Treatment
      </label>
      <select
        id="search-treatment"
        value={treatment}
        onChange={(e) => setTreatment(e.target.value)}
        className="input sm:w-56"
      >
        <option value="">All treatments</option>
        <option value="general">General Dentistry</option>
        <option value="emergency">Emergency</option>
        <option value="hygiene">Hygiene &amp; Cleaning</option>
        <option value="restorative">Restorative</option>
        <option value="cosmetic">Cosmetic</option>
        <option value="orthodontic">Orthodontics</option>
        <option value="implants">Implants</option>
        <option value="oral_surgery">Oral Surgery</option>
        <option value="sedation">Sedation</option>
      </select>
      <button type="submit" className="btn-primary sm:w-auto">
        Search
      </button>
    </form>
  );
}
