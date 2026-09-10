import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { capturePayPalOrder } from "@/lib/paypal";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';

// GET /api/checkout/paypal/capture?token=ORDER_ID&PayerID=...
// PayPal redirects here after approval. We capture and upgrade, then redirect to success.
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("token") || req.nextUrl.searchParams.get("orderId");
  const plan = req.nextUrl.searchParams.get("plan") || "monthly";
  if (!orderId) return NextResponse.json({ error: "token (orderId) required" }, { status: 400 });

  try {
    const data = await capturePayPalOrder(orderId);
    // data.purchase_units[0].payments.captures[0] or custom_id
    const pu = data.purchase_units?.[0] as any;
    const capture = pu?.payments?.captures?.[0];
    const custom = pu?.custom_id ? (() => { try { return JSON.parse(pu.custom_id); } catch { return {}; } })() : {};
    const userId = custom.userId || data.payer?.payer_id || null;
    // Try to find userId via custom_id, else via payer email
    let targetUserId: string | null = custom.userId || null;
    if (!targetUserId && data.payer?.email_address) {
      const u = await prisma.user.findUnique({ where: { email: data.payer.email_address.toLowerCase() } });
      targetUserId = u?.id || null;
    }
    // Fallback: if still no user, use plan from query and try to match via session? But this is redirect without auth.
    // For demo we upgrade whoever we can find; otherwise mark pending and let webhook handle.
    if (targetUserId) {
      const amount = capture?.amount?.value ? Math.round(parseFloat(capture.amount.value) * 100) : null;
      const currency = capture?.amount?.currency_code || "USD";
      const existing = await prisma.subscription.findFirst({ where: { providerId: capture?.id || orderId, provider: "paypal" } });
      if (!existing) {
        await prisma.subscription.create({
          data: {
            userId: targetUserId,
            provider: "paypal",
            providerId: capture?.id || orderId,
            plan: custom.plan || plan,
            status: "active",
            amount: amount || null,
            currency,
            currentPeriodEnd: (custom.plan || plan) === "lifetime" ? null : new Date(Date.now() + ((custom.plan || plan) === "annual" ? 365 : 30) * 24 * 60 * 60 * 1000),
          },
        });
        await prisma.user.update({ where: { id: targetUserId }, data: { plan: "pro" } });
      }
    }

    const origin = process.env.AUTH_URL || req.headers.get("origin") || "http://localhost:3000";
    return NextResponse.redirect(`${origin}/subscription/success?provider=paypal&plan=${custom.plan || plan}&orderId=${orderId}`);
  } catch (e: any) {
    console.error("[paypal capture]", e);
    const origin = process.env.AUTH_URL || "http://localhost:3000";
    return NextResponse.redirect(`${origin}/subscription/cancel?error=${encodeURIComponent(e.message)}`);
  }
}

// Also support POST from frontend modal flow (orderId in body)
import { z } from "zod";
export const dynamic = 'force-dynamic';
const postSchema = z.object({ orderId: z.string(), plan: z.enum(["monthly", "annual", "lifetime"]).optional() });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
    const { orderId, plan } = parsed.data;
    const data = await capturePayPalOrder(orderId);
    // Similar upgrade logic but we need auth to know userId for sure
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({ where: { email: session.user.email.toLowerCase() } });
      if (user) {
        const pu = (data as any).purchase_units?.[0];
        const capture = pu?.payments?.captures?.[0];
        const amount = capture?.amount?.value ? Math.round(parseFloat(capture.amount.value) * 100) : null;
        const existing = await prisma.subscription.findFirst({ where: { providerId: capture?.id || orderId, provider: "paypal" } });
        if (!existing) {
          await prisma.subscription.create({
            data: {
              userId: user.id,
              provider: "paypal",
              providerId: capture?.id || orderId,
              plan: plan || "monthly",
              status: "active",
              amount: amount || null,
              currency: capture?.amount?.currency_code || "USD",
              currentPeriodEnd: (plan || "monthly") === "lifetime" ? null : new Date(Date.now() + ((plan || "monthly") === "annual" ? 365 : 30) * 24 * 60 * 60 * 1000),
            },
          });
          await prisma.user.update({ where: { id: user.id }, data: { plan: "pro" } });
        }
      }
    }
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
