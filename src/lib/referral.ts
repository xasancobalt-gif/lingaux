import { prisma } from "@/lib/prisma";

export function generateReferralCode(nameOrEmail: string): string {
  const base = nameOrEmail.split("@")[0].replace(/[^a-z0-9]/gi, "").slice(0,6).toUpperCase() || "LINGAUX";
  const rand = Math.random().toString(36).slice(2,6).toUpperCase();
  return `LINGAUX-${base}-${rand}`;
}

export async function ensureReferralCode(userId: string, nameOrEmail: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.referralCode) return user.referralCode;
  for (let i=0;i<5;i++){
    const code = generateReferralCode(nameOrEmail);
    try{
      const updated = await prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
      return updated.referralCode!;
    }catch{
      // retry on unique collision
    }
  }
  throw new Error("Failed to generate referral code");
}

export async function creditReferral(referrerCode: string, newUserId: string) {
  const referrer = await prisma.user.findUnique({ where: { referralCode: referrerCode } });
  if (!referrer) return null;
  if (referrer.id === newUserId) return null; // self
  // Check already referred?
  const existing = await prisma.referral.findUnique({ where: { referredId: newUserId } });
  if (existing) return null;
  // Create referral + credit 80 coins
  const referral = await prisma.referral.create({
    data: { referrerId: referrer.id, referredId: newUserId, coins: 80 },
  });
  await prisma.user.update({ where: { id: referrer.id }, data: { coins: { increment: 80 } } });
  await prisma.coinTransaction.create({
    data: { userId: referrer.id, amount: 80, reason: "referral", meta: `Referred ${newUserId}` },
  });
  // Update new user's referredBy
  await prisma.user.update({ where: { id: newUserId }, data: { referredById: referrer.id } });
  return referral;
}
