import Link from "next/link";

export const metadata = { title: "Cookie Policy — LINGAUX" };

export default function Cookies(){
  return (
    <div className="min-h-screen bg-mesh text-white">
      <main className="max-w-[800px] mx-auto px-4 md:px-6 py-10">
        <Link href="/" className="text-xs text-white/60 hover:text-white">← Back to LINGAUX</Link>
        <h1 className="mt-3 font-serif text-3xl font-bold">Cookie Policy</h1>
        <p className="mt-1 text-xs text-white/40">Last updated: September 2026</p>
        <div className="mt-6 space-y-5 text-sm text-white/70 leading-relaxed">
          <section>
            <h2 className="text-white font-bold">1. What we store in your browser</h2>
            <p className="mt-2">Only strictly-necessary cookies: your sign-in session, CSRF protection, and auth callback state (names like <code className="px-1 rounded bg-white/10">__Host-authjs.*</code>). No advertising or cross-site tracking cookies.</p>
          </section>
          <section>
            <h2 className="text-white font-bold">2. Staying signed in</h2>
            <p className="mt-2">Sessions last 30 days on your device, so the browser remembers you — that is our “remember me”. On a shared device, always use Log out. Under Profile you can “Sign out all devices” to kill every session at once (for example after changing your password).</p>
          </section>
          <section>
            <h2 className="text-white font-bold">3. Clearing them</h2>
            <p className="mt-2">Clearing site cookies signs you out. The site keeps working — just sign in again.</p>
          </section>
          <section>
            <h2 className="text-white font-bold">4. Contact</h2>
            <p className="mt-2">lingauxofficial@gmail.com</p>
          </section>
        </div>
      </main>
    </div>
  );
}
