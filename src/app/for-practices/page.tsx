import Link from "next/link";

export const metadata = { title: "For Practices" };

export default function ForPracticesPage() {
  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold text-slate-900">Join the marketplace</h1>
      <p className="mt-3 max-w-3xl text-slate-700">
        Scottish Dental Marketplace connects verified practices with patients
        actively searching for dental care. Your listing goes live only after
        verification and administrative approval.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {[
          {
            step: "1",
            title: "Request an invitation",
            body: "Complete the form with your practice details. Our team verifies your identity and authority.",
          },
          {
            step: "2",
            title: "Verify & build your profile",
            body: "Confirm your details, add services, clinicians, opening hours and transparent prices.",
          },
          {
            step: "3",
            title: "Go live & manage enquiries",
            body: "Once approved, your practice appears in search and you manage enquiries from your dashboard.",
          },
        ].map((item) => (
          <div key={item.step} className="card">
            <span className="badge bg-brand-100 text-brand-800">{item.step}</span>
            <h2 className="mt-3 font-semibold text-slate-900">{item.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{item.body}</p>
          </div>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-slate-900">Plans</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {[
            { name: "Free", price: "£0", features: ["Verified basic listing", "Practice information", "Controlled enquiry access"] },
            { name: "Professional", price: "£39/mo", features: ["Enhanced profile", "More content", "Richer enquiry analytics"] },
            { name: "Premium", price: "£79/mo", features: ["Optional marketing modules", "Advanced analytics", "Priority support"] },
          ].map((plan) => (
            <div key={plan.name} className="card">
              <h3 className="font-semibold text-slate-900">{plan.name}</h3>
              <p className="mt-1 text-2xl font-bold text-brand-700">{plan.price}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span aria-hidden className="text-brand-600">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-500">
          Prices are illustrative hypotheses for testing, not approved tariffs.
        </p>
      </section>

      <div className="mt-10">
        <Link href="/signup" className="btn-primary">Request an invitation</Link>
      </div>
    </div>
  );
}
