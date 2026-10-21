export const metadata = { title: "Terms of use" };

export default function TermsPage() {
  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold text-slate-900">Terms of use</h1>
      <div className="mt-6 max-w-3xl space-y-6 text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Listings</h2>
          <p className="mt-2">
            Practices are responsible for the accuracy of their profiles, prices
            and NHS acceptance declarations. All published information must be
            practice-approved and dated.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Enquiries</h2>
          <p className="mt-2">
            Enquiries are requests, not confirmed bookings. No clinical advice
            is provided through this platform.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Advertising</h2>
          <p className="mt-2">
            Sponsored placements are always clearly labelled as advertising.
          </p>
        </section>
      </div>
    </div>
  );
}
