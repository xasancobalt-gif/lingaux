import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/leaderboard — top 100 by XP, public
export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: [{ xp: "desc" }, { createdAt: "asc" }],
    take: 100,
    select: { id: true, name: true, email: true, image: true, xp: true, level: true, streak: true, track: true, plan: true },
  });

  // Add rank
  const leaderboard = users.map((u, i) => ({
    rank: i + 1,
    id: u.id,
    name: u.name || u.email?.split("@")[0],
    image: u.image,
    xp: u.xp,
    level: u.level,
    streak: u.streak,
    track: u.track,
    plan: u.plan,
    // Hide full email for privacy
    emailMasked: u.email ? u.email.replace(/(.{2}).+@/, "$1***@") : "",
  }));

  return NextResponse.json({ leaderboard });
}
