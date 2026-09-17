export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { isAdmin, getAdminEmails } from "@/lib/admin";

// GET /api/debug/auth — self-diagnosis for email auth failures (NO secrets returned)
export async function GET() {
  const out: Record<string, any> = { ts: new Date().toISOString(), buildSha: process.env.VERCEL_GIT_COMMIT_SHA || null };

  const maskHost = (u?: string) => {
    if (!u) return null;
    try {
      const p = new URL(u.replace(/^[a-z]+:\/\//i, "postgresql://"));
      return { user: p.username || null, host: p.hostname, port: p.port || 5432 };
    } catch { return { raw: "unparseable" }; }
  };

  out.env = {
    DATABASE_URL: maskHost(process.env.DATABASE_URL),
    DIRECT_URL: maskHost(process.env.DIRECT_URL),
    AUTH_URL: process.env.AUTH_URL || null,
    AUTH_SECRET_set: !!process.env.AUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
    ADMIN_EMAILS: getAdminEmails().length + " configured",
    host: process.env.VERCEL_ENV ? `vercel(${process.env.VERCEL_ENV})` : "local",
    isAdminOf: (globalThis as any).__remoteEmail ? false : undefined,
  };

  // 2) Live DB ping
  try {
    const { prisma } = await import("@/lib/prisma");
    const r = await prisma.$queryRaw`SELECT 1 as ok`;
    out.db = { ok: true, result: r };
  } catch (e: any) {
    out.db = { ok: false, code: e?.code || "", message: ((e?.message || "") + "").slice(0, 400) };
  }

  // 3) Count users (proves DB has data + connect works from Vercel)
  if (out.db?.ok) {
    try {
      const { prisma } = await import("@/lib/prisma");
      out.db.userCount = await prisma.user.count();
    } catch { out.db.userCount = "n/a"; }
  }

  // 3b) Schema check — do the auth-critical tables/columns exist on THIS DB?
  if (out.db?.ok) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const schema: any[] = await prisma.$queryRawUnsafe(
        `SELECT table_name, column_name FROM information_schema.columns
         WHERE table_schema='public' AND (
           (table_name='User' AND column_name='sessionVersion')
           OR table_name='PasswordResetToken'
         ) ORDER BY table_name`
      );
      out.db.schema = {
        hasSessionVersion: schema.some((r: any) => r.table_name === "User" && r.column_name === "sessionVersion"),
        resetTableCols: schema.filter((r: any) => r.table_name === "PasswordResetToken").map((r: any) => r.column_name),
      };
    } catch (e: any) {
      out.db.schema = { error: ((e?.message || "") + "").slice(0, 200) };
    }
  }

  // 4) Auth config sanity (no secrets)
  out.auth = {
    strategy: "jwt",
    adapter: "prisma",
    providers: ["credentials", ...(process.env.GOOGLE_CLIENT_ID ? ["google"] : []), ...(process.env.APPLE_CLIENT_ID ? ["apple"] : []), ...(process.env.LINKEDIN_CLIENT_ID ? ["linkedin"] : [])],
    signInPath: "/api/auth/callback/credentials registered: true",
  };

  out.adminCheck = {
    sampleEmailIsAdmin: isAdmin("xasancobalt@gmail.com"),
    envVarListHint: "set ADMIN_EMAILS in Vercel for future-proofing",
  };

  return NextResponse.json(out);
}