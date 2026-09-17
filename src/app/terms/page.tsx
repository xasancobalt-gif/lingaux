import Link from "next/link";

export const metadata = { title: "Terms of Service — LINGAUX" };

export default function Terms(){
  return (
    <div className="min-h-screen bg-mesh text-white">
      <main className="max-w-[800px] mx-auto px-4 md:px-6 py-10">
        <Link href="/" className="text-xs text-white/60 hover:text-white">← Back to LINGAUX</Link>
        <h1 className="mt-3 font-serif text-3xl font-bold">Terms of Service</h1>
        <p className="mt-1 text-xs text-white/40">Last updated: September 2026</p>
        <div className="mt-6 space-y-5 text-sm text-white/70 leading-relaxed">
          <section>
            <h2 className="text-white font-bold">1. The service</h2>
            <p className="mt-2">LINGAUX is a communication-practice app: record practice videos, get AI feedback, follow drills, and optionally join the paid community. Free accounts include limited recordings and scans; Pro unlocks unlimited use plus community features.</p>
          </section>
          <section>
            <h2 className="text-white font-bold">2. Your account</h2>
            <p className="mt-2">You must provide a valid email and keep your password (and 2FA, if enabled) secure. One account per person. You are responsible for activity under your account.</p>
          </section>
          <section>
            <h2 className="text-white font-bold">3. Acceptable use</h2>
            <p className="mt-2">No harassment, hate, sexual or vulgar content, spam, scraping, reverse-engineering, or attempts to bypass paywalls, locks, or access controls. Community posts are moderated; violations can lead to removal or account termination.</p>
          </section>
          <section>
            <h2 className="text-white font-bold">4. Subscriptions & billing</h2>
            <p className="mt-2">Pro is billed per plan (monthly / annual / lifetime). Paid plans renew as described at checkout until cancelled. Cancel anytime — Pro stays active until the end of the paid period. Refunds follow our <Link href="/refund" className="text-white underline">Refund Policy</Link>.</p>
          </section>
          <section>
            <h2 className="text-white font-bold">5. Coins</h2>
            <p className="mt-2">Coins are earned via referrals (80 per signup) and can only be spent inside LINGAUX on subscriptions and products. Coins have no cash value, cannot be withdrawn, transferred, or sold. Abuse of referrals forfeits coins.</p>
          </section>
          <section>
            <h2 className="text-white font-bold">6. Your content</h2>
            <p className="mt-2">You own your recordings. By uploading, you grant LINGAUX a license to host, transcribe, and analyze them solely to provide the service. Do not upload content you do not have rights to.</p>
          </section>
          <section>
            <h2 className="text-white font-bold">7. AI feedback disclaimer</h2>
            <p className="mt-2">AI scores and drills are practice aids, not professional advice. Results vary with effort; we make no guarantee of specific outcomes.</p>
          </section>
          <section>
            <h2 className="text-white font-bold">8. Termination & changes</h2>
            <p className="mt-2">We may suspend accounts that violate these terms. We may update the service or terms; material changes will be announced in-app. Continued use after changes means acceptance.</p>
          </section>
          <section>
            <h2 className="text-white font-bold">9. Contact</h2>
            <p className="mt-2">support@lingaux.app</p>
          </section>
        </div>
      </main>
    </div>
  );
}
