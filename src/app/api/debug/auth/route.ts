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

  // 5) Payment config sanity (booleans only — NO secrets)
  out.payments = {
    cashfree: !!process.env.CASHFREE_APP_ID && !!process.env.CASHFREE_SECRET_KEY,
    cashfreeEnv: process.env.CASHFREE_ENV || "unset",
    razorpay: !!process.env.RAZORPAY_KEY_ID,
    paypal: !!process.env.PAYPAL_CLIENT_ID,
  };

  // 6) Full DB audit — table counts + orphans (no sensitive values)
  if (out.db?.ok) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const counts: Record<string, any> = {};
      for (const t of ["User","Recording","Review","CommunityPost","Comment","Subscription","Referral","CoinTransaction","Ticket","Product","Course","Lesson","LessonProgress","EmailOtp","PasswordResetToken"]) {
        try {
          (counts as any)[t] = await (prisma as any)[t.charAt(0).toLowerCase() + t.slice(1)].count();
        } catch { counts[t] = "n/a"; }
      }
      out.audit = { counts };

      // Orphans / integrity (all counts, no data)
      const orphans: Record<string, any> = {};
      try {
        orphans.recordingsNoUser = (await prisma.$queryRawUnsafe(`SELECT count(*)::int AS c FROM "Recording" r LEFT JOIN "User" u ON u.id=r."userId" WHERE u.id IS NULL`) as any[])[0].c;
        orphans.reviewsNoRecording = (await prisma.$queryRawUnsafe(`SELECT count(*)::int AS c FROM "Review" v LEFT JOIN "Recording" r ON r.id=v."recordingId" WHERE r.id IS NULL`) as any[])[0].c;
        orphans.lessonsNoCourse = (await prisma.$queryRawUnsafe(`SELECT count(*)::int AS c FROM "Lesson" l LEFT JOIN "Course" c ON c.id=l."courseId" WHERE c.id IS NULL`) as any[])[0].c;
        orphans.usersNoRefCode = (await prisma.$queryRawUnsafe(`SELECT count(*)::int AS c FROM "User" u WHERE u."referralCode" IS NULL`) as any[])[0].c;
        orphans.expiredLiveOtps = (await prisma.$queryRawUnsafe(`SELECT count(*)::int AS c FROM "EmailOtp" WHERE "usedAt" IS NULL AND "expiresAt" < NOW()`) as any[])[0].c;
      } catch (e: any) {
        orphans.error = ((e?.message || "") + "").slice(0, 200);
      }
      out.audit.orphans = orphans;

      // Course content coverage (lessons per course)
      try {
        const perCourse: any[] = await prisma.$queryRawUnsafe(`SELECT c.slug, count(l.id)::int AS lessons FROM "Course" c LEFT JOIN "Lesson" l ON l."courseId"=c.id GROUP BY c.slug ORDER BY c.slug`);
        out.audit.courses = perCourse;
      } catch {}
    } catch (e: any) {
      out.audit = { error: ((e?.message || "") + "").slice(0, 300) };
    }
  }

  return NextResponse.json(out);
}