import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';

// GET /api/products — list active products
export async function GET() {
  const products = await prisma.product.findMany({ where: { isActive: true }, orderBy: { price: "asc" } });
  // Seed if empty
  if (products.length === 0) {
    const seeded = await prisma.product.createMany({
      data: [
        { name: "LINGAUX Pro Monthly", slug: "pro-monthly", description: "Unlimited Triple-Scan + Community", price: 19900, currency: "INR", image: null },
        { name: "LINGAUX Pro Annual", slug: "pro-annual", description: "Save 38% — best for serious", price: 149000, currency: "INR" },
        { name: "LINGAUX Lifetime", slug: "lifetime", description: "Pay once, forever", price: 399900, currency: "INR" },
        { name: "1:1 Coach Session (30m)", slug: "coach-30m", description: "Live feedback with Mira", price: 99900, currency: "INR" },
        { name: "Game Plan PDF Print", slug: "pdf-print", description: "Your 30-day plan printed", price: 49900, currency: "INR" },
      ],
    });
    const after = await prisma.product.findMany({ where: { isActive: true }, orderBy: { price: "asc" } });
    return NextResponse.json({ products: after });
  }
  return NextResponse.json({ products });
}
