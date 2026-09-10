export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
// GET /api/admin/recordings — list all recordings
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  const recordings = await prisma.recording.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { id: true, name: true, email: true } }, review: true },
  });
  return NextResponse.json({ recordings });
}

// DELETE /api/admin/recordings?recordingId=xxx — admin can delete any recording
export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  const recordingId = new URL(req.url).searchParams.get("recordingId");
  if (!recordingId) return NextResponse.json({ error: "recordingId required" }, { status: 400 });
  await prisma.review.deleteMany({ where: { recordingId } });
  await prisma.recording.delete({ where: { id: recordingId } });
  return NextResponse.json({ ok: true });
}

// PATCH /api/admin/recordings — edit topic/transcript
export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await req.json();
  const { recordingId, topic, transcript } = body as { recordingId: string; topic?: string; transcript?: string };
  if (!recordingId) return NextResponse.json({ error: "recordingId required" }, { status: 400 });
  const data: any = {};
  if (topic) data.topic = topic;
  if (transcript !== undefined) data.transcript = transcript;
  const rec = await prisma.recording.update({ where: { id: recordingId }, data });
  return NextResponse.json({ recording: rec });
}
