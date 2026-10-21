export const metadata = { title: "Help" };

export default function HelpPage() {
  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold text-slate-900">Help</h1>
      <div className="mt-6 max-w-3xl space-y-6 text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Is an enquiry a confirmed booking?</h2>
          <p className="mt-2">
            No. Sending an enquiry is a request. The practice is responsible for
            contacting you to arrange an appointment. Always confirm details
            directly with the practice.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">How are practices verified?</h2>
          <p className="mt-2">
            Every practice must be invited, register, verify their authority,
            complete a profile and receive administrative approval before it is
            published. Prices and NHS acceptance status are dated and confirmed
            by the practice.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Data & privacy</h2>
          <p className="mt-2">
            We collect the minimum information needed to handle your enquiry. We
            do not collect clinical histories or special-category medical
            information at this stage.
          </p>
        </section>
      </div>
    </div>
  );
}
