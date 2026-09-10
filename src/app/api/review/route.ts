import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mockTripleScan, realTripleScan } from "@/lib/ai";
import { z } from "zod";

const schema = z.object({
  recordingId: z.string().cuid(),
  // Optional: if client did Whisper locally, send transcript to avoid re-transcribe
  transcript: z.string().optional(),
});

// POST /api/review — trigger Triple-Scan (respects 24h lock unless ?force=1 for demo)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email.toLowerCase() } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid", issues: parsed.error.issues }, { status: 400 });

  const { recordingId, transcript: transcriptOverride } = parsed.data;

  const recording = await prisma.recording.findUnique({ where: { id: recordingId }, include: { review: true } });
  if (!recording) return NextResponse.json({ error: "Recording not found" }, { status: 404 });
  if (recording.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (recording.review) return NextResponse.json({ review: recording.review, cached: true });

  const now = new Date();
  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "1";
  if (!force && recording.reviewUnlockAt > now) {
    const hoursLeft = Math.ceil((recording.reviewUnlockAt.getTime() - now.getTime()) / 3600000);
    return NextResponse.json(
      { error: `Detachment lock: ${hoursLeft}h left. Wait 24h for objective review (LINGAUX method). Use ?force=1 to bypass for demo.`, code: "LOCKED", hoursLeft },
      { status: 423 }
    );
  }

  // Pro gate: Triple-Scan is Pro feature (audio-only free limited). Here we gate full.
  // For demo, allow but mark. In production, check user.plan === 'free' then return paywall for 2nd scan.
  // We'll allow first scan free.
  const priorReviews = await prisma.review.count({ where: { recording: { userId: user.id } } });
  if (user.plan === "free" && priorReviews >= 1) {
    return NextResponse.json(
      { error: "Pro required for Triple-Scan. Free includes 1 scan. Upgrade to unlock.", code: "PAYWALL" },
      { status: 403 }
    );
  }

  // Run scan — mock if no OPENAI_API_KEY, real if present
  const scan = transcriptOverride
    ? await realTripleScan(recording.topic, recording.duration, { transcriptOverride })
    : (process.env.OPENAI_API_KEY ? await realTripleScan(recording.topic, recording.duration) : mockTripleScan(recording.topic, recording.duration));

  // Persist transcript to recording if missing
  if (!recording.transcript) {
    await prisma.recording.update({ where: { id: recording.id }, data: { transcript: scan.transcript, status: "reviewed" } });
  }

  const review = await prisma.review.create({
    data: {
      recordingId: recording.id,
      audioScore: scan.audioScore,
      videoScore: scan.videoScore,
      transcriptScore: scan.transcriptScore,
      overallScore: scan.overall,
      fillerCount: scan.fillerCount,
      fillerDetails: JSON.stringify(scan.fillerDetails),
      paceWpm: scan.paceWpm,
      pauseCount: scan.pauseCount,
      eyeContactPct: scan.eyeContactPct,
      gestureScore: scan.videoScore,
      postureScore: scan.videoScore,
      structureIssue: JSON.stringify(scan.structureIssue),
      vocabIssues: JSON.stringify(scan.vocabIssues),
      strongPoints: JSON.stringify(scan.strongPoints),
      weaknesses: JSON.stringify(scan.weaknesses),
      aiFeedback: scan.aiFeedback,
    },
  });

  // XP reward: +40 for completing review
  await prisma.user.update({ where: { id: user.id }, data: { xp: { increment: 40 }, streak: { increment: 0 } } });

  return NextResponse.json({ review, transcript: scan.transcript }, { status: 201 });
}

// GET /api/review?recordingId=...
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const recordingId = new URL(req.url).searchParams.get("recordingId");
  if (!recordingId) return NextResponse.json({ error: "recordingId required" }, { status: 400 });

  const recording = await prisma.recording.findUnique({ where: { id: recordingId }, include: { review: true } });
  if (!recording) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email.toLowerCase() } });
  if (recording.userId !== user?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const now = new Date();
  const locked = recording.reviewUnlockAt > now;
  return NextResponse.json({ recording, review: recording.review || null, locked, hoursLeft: locked ? Math.ceil((recording.reviewUnlockAt.getTime() - now.getTime())/3600000) : 0 });
}
