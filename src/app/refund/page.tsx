import Link from "next/link";

export const metadata = { title: "Refund Policy — LINGAUX" };

export default function Refund(){
  return (
    <div className="min-h-screen bg-mesh text-white">
      <main className="max-w-[800px] mx-auto px-4 md:px-6 py-10">
        <Link href="/" className="text-xs text-white/60 hover:text-white">← Back to LINGAUX</Link>
        <h1 className="mt-3 font-serif text-3xl font-bold">Refund Policy</h1>
        <p className="mt-1 text-xs text-white/40">Last updated: September 2026</p>
        <div className="mt-6 space-y-5 text-sm text-white/70 leading-relaxed">
          <section>
            <h2 className="text-white font-bold">1. 7-day money-back</h2>
            <p className="mt-2">Pro subscriptions are covered by a 7-day money-back guarantee from the purchase date. If LINGAUX isn&apos;t for you, email us within 7 days and we will refund the plan amount.</p>
          </section>
          <section>
            <h2 className="text-white font-bold">2. How to request</h2>
            <p className="mt-2">Email support@lingaux.app from your account email with your transaction ID (shown on the success screen and receipt). We confirm within 48 hours.</p>
          </section>
          <section>
            <h2 className="text-white font-bold">3. How refunds are paid</h2>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>Card / UPI / netbanking: refunded to the original payment method, processed within 7 business days.</li>
              <li>Bank transfer: refunded to the source account after manual verification.</li>
              <li>Plans bought with coins: re-credited as coins (unused portion) rather than cash.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-white font-bold">4. After a refund</h2>
            <p className="mt-2">Your plan returns to Free at the end of the refunded period. Abusive repeat purchase–refund cycles may be refused.</p>
          </section>
          <section>
            <h2 className="text-white font-bold">5. Contact</h2>
            <p className="mt-2">support@lingaux.app</p>
          </section>
        </div>
      </main>
    </div>
  );
}
