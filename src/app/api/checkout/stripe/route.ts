export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, getStripePlan, isStripeConfigured } from "@/lib/stripe";
import { z } from "zod";
const schema = z.object({
  plan: z.enum(["monthly", "annual", "lifetime"]),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isStripeConfigured() || !stripe) {
    return NextResponse.json(
      { error: "Stripe not configured. Set STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env. Using mock checkout for now.", code: "NOT_CONFIGURED" },
      { status: 503 }
    );
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const plan = parsed.data.plan;
  const cfg = getStripePlan(plan);
  const userEmail = session.user.email!;
  const userId = (session.user as any).id as string;

  const origin = req.headers.get("origin") || process.env.AUTH_URL || "http://localhost:3000";

  try {
    // For lifetime = one-time payment, else subscription
    if (cfg.interval === null) {
      const s = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: userEmail,
        line_items: [{ price_data: { currency: cfg.currency, product_data: { name: cfg.name }, unit_amount: cfg.amount }, quantity: 1 }],
        success_url: `${origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}&provider=stripe&plan=${plan}`,
        cancel_url: `${origin}/subscription/cancel`,
        metadata: { userId, plan, provider: "stripe" },
      });
      return NextResponse.json({ url: s.url, sessionId: s.id });
    } else {
      const s = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer_email: userEmail,
        line_items: [{ price_data: { currency: cfg.currency, product_data: { name: cfg.name }, recurring: { interval: cfg.interval } , unit_amount: cfg.amount }, quantity: 1 }],
        success_url: `${origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}&provider=stripe&plan=${plan}`,
        cancel_url: `${origin}/subscription/cancel`,
        metadata: { userId, plan, provider: "stripe" },
      });
      return NextResponse.json({ url: s.url, sessionId: s.id });
    }
  } catch (e: any) {
    console.error("[stripe checkout]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
