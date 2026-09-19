export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/courses/lesson?lessonId=... — on-demand lesson content.
// Gated: free lessons (free course or order<=3) open for everyone; the rest
// require Pro. Keeping bodies out of the catalog response prevents content
// leaks AND keeps that payload tiny.
export async function GET(req: NextRequest) {
  const lessonId = req.nextUrl.searchParams.get("lessonId") || "";
  if (!lessonId) return NextResponse.json({ error: "lessonId required" }, { status: 400 });

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { course: { select: { free: true, title: true, slug: true } } },
  });
  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  const isFree = lesson.course.free || lesson.order <= 3;
  if (!isFree) {
    const session = await auth().catch(() => null);
    const isPro = (session?.user as any)?.plan === "pro";
    if (!isPro) return NextResponse.json({ error: "Pro required", code: "PAYWALL" }, { status: 402 });
  }

  return NextResponse.json({
    lesson: {
      id: lesson.id,
      order: lesson.order,
      title: lesson.title,
      body: lesson.body,
      drill: lesson.drill,
      minutes: lesson.minutes,
      courseTitle: lesson.course.title,
      courseSlug: lesson.course.slug,
    },
  });
}
