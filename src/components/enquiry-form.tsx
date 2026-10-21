"use client";

import { useState } from "react";

interface Props {
  practiceLocationId: string;
  treatments: { id: string; title: string }[];
}

export function EnquiryForm({ practiceLocationId, treatments }: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setMessage(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          practice_location_id: practiceLocationId,
          patient_name: data.get("patient_name"),
          patient_email: data.get("patient_email"),
          patient_phone: data.get("patient_phone"),
          preferred_contact: data.get("preferred_contact"),
          treatment_id: data.get("treatment_id") || undefined,
          message: data.get("message"),
          consent_given: data.get("consent_given") === "on",
          website: honeypot,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(json.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("sent");
      setMessage(json.data?.message ?? "Your enquiry has been sent.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  if (status === "sent") {
    return (
      <div className="mt-4 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800" role="status">
        <p className="font-semibold">Enquiry sent</p>
        <p className="mt-1">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      <div className="hidden" aria-hidden>
        <label>
          Website
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      <div>
        <label htmlFor="patient_name" className="label">Full name</label>
        <input id="patient_name" name="patient_name" required minLength={2} className="input" />
      </div>

      <div>
        <label htmlFor="patient_email" className="label">Email</label>
        <input id="patient_email" name="patient_email" type="email" required className="input" />
      </div>

      <div>
        <label htmlFor="patient_phone" className="label">Phone (optional)</label>
        <input id="patient_phone" name="patient_phone" type="tel" className="input" />
      </div>

      {treatments.length > 0 && (
        <div>
          <label htmlFor="treatment_id" className="label">Treatment</label>
          <select id="treatment_id" name="treatment_id" className="input">
            <option value="">General enquiry</option>
            {treatments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="preferred_contact" className="label">Preferred contact method</label>
        <select id="preferred_contact" name="preferred_contact" className="input" defaultValue="email">
          <option value="email">Email</option>
          <option value="phone">Phone</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="label">Message (optional)</label>
        <textarea id="message" name="message" rows={3} className="input" />
      </div>

      <label className="flex items-start gap-2 text-xs text-slate-600">
        <input type="checkbox" name="consent_given" required className="mt-0.5" />
        <span>
          I consent to {`the practice`} contacting me about this enquiry and
          processing my details as described in the privacy notice.
        </span>
      </label>

      {status === "error" && message && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
          {message}
        </p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}
