import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';
import bcrypt from "bcryptjs";
export const dynamic = 'force-dynamic';
import { z } from "zod";
export const dynamic = 'force-dynamic';

const schema = z.object({
  name: z.string().min(1).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  track: z.string().optional(),
  refCode: z.string().optional(), // referral code e.g. LINGAUX-AARAV-8X2K
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });

    const { name, email, password, track, refCode } = parsed.data;
    const lower = email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: lower } });
    if (existing) return NextResponse.json({ error: "Email already registered. Please sign in." }, { status: 409 });

    const hashed = await bcrypt.hash(password, 10);
    const isAdmin = ["ghalmenandkumar@gmail.com","xasancobalt@gmail.com"].includes(lower);
    // Generate referral code for new user
    const { generateReferralCode } = await import("@/lib/referral");
    let newCode = generateReferralCode(name || email);
    // Ensure unique
    for(let i=0;i<3;i++){
      const exists = await prisma.user.findUnique({ where: { referralCode: newCode } });
      if(!exists) break;
      newCode = generateReferralCode(name || email);
    }

    const user = await prisma.user.create({
      data: {
        name,
        email: lower,
        password: hashed,
        track: track || null,
        plan: isAdmin ? "pro" : "free",
        role: isAdmin ? "admin" : "user",
        referralCode: newCode,
      },
      select: { id: true, email: true, name: true, role: true, referralCode: true },
    });

    // Credit referrer if code provided (80 coins)
    if (refCode) {
      try {
        const { creditReferral } = await import("@/lib/referral");
        await creditReferral(refCode.toUpperCase().trim(), user.id);
      } catch {}
    }

    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (e) {
    console.error("[register]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
