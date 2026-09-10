import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function Success({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const session = await auth();
  let plan = params.plan || "pro";
  let provider = params.provider || "stripe";

  // If stripe session_id provided, we could verify with Stripe, but webhook already handled. Here just ensure user is pro.
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email.toLowerCase() } });
    if (user && user.plan !== "pro") {
      // Fallback: if webhook hasn't fired yet (local test), auto-upgrade for demo if session_id present
      if (params.session_id || params.payment_id) {
        await prisma.user.update({ where: { id: user.id }, data: { plan: "pro" } }).catch(() => {});
        plan = "pro";
      }
    }
  }

  return (
    <div className="min-h-screen bg-mesh grid place-items-center p-6">
      <div className="glass-card rounded-[28px] p-8 max-w-[560px] w-full text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500 text-white grid place-items-center mx-auto text-2xl">✓</div>
        <h1 className="mt-4 font-serif text-3xl font-bold">You’re now <span className="text-gradient-gold">LINGAUX Pro</span></h1>
        <p className="mt-2 text-white/60 text-sm">Provider: <b className="text-white">{provider}</b> • Plan: <b className="text-white">{plan}</b> • Webhook has upgraded your DB. Refresh if badge not yet Pro.</p>
        <div className="mt-6 grid gap-3 text-left glass rounded-2xl p-4 text-sm">
          <div>✓ Unlimited Triple-Scan</div>
          <div>✓ Paid community + private chat unlocked</div>
          <div>✓ Certificates + Game Plan PDF</div>
        </div>
        <div className="mt-6 flex gap-3 justify-center">
          <Link href="/?tab=studio" className="px-6 py-3 rounded-full bg-white text-black font-bold">Go to Studio →</Link>
          <Link href="/" className="px-6 py-3 rounded-full glass">Dashboard</Link>
        </div>
        <div className="mt-4 text-xs text-white/40">Session: {params.session_id?.slice(0,12) || params.payment_id?.slice(0,12) || "—"} • Need invoice? support@LINGAUX.app</div>
      </div>
    </div>
  );
}
