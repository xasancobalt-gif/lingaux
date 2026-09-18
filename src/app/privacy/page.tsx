import Link from "next/link";

export const metadata = { title: "Privacy Policy — LINGAUX" };

export default function Privacy(){
  return (
    <div className="min-h-screen bg-mesh text-white">
      <main className="max-w-[800px] mx-auto px-4 md:px-6 py-10">
        <Link href="/" className="text-xs text-white/60 hover:text-white">← Back to LINGAUX</Link>
        <h1 className="mt-3 font-serif text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-1 text-xs text-white/40">Last updated: September 2026</p>
        <div className="mt-6 space-y-5 text-sm text-white/70 leading-relaxed">
          <section>
            <h2 className="text-white font-bold">1. What we collect</h2>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li><b className="text-white">Account data:</b> name, email, and a hashed password (we never store plain-text passwords). Optional 2FA secret if you enable it.</li>
              <li><b className="text-white">Practice data:</b> recordings you upload (audio/video), transcripts, AI review scores, XP, streaks, coins and referral activity.</li>
              <li><b className="text-white">Support data:</b> messages and tickets you send via chat or email.</li>
              <li><b className="text-white">Technical data:</b> sign-in sessions, device/browser basics needed for security and abuse prevention.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-white font-bold">2. How we use it</h2>
            <p className="mt-2">To run your account, score your recordings, track progress, operate referrals and subscriptions, prevent abuse, and reply to support requests. We do not sell your personal data.</p>
          </section>
          <section>
            <h2 className="text-white font-bold">3. Sharing</h2>
            <p className="mt-2">We share data only with services required to operate LINGAUX: hosting/database, email delivery, AI transcription/scoring, and payment processors when you pay. Each processes data only for that purpose.</p>
          </section>
          <section>
            <h2 className="text-white font-bold">4. Cookies & sessions</h2>
            <p className="mt-2">We use strictly-necessary cookies for sign-in sessions, CSRF protection, and auth callbacks. No advertising trackers.</p>
          </section>
          <section>
            <h2 className="text-white font-bold">5. Retention & deletion</h2>
            <p className="mt-2">Recordings and account data are kept while your account is active. You can request export or full deletion anytime at lingauxofficial@gmail.com — deletion removes your account, recordings, and personal data within 30 days (payment records are kept as required by law).</p>
          </section>
          <section>
            <h2 className="text-white font-bold">6. Children</h2>
            <p className="mt-2">LINGAUX is not intended for children under 13.</p>
          </section>
          <section>
            <h2 className="text-white font-bold">7. Contact</h2>
            <p className="mt-2">Questions about this policy: lingauxofficial@gmail.com</p>
          </section>
        </div>
      </main>
    </div>
  );
}
