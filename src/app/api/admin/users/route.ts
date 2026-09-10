import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// GET /api/admin/users?limit=50 — list all users (admin only)
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const limit = Math.min(100, parseInt(new URL(req.url).searchParams.get("limit") || "50"));
  const q = new URL(req.url).searchParams.get("q") || "";

  const users = await prisma.user.findMany({
    where: q ? { OR: [{ email: { contains: q } }, { name: { contains: q } }] } : {},
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, name: true, email: true, role: true, plan: true, xp: true, level: true, createdAt: true, track: true },
  });
  return NextResponse.json({ users });
}

const patchSchema = z.object({
  userId: z.string(),
  role: z.enum(["user", "admin"]).optional(),
  plan: z.enum(["free", "pro", "lifetime"]).optional(),
  xp: z.number().int().optional(),
});

// PATCH /api/admin/users — update role/plan/xp
export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid", issues: parsed.error.issues }, { status: 400 });

  const { userId, role, plan, xp } = parsed.data;
  const data: any = {};
  if (role) data.role = role;
  if (plan) data.plan = plan;
  if (typeof xp === "number") data.xp = xp;

  const user = await prisma.user.update({ where: { id: userId }, data });
  return NextResponse.json({ user });
}

// DELETE /api/admin/users?userId=xxx — delete user and cascade
export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const userId = new URL(req.url).searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  // Prevent deleting self admin
  const admin = await requireAdmin();
  // We already checked, but ensure not deleting own admin if last admin
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (target.email?.toLowerCase() === "ghalmenandkumar@gmail.com" || target.email?.toLowerCase() === "xasancobalt@gmail.com") {
    return NextResponse.json({ error: "Cannot delete primary admin" }, { status: 403 });
  }

  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ ok: true });
}
