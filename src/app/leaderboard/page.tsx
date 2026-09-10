"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function LeaderboardPage(){
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    fetch("/api/leaderboard").then(r=>r.json()).then(j=> setData(j.leaderboard||[])).finally(()=>setLoading(false));
  },[]);

  return (
    <div className="min-h-screen bg-mesh text-white">
      <header className="sticky top-0 z-30 glass-strong border-b border-white/10">
        <div className="max-w-[900px] mx-auto px-4 md:px-6 h-[64px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-black grid place-items-center font-black">★</div>
            <span className="font-black tracking-widest text-sm">LEADERBOARD</span>
          </Link>
          <Link href="/" className="px-4 py-2 rounded-full bg-white text-black text-sm font-bold">Back to App</Link>
        </div>
      </header>
      <main className="max-w-[900px] mx-auto px-4 md:px-6 py-8">
        <div className="glass-card rounded-[28px] p-6 md:p-8">
          <h1 className="font-serif text-3xl font-bold">Global Leaderboard <span className="text-gradient-gold">• Top 100</span></h1>
          <p className="text-sm text-white/60 mt-1">Ranked by XP. Record + Review + Posts + Streak. Updates live from DB.</p>
          {loading ? <div className="mt-6 text-white/40">Loading…</div> : (
            <div className="mt-6 space-y-2">
              {data.map((u:any)=>(
                <div key={u.id} className={`flex items-center gap-3 p-3 rounded-xl ${u.rank<=3? "glass-strong border-amber-400/20":"glass"}`}>
                  <span className={`w-8 h-8 rounded-full grid place-items-center text-sm font-black ${u.rank===1?"bg-amber-400 text-black": u.rank===2?"bg-zinc-300 text-black": u.rank===3?"bg-amber-700 text-white":"bg-white/10"}`}>{u.rank}</span>
                  <img src={u.image || `https://i.pravatar.cc/100?img=${(u.rank%70)+1}`} alt="" className="w-9 h-9 rounded-full object-cover"/>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">{u.name} <span className="text-xs text-white/40">{u.emailMasked}</span></div>
                    <div className="text-xs text-white/50">{u.track||"general"} • {u.plan} • streak {u.streak}d</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-amber-300">{u.xp} XP</div>
                    <div className="text-xs text-white/40">Lvl {u.level}</div>
                  </div>
                </div>
              ))}
              {data.length===0 && <div className="text-sm text-white/40">No users yet — be first to record!</div>}
            </div>
          )}
          <div className="mt-6 glass rounded-xl p-4 text-sm">
            <div className="font-bold">How XP is earned</div>
            <div className="text-xs text-white/60 mt-1">Record +10, Review +40, Post +20, Comment +5, Daily drill +10, Referral +80 coins (and XP). Streak flame bonus daily.</div>
          </div>
        </div>
      </main>
    </div>
  );
}
