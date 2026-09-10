import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import OpenAI from "openai";

// POST /api/transcribe — form-data: file (audio/video) -> Whisper transcript
// If OPENAI_API_KEY missing, returns mock transcript (so UI works without billing)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const topic = (form.get("topic") as string) || "general";

    if (!file) return NextResponse.json({ error: "file required (audio/webm, mp4, mp3, wav)" }, { status: 400 });

    // Size guard: 25MB Whisper limit
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large — max 25MB for Whisper" }, { status: 413 });
    }

    if (!process.env.OPENAI_API_KEY) {
      // Mock — deterministic from topic + size
      let hash = 0;
      for (let i = 0; i < topic.length; i++) hash = (hash * 31 + topic.charCodeAt(i)) % 1000;
      const mock = `So today I want to talk about ${topic.toLowerCase()} and um like it's really important because ... [mock transcript — set OPENAI_API_KEY for real Whisper, file ${file.name} ${Math.round(file.size/1024)}KB] The first point is confidence. When I pitched to my manager, I froze. That's when I learned structure matters.`;
      return NextResponse.json({ transcript: mock, mock: true, durationEstimate: Math.round(file.size / 16000) });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // OpenAI expects File with name — NextRequest File already has name/type
    const transcription = await openai.audio.transcriptions.create({
      // @ts-ignore — File from web is compatible
      file: file as any,
      model: "whisper-1",
      language: "en",
      response_format: "json",
    });

    return NextResponse.json({ transcript: transcription.text, mock: false });
  } catch (e: any) {
    console.error("[transcribe]", e);
    return NextResponse.json({ error: e.message || "Transcribe failed" }, { status: 500 });
  }
}
