export const metadata = { title: "Privacy notice" };

export default function PrivacyPage() {
  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold text-slate-900">Privacy notice</h1>
      <div className="mt-6 max-w-3xl space-y-6 text-slate-700">
        <p>
          This notice explains how Scottish Dental Marketplace handles personal
          data. A full UK GDPR privacy-by-design assessment will accompany the
          production release.
        </p>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">What we collect</h2>
          <p className="mt-2">
            Enquiry contact details (name, email, phone), preferences and your
            message. We minimise data and do not collect clinical histories or
            special-category medical information.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">How we use it</h2>
          <p className="mt-2">
            To pass your enquiry to the relevant practice and to operate,
            secure and improve the marketplace. Marketing communications require
            a lawful basis under UK GDPR/PECR.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Your rights</h2>
          <p className="mt-2">
            You can request access, correction, deletion or restriction of your
            data, and object to processing. Contact us to exercise these rights.
          </p>
        </section>
      </div>
    </div>
  );
}
