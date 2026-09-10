import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { auth } from "@/lib/auth";
export const dynamic = 'force-dynamic';
import { createPayPalOrder, isPayPalConfigured } from "@/lib/paypal";
export const dynamic = 'force-dynamic';
import { z } from "zod";
export const dynamic = 'force-dynamic';

const schema = z.object({ plan: z.enum(["monthly", "annual", "lifetime"]) });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isPayPalConfigured()) {
    return NextResponse.json(
      { error: "PayPal not configured. Set PAYPAL_CLIENT_ID and PAYPAL_SECRET in .env (sandbox). Using mock for now.", code: "NOT_CONFIGURED" },
      { status: 503 }
    );
  }
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const plan = parsed.data.plan;
  const userId = (session.user as any).id as string;

  try {
    const { orderId, approveUrl } = await createPayPalOrder(plan, userId, session.user.email!);
    return NextResponse.json({ orderId, approveUrl });
  } catch (e: any) {
    console.error("[paypal create]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
