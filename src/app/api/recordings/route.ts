import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { auth } from "@/lib/auth";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';
import { z } from "zod";
export const dynamic = 'force-dynamic';

const createSchema = z.object({
  topic: z.string().min(3).max(300),
  duration: z.number().min(5).max(600), // 5s - 10m
  videoUrl: z.string().url().optional().or(z.literal("")),
  audioUrl: z.string().url().optional().or(z.literal("")),
});

// GET /api/recordings — list my recordings
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email.toLowerCase() } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const url = new URL(req.url);
  const limit = Math.min(50, parseInt(url.searchParams.get("limit") || "20"));

  const recordings = await prisma.recording.findMany({
    where: { userId: user.id },
    orderBy: { recordedAt: "desc" },
    take: limit,
    include: { review: true },
  });

  return NextResponse.json({ recordings });
}

// POST /api/recordings — create new 5-min recording (LINGAUX Step 1). Sets 24h lock.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized — please sign in" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email.toLowerCase() } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Freemium check: free = 1/week, pro = unlimited. Enforce here (simple: 3 max for free for demo)
  if (user.plan === "free") {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const count = await prisma.recording.count({ where: { userId: user.id, recordedAt: { gte: weekAgo } } });
    if (count >= 3) {
      return NextResponse.json(
        { error: "Free limit reached: 3 recordings/week. Upgrade to Pro for unlimited.", code: "PAYWALL" },
        { status: 403 }
      );
    }
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid", issues: parsed.error.issues }, { status: 400 });

  const { topic, duration, videoUrl, audioUrl } = parsed.data;
  const now = new Date();
  const unlockAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // LINGAUX 24h

  const rec = await prisma.recording.create({
    data: {
      userId: user.id,
      topic,
      duration,
      videoUrl: videoUrl || null,
      audioUrl: audioUrl || null,
      status: "locked", // locked until 24h
      recordedAt: now,
      reviewUnlockAt: unlockAt,
    },
  });

  return NextResponse.json({ recording: rec, unlockAt }, { status: 201 });
}
