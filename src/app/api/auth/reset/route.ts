import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ============================================================================
// POST /api/auth/reset — second half of password reset (launched by /forgot).
//
//  - token is SHA-256-hashed here (same hashing as forgot) and compared to the
//    hash stored at forgot-time. Raw token value only ever lives in the email link.
//  - Single use: usedAt is set before we reply, so a replayed link dies.
//  - Expiring: any link past expiresAt is refused.
//  - sessionVersion bump: <auth-session-version-bump>
// ============================================================================

const resetSchema = z.object({
  token: z.string().min(24).max(2048),
  password: z.string().min(8).max(128),
});

// Must hash EXACTLY like forgot-time: sha256(raw + AUTH_SECRET).
// (A previous version hashed without the secret here, so no link ever validated.)
function tokenHashFor(raw: string): string {
  return crypto.createHash("sha256").update(raw + (process.env.AUTH_SECRET || "voxa-reset")).digest("hex");
}

export async function POST(req: NextRequest) {
  const t0 = Date.now();
  let body: any = {};
  try { body = await req.json(); } catch {}

  const parsed = resetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid reset link — please request a new one." },
      { status: 400 }
    );
  }

  const { token, password } = parsed.data;
  const tokenHash = tokenHashFor(token);

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  const invalid =
    !record ||
    record.usedAt !== null ||
    record.expiresAt.getTime() < Date.now();

  if (invalid) {
    // Never reveal whether it was the token, an expiry, or a replay.
    return NextResponse.json(
      { ok: false, error: "Invalid, expired, or already-used reset link." },
      { status: 400 }
    );
  }

  const user = record.user;
  const passwordHash = await bcrypt.hash(password, 12);

  // Atomically: consume the token + set new hash + bump sessionVersion so any
  // JWT/session issued against the OLD password is invalidated.
  await prisma.$transaction([
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: {
        password: passwordHash,
        sessionVersion: { increment: 1 },
      },
    }),
  ]);

  // Keep timing uniform-ish; the caller will sign in with the new password.
  const minWait = Math.max(0, 450 - (Date.now() - t0));
  if (minWait > 0) await new Promise((r) => setTimeout(r, minWait));

  return NextResponse.json({ ok: true });
}
