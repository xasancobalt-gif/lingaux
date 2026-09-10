export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
const schema = z.object({ slug: z.string() });

// POST /api/products/buy { slug } — pay with coins (80 coins = 80rs)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email.toLowerCase() } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const product = await prisma.product.findUnique({ where: { slug: parsed.data.slug } });
  if (!product || !product.isActive) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const priceCoins = Math.round(product.price / 100); // paise → rs → coins 1:1
  if (user.coins < priceCoins) {
    return NextResponse.json({ error: `Not enough coins. Need ${priceCoins}, you have ${user.coins}. Refer 1 friend = 80 coins.`, code: "INSUFFICIENT_COINS" }, { status: 402 });
  }

  await prisma.user.update({ where: { id: user.id }, data: { coins: { decrement: priceCoins } } });
  await prisma.coinTransaction.create({ data: { userId: user.id, amount: -priceCoins, reason: "product", meta: product.slug } });

  // If buying pro, also upgrade plan
  if (product.slug.includes("pro") || product.slug.includes("lifetime")) {
    const plan = product.slug.includes("annual") ? "annual" : product.slug.includes("lifetime") ? "lifetime" : "monthly";
    await prisma.subscription.create({
      data: { userId: user.id, provider: "coins", plan, status: "active", amount: product.price, currency: product.currency },
    });
    await prisma.user.update({ where: { id: user.id }, data: { plan: "pro" } });
  }

  return NextResponse.json({ ok: true, product, priceCoins, remaining: user.coins - priceCoins });
}
