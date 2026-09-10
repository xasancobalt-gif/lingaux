export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
export async function POST(req: NextRequest) {
  if (!stripe) return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return NextResponse.json({ error: "Missing stripe-signature or STRIPE_WEBHOOK_SECRET" }, { status: 400 });

  const raw = await req.text();
  let event: any;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (e: any) {
    console.error("[stripe webhook] signature failed", e.message);
    return NextResponse.json({ error: `Webhook Error: ${e.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as any;
        const userId = s.metadata?.userId;
        const plan = s.metadata?.plan || "monthly";
        const amount = s.amount_total || s.amount_subtotal;
        const currency = s.currency || "usd";
        const providerId = s.id;

        if (userId) {
          await prisma.subscription.create({
            data: {
              userId,
              provider: "stripe",
              providerId,
              plan,
              status: "active",
              amount: amount || null,
              currency: currency?.toUpperCase() || "USD",
              currentPeriodEnd: plan === "lifetime" ? null : new Date(Date.now() + (plan === "annual" ? 365 : 30) * 24 * 60 * 60 * 1000),
            },
          });
          await prisma.user.update({ where: { id: userId }, data: { plan: "pro" } });
          console.log(`[stripe webhook] user ${userId} upgraded to pro via ${plan}`);
        }
        break;
      }
      case "customer.subscription.deleted":
      case "customer.subscription.updated": {
        // Handle cancellations — downgrade if canceled
        const sub = event.data.object as any;
        // Find by providerId? For simplicity we match via customer email metadata if needed
        // In production store stripeCustomerId on User and lookup.
        break;
      }
      default:
        console.log(`[stripe webhook] unhandled ${event.type}`);
    }
    return NextResponse.json({ received: true });
  } catch (e: any) {
    console.error("[stripe webhook handler]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
