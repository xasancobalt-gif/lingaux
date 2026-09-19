export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const courses = await prisma.course.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    include: {
      items: { orderBy: { order: "asc" }, select: { id: true, order: true, title: true, minutes: true, free: true } },
    },
  });

  // Per-user progress (lessonId set when completed)
  let done: string[] = [];
  const session = await auth().catch(() => null);
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email.toLowerCase() }, select: { id: true } }).catch(() => null);
    if (user) {
      const rows = await prisma.lessonProgress.findMany({ where: { userId: user.id }, select: { lessonId: true } }).catch(() => []);
      done = rows.map((r) => r.lessonId);
    }
  }

  // Free rule: free courses fully free; paid courses keep first 3 lessons free.
  const out = courses.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    track: c.track,
    lessons: c.lessons,
    duration: c.duration,
    free: c.free,
    image: c.image,
    description: c.description,
    items: c.items.map((l) => ({ ...l, free: c.free || l.order <= 3 })),
    doneLessonIds: done.filter((d) => c.items.some((l) => l.id === d)),
  }));

  return NextResponse.json({ courses: out });
}
