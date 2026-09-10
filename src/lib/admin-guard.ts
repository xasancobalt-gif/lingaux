import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function requireAdmin() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase() || null;
  if (!session || !email) {
    return { error: NextResponse.json({ error: "Unauthorized — sign in" }, { status: 401 }), session: null, email: null, user: null };
  }
  // Check DB role too (allows promoting via DB even if email not in hardcoded list)
  let dbUser = null;
  try { dbUser = await prisma.user.findUnique({ where: { email } }); } catch {}
  const isAdminByEmail = isAdmin(email);
  const isAdminByRole = dbUser?.role === "admin";
  if (!isAdminByEmail && !isAdminByRole) {
    return { error: NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 }), session, email, user: dbUser };
  }
  return { error: null, session, email, user: dbUser };
}

export async function ensureAdminRole(email: string) {
  // Called on sign-in/register to auto-promote admin emails
  const lower = email.toLowerCase();
  if (isAdmin(lower)) {
    await prisma.user.update({ where: { email: lower }, data: { role: "admin" } }).catch(() => {});
  }
}
