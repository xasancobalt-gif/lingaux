import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main(){
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || "LINGAUXAdmin2026!";
  const adminHash = await bcrypt.hash(adminPassword, 10);

  // Admins — full control: edit/delete/add/pin/feature anything
  for (const email of ["ghalmenandkumar@gmail.com","xasancobalt@gmail.com"]) {
    await prisma.user.upsert({
      where:{ email: email.toLowerCase() },
      update:{ role:"admin", plan:"pro" },
      create:{
        email: email.toLowerCase(),
        name: email.split("@")[0],
        password: adminHash,
        role: "admin",
        plan: "pro",
        xp: 0,
        level: 1,
        streak: 0,
      }
    });
    if (process.env.NODE_ENV !== "production") {
      console.log(`Admin ensured: ${email} — role admin (password from ADMIN_SEED_PASSWORD env)`);
    }
  }

  // NOTE: No demo users, demo recordings, demo posts or demo messages are
  // seeded on purpose — every account must see only its own real data
  // (or an honest empty state). Catalog below is real product content.

  // Courses — LINGAUX Academy (full lesson content from course-content.json).
  // Idempotent: refreshes titles/descriptions and upserts every lesson body,
  // so content edits land on re-seed without duplicating rows.
  const fs = await import("fs");
  const path = await import("path");
  const contentFile = path.join(__dirname, "course-content.json");
  const catalog = JSON.parse(fs.readFileSync(contentFile, "utf-8")) as {
    courses: {
      slug: string; title: string; track: string; free: boolean; duration: string;
      image: string; videoUrl: string | null; description: string;
      lessons: { o: number; t: string; min: number; body: string; drill: string }[];
    }[];
  };

  let lessonCount = 0;
  for (const c of catalog.courses) {
    const course = await prisma.course.upsert({
      where: { slug: c.slug },
      update: { title: c.title, track: c.track, free: c.free, duration: c.duration, image: c.image, videoUrl: c.videoUrl, description: c.description, lessons: c.lessons.length, isActive: true },
      create: { title: c.title, slug: c.slug, track: c.track, free: c.free, duration: c.duration, image: c.image, videoUrl: c.videoUrl, description: c.description, lessons: c.lessons.length, isActive: true },
    });
    for (const l of c.lessons) {
      // Free rule: free courses fully free; paid courses keep first 3 lessons free.
      const isFree = c.free || l.o <= 3;
      await prisma.lesson.upsert({
        where: { courseId_order: { courseId: course.id, order: l.o } },
        update: { title: l.t, body: l.body, drill: l.drill, minutes: l.min, free: isFree },
        create: { courseId: course.id, order: l.o, title: l.t, body: l.body, drill: l.drill, minutes: l.min, free: isFree },
      });
      lessonCount++;
    }
  }
  console.log(`Courses seeded: ${catalog.courses.length}, lessons: ${lessonCount}`);

  // Products
  const prodCount = await prisma.product.count();
  if(prodCount===0){
    await prisma.product.createMany({
      data:[
        { name:"LINGAUX Pro Monthly", slug:"pro-monthly", description:"Unlimited Triple-Scan + Community", price:19900, currency:"INR", isActive:true },
        { name:"LINGAUX Pro Annual", slug:"pro-annual", description:"Save 38% — best for serious", price:149000, currency:"INR", isActive:true },
        { name:"LINGAUX Lifetime", slug:"lifetime", description:"Pay once, forever", price:399900, currency:"INR", isActive:true },
        { name:"1:1 Coach Session (30m)", slug:"coach-30m", description:"Live feedback with coach", price:99900, currency:"INR", isActive:true },
        { name:"Game Plan PDF Print", slug:"pdf-print", description:"Your 30-day plan printed", price:49900, currency:"INR", isActive:true },
      ]
    });
    console.log("Products seeded: 5");
  }

  // Ensure referral codes for existing users
  const usersNoCode = await prisma.user.findMany({ where: { referralCode: null } });
  for(const u of usersNoCode){
    const code = `LINGAUX-${(u.name||u.email||"USER").slice(0,4).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    await prisma.user.update({ where: { id: u.id }, data: { referralCode: code } }).catch(()=>{});
  }

  console.log("Seed done: admins + catalog ensured, no demo users created");
}

main().then(()=>process.exit(0)).catch(e=>{ console.error(e); process.exit(1); });
