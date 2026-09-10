import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main(){
  const hash = await bcrypt.hash("password123", 10);
  const adminHash = await bcrypt.hash("VoxaAdmin2026!", 10);

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
        xp: 9999,
        level: 99,
      }
    });
    console.log(`Admin ensured: ${email} / password: VoxaAdmin2026! (change after first login)`);
  }

  const demo = await prisma.user.upsert({
    where:{ email: "demo@voxa.app" },
    update:{},
    create:{
      email: "demo@voxa.app",
      name: "Aarav Demo",
      password: hash,
      plan: "pro",
      xp: 1240,
      level: 8,
      streak: 7,
      track: "career",
      image: "https://i.pravatar.cc/150?img=33",
    }
  });

  const existingRec = await prisma.recording.findFirst({ where:{ userId: demo.id }});
  if (!existingRec) {
    const rec = await prisma.recording.create({
      data:{
        userId: demo.id,
        topic: "Explain why communication is the #1 career skill",
        duration: 303,
        status: "reviewed",
        recordedAt: new Date(Date.now() - 2*24*60*60*1000),
        reviewUnlockAt: new Date(Date.now() - 24*60*60*1000),
        transcript: "So today I want to talk about communication and um like it's really important because ...",
      }
    });

    await prisma.review.create({
      data:{
        recordingId: rec.id,
        audioScore: 6.8,
        videoScore: 5.9,
        transcriptScore: 6.5,
        overallScore: 6.4,
        fillerCount: 23,
        fillerDetails: JSON.stringify({um:12, ah:7, like:4}),
        paceWpm: 118,
        pauseCount: 4,
        eyeContactPct: 42,
        weaknesses: JSON.stringify(["Filler like/um","Pace too slow","Eye contact 42%","No framework"]),
        aiFeedback: "You open strong but use 'like' as a crutch. Replace with 1.2s silence. Pace 12% slow.",
        structureIssue: JSON.stringify(["No clear framework"]),
        vocabIssues: JSON.stringify(["very x6"]),
        strongPoints: JSON.stringify(["Strong ending"]),
      }
    });
  }

  const sofia = await prisma.user.upsert({
    where:{ email:"sofia@voxa.app"},
    update:{},
    create:{ email:"sofia@voxa.app", name:"Sofia K.", image:"https://i.pravatar.cc/150?img=5", plan:"pro" }
  });

  const postCount = await prisma.communityPost.count();
  if (postCount===0){
    await prisma.communityPost.createMany({
      data:[
        { userId: sofia.id, content:"Finally nailed the pause! Thanks to feedback from @Kenji", day:23, likes:89 },
        { userId: demo.id, content:"Day 11 check-in: working on pace. Feedback?", day:11, likes:34 },
      ]
    });
  }

  const convExists = await prisma.conversation.findFirst();
  if (!convExists){
    const conv = await prisma.conversation.create({
      data:{ participantIds: JSON.stringify([demo.id, sofia.id]), isGroup:false }
    });
    await prisma.message.create({
      data:{ conversationId: conv.id, senderId: sofia.id, content:"Great pause at 2:34! Try 2x more" }
    });
  }

  // Courses — LINGAUX Academy
  const courseCount = await prisma.course.count();
  if(courseCount===0){
    await prisma.course.createMany({
      data:[
        { title:"The 30-Day Game Plan", slug:"30-day-game-plan", track:"general", lessons:8, duration:"8 lessons • LINGAUX method", free:true, image:"https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=60", videoUrl:"https://www.youtube.com/embed/dQw4w9WgXcQ", description:"The science-backed loop: record 5-min, wait 24h, triple-scan, fix 1/week. Your foundation.", isActive:true },
        { title:"Storytelling for Work", slug:"storytelling-for-work", track:"career", lessons:12, duration:"12 lessons • STAR + Hero arc", free:false, image:"https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&auto=format&fit=crop&q=60", videoUrl:"https://www.youtube.com/embed/9bZkp7q19f0", description:"STAR answers, hero arc, executive presence for interviews & meetings.", isActive:true },
        { title:"Voice & Body Masterclass", slug:"voice-body-masterclass", track:"creator", lessons:10, duration:"10 lessons • Pace, pause, gesture", free:false, image:"https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&auto=format&fit=crop&q=60", videoUrl:"https://www.youtube.com/embed/kJQP7kiw5Fk", description:"Pace, pause, vocal variety, eye contact, gesture system.", isActive:true },
        { title:"Interview OS", slug:"interview-os", track:"career", lessons:6, duration:"6 lessons • FAANG answers", free:false, image:"https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&auto=format&fit=crop&q=60", videoUrl:"https://www.youtube.com/embed/OPf0YbXqDm0", description:"FAANG-style STAR answers, salary negotiation, whiteboard communication.", isActive:true },
        { title:"Network Without Fear", slug:"network-without-fear", track:"social", lessons:5, duration:"5 lessons • Small talk system", free:true, image:"https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=60", videoUrl:"https://www.youtube.com/embed/2Vv-BfVoq4g", description:"Small talk, networking, dating conversations — system for social confidence.", isActive:true },
        { title:"Creator Voice Lab", slug:"creator-voice-lab", track:"creator", lessons:7, duration:"7 lessons • Hook + retention", free:false, image:"https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=600&auto=format&fit=crop&q=60", videoUrl:"https://www.youtube.com/embed/hT_nvWreIhg", description:"Reels, podcasts, pitching with hook, retention, CTA.", isActive:true },
      ]
    });
    console.log("Courses seeded: 6");
  }

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

  console.log("Seed done:", { demo: demo.email });
}

main().then(()=>process.exit(0)).catch(e=>{ console.error(e); process.exit(1); });
