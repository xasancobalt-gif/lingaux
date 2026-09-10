import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { requireAdmin } from "@/lib/admin-guard";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';

// GET /api/admin/subscriptions — list subs + pending bank
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  const subs = await prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json({ subscriptions: subs });
}

// PATCH /api/admin/subscriptions — approve bank transfer etc
export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await req.json();
  const { subscriptionId, status } = body as { subscriptionId: string; status: string };
  if (!subscriptionId || !status) return NextResponse.json({ error: "subscriptionId + status required" }, { status: 400 });
  const sub = await prisma.subscription.update({ where: { id: subscriptionId }, data: { status } });
  if (status === "active") {
    await prisma.user.update({ where: { id: sub.userId }, data: { plan: "pro" } });
  }
  return NextResponse.json({ subscription: sub });
}
