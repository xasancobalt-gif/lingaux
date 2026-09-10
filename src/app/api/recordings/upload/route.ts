import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

// POST /api/recordings/upload — multipart: file + topic + duration
// Uploads to Supabase Storage (recordings bucket) if configured, else stores locally as base64 placeholder
// Creates Recording row + returns videoUrl + recording
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email.toLowerCase() } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Freemium check
  if (user.plan === "free") {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const count = await prisma.recording.count({ where: { userId: user.id, recordedAt: { gte: weekAgo } } });
    if (count >= 3) return NextResponse.json({ error: "Free limit 3/week. Upgrade to Pro.", code: "PAYWALL" }, { status: 403 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const topic = (form.get("topic") as string) || "Untitled";
    const duration = parseInt((form.get("duration") as string) || "180");

    if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });

    let videoUrl: string | null = null;

    if (isSupabaseConfigured() && supabaseAdmin) {
      const ext = file.name.split(".").pop() || "webm";
      const key = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
      const buf = Buffer.from(await file.arrayBuffer());
      const { error } = await supabaseAdmin.storage.from("recordings").upload(key, buf, {
        contentType: file.type || "video/webm",
        upsert: false,
      });
      if (error) throw new Error(`Supabase upload failed: ${error.message}`);
      const { data } = supabaseAdmin.storage.from("recordings").getPublicUrl(key);
      videoUrl = data.publicUrl;
    } else {
      // No Supabase — create a data URL placeholder (for demo, not for production large files)
      // In real prod without Supabase, you'd store to local disk or S3. Here we just note fallback.
      videoUrl = `local://${file.name}-${file.size}`;
    }

    const now = new Date();
    const unlockAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const recording = await prisma.recording.create({
      data: {
        userId: user.id,
        topic,
        duration,
        videoUrl,
        status: "locked",
        recordedAt: now,
        reviewUnlockAt: unlockAt,
      },
    });

    return NextResponse.json({ recording, videoUrl, unlockAt, storedIn: isSupabaseConfigured() ? "supabase" : "local-fallback" }, { status: 201 });
  } catch (e: any) {
    console.error("[recordings/upload]", e);
    return NextResponse.json({ error: e.message || "Upload failed" }, { status: 500 });
  }
}
