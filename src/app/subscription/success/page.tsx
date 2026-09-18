import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";

// Server-side Cashfree confirmation for return-URL flow (no webhook needed).
// Returns true only when Cashfree reports the order PAID.
async function verifyCashfree(orderId: string): Promise<boolean> {
  const appId = process.env.CASHFREE_APP_ID;
  const secret = process.env.CASHFREE_SECRET_KEY;
  if (!appId || !secret) return false;
  const base = process.env.CASHFREE_ENV === "production" ? "https://api.cashfree.com" : "https://sandbox.cashfree.com";
  try {
    const res = await fetch(`${base}/pg/orders/${orderId}`, {
      headers: { "x-client-id": appId, "x-client-secret": secret, "x-api-version": "2023-08-01" },
      cache: "no-store",
    });
    if (!res.ok) return false;
    const j = await res.json();
    return j?.order_status === "PAID";
  } catch { return false; }
}

export default async function Success({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const session = await auth();
  const plan = params.plan || "pro";
  const provider = params.provider || "cashfree";
  let verified = false;

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email.toLowerCase() } });
    if (user) {
      if (user.plan === "pro") {
        verified = true;
      } else if (provider === "cashfree" && params.order_id && (await verifyCashfree(params.order_id))) {
        await prisma.subscription.create({
          data: {
            userId: user.id, provider: "cashfree", plan: plan as any, status: "active",
            currency: "INR",
            currentPeriodEnd: plan === "lifetime" ? null : new Date(Date.now() + (plan === "annual" ? 365 : 30) * 24 * 60 * 60 * 1000),
          },
        }).catch(() => null);
        await prisma.user.update({ where: { id: user.id }, data: { plan: "pro" } }).catch(() => {});
        verified = true;
      }
    }
  }

  return (
    <div className="min-h-screen bg-mesh grid place-items-center p-6">
      <div className="glass-card rounded-[28px] p-8 max-w-[560px] w-full text-center">
        <div className={`w-16 h-16 rounded-full text-white grid place-items-center mx-auto text-2xl ${verified ? "bg-emerald-500" : "bg-amber-500"}`}>{verified ? "✓" : "…"}</div>
        <h1 className="mt-4 font-serif text-3xl font-bold">{verified ? <>You’re now <span className="text-gradient-gold">LINGAUX Pro</span></> : "Payment pending"}</h1>
        <p className="mt-2 text-white/60 text-sm">Provider: <b className="text-white">{provider}</b> • Plan: <b className="text-white">{plan}</b> • {verified ? "Payment confirmed. Refresh if your badge is not Pro yet." : "If you just paid, confirmation can take a minute — wait and refresh this page."}</p>
        {verified && (
          <div className="mt-6 grid gap-3 text-left glass rounded-2xl p-4 text-sm">
            <div>✓ Unlimited Triple-Scan</div>
            <div>✓ Paid community + private chat unlocked</div>
            <div>✓ Certificates + Game Plan PDF</div>
          </div>
        )}
        <div className="mt-6 flex gap-3 justify-center">
          <Link href="/?tab=studio" className="px-6 py-3 rounded-full bg-white text-black font-bold">Go to Studio →</Link>
          <Link href="/" className="px-6 py-3 rounded-full glass">Dashboard</Link>
        </div>
        <div className="mt-4 text-xs text-white/40">Need help? lingauxofficial@gmail.com</div>
      </div>
    </div>
  );
}
