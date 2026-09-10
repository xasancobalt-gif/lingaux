import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  let courses = await prisma.course.findMany({ where: { isActive: true }, orderBy: { createdAt: "asc" } });
  if (courses.length === 0) {
    // Fallback to mock if DB empty (seed will fill)
    courses = [
      { id: "mock1", title: "The 30-Day Game Plan", slug: "30-day-game-plan", track: "general", lessons: 8, duration: "8 lessons • LINGAUX method", free: true, image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=60", videoUrl: "https://www.youtube.com/embed/U40qvUiefQo", description: "The science-backed loop: record, wait 24h, triple-scan, fix 1/week.", isActive: true, createdAt: new Date(), updatedAt: new Date() } as any,
    ];
  }
  return NextResponse.json({ courses });
}
