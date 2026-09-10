import Link from "next/link";

export const metadata = { title: "LINGAUX Guide — How to Start & Win" };

export default function Guide(){
  return (
    <div className="min-h-screen bg-mesh text-white">
      <header className="sticky top-0 z-30 glass-strong border-b border-white/10">
        <div className="max-w-[1000px] mx-auto px-4 md:px-6 h-[64px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-black grid place-items-center font-black">LINGAUX</div>
            <span className="font-black tracking-widest text-sm">GUIDE</span>
          </Link>
          <Link href="/" className="px-4 py-2 rounded-full bg-white text-black text-sm font-bold">Back to App →</Link>
        </div>
      </header>
      <main className="max-w-[1000px] mx-auto px-4 md:px-6 py-8 space-y-6">
        <div className="glass-card rounded-[28px] p-6 md:p-8">
          <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-xs font-bold border-violet-400/20 text-violet-300">START HERE • 30-DAY CHALLENGE</div>
          <h1 className="mt-3 font-serif text-3xl md:text-4xl font-bold leading-tight">How to start and <span className="text-gradient-gold">win the challenge</span></h1>
          <p className="mt-2 text-white/60">Based on LINGAUX’s 4-step loop. 10 minutes a day. No partner needed.</p>
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            {[
              {n:"01", t:"Create account & pick track", d:"Sign up (email or Google). Choose Career / Social / Creator / Leadership. This personalizes topics & drills. Takes 60s."},
              {n:"02", t:"Studio → Record 5-min impromptu", d:"Pick a random topic (e.g. ‘Pitch your dream job’). No script. Hit Record, speak 4-5 mins. The discomfort is the data."},
              {n:"03", t:"Wait 24h — Detachment lock", d:"App locks Review for 24h by design. You’ll judge yourself objectively only after a day. Timer shows 18h left etc."},
              {n:"04", t:"Triple-Scan Review", d:"Audio (fillers, pace), Video muted (eye, gestures), Transcript (structure) — AI finds your 4 leaks + gives score."},
              {n:"05", t:"Fix 1 weakness / week", d:"Week 1: kill ‘like/um’ with Pause Drill. Week 2: pace, etc. Daily 10-min drills in Practice tab. Track effort, not perfection."},
              {n:"06", t:"Share in Community & rank", d:"Post progress video to Paid Community (Pro), get peer + coach feedback. Leaderboard ranks by XP. Weekly Boss Battle topics."},
            ].map(s=>(
              <div key={s.n} className="glass rounded-2xl p-4 flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-black grid place-items-center font-black shrink-0">{s.n}</div>
                <div><div className="font-bold text-sm">{s.t}</div><div className="text-xs text-white/60 mt-1 leading-relaxed">{s.d}</div></div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/?tab=studio" className="px-6 py-3 rounded-full bg-white text-black font-bold">Start Studio Now →</Link>
            <Link href="/leaderboard" className="px-6 py-3 rounded-full glass font-semibold">See Leaderboard</Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-bold">Leaderboard — How it works</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/70 list-disc list-inside">
              <li><b className="text-white">XP:</b> Record +10, Review +40, Post +20, Daily drill +10, Streak bonus.</li>
              <li><b className="text-white">Level:</b> 1,000 XP per level. Level 8 average is ~1,200 XP.</li>
              <li><b className="text-white">Streak:</b> flame counts consecutive days with ≥1 action. Daily reminder.</li>
              <li><b className="text-white">Rank:</b> Global top 100 by XP `GET /api/leaderboard`. Updates live. Private: email masked.</li>
              <li><b className="text-white">Freemium:</b> Free can see leaderboard, Pro can climb faster (unlimited).</li>
            </ul>
            <Link href="/leaderboard" className="mt-4 inline-block px-4 py-2 rounded-full glass text-sm font-bold">View Full Leaderboard →</Link>
          </div>
          <div className="glass-card rounded-2xl p-6 border-amber-400/20">
            <h3 className="font-bold">Refer & Earn — 80 coins = 80rs</h3>
            <div className="mt-2 text-sm text-white/70 leading-relaxed">
              Share your link <code className="px-1.5 py-0.5 rounded bg-white/10">/?ref=LINGAUX-XXX</code>. When friend signs up, you get <b className="text-amber-300">80 coins instantly</b>. 1 coin = 1rs, usable only on LINGAUX for Pro subs & products. Check wallet in Refer tab / API `/api/referral`.
            </div>
            <div className="mt-3 glass rounded-xl p-3 text-xs">
              <div>Example: 3 referrals = 240 coins → Pro Monthly ₹199 = 199 coins → you pay 0 + keep 41.</div>
              <div className="mt-1 text-white/50">Coins cannot be withdrawn, only spent on platform.</div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-bold">Tips to stay consistent</h3>
          <div className="mt-3 grid sm:grid-cols-3 gap-3 text-sm">
            <div className="glass rounded-xl p-3"><b>Same time daily</b><div className="text-xs text-white/60 mt-1">Morning 7am works best — 2x retention.</div></div>
            <div className="glass rounded-xl p-3"><b>Don’t restart</b><div className="text-xs text-white/60 mt-1">If you stumble, keep going. Recovery is the skill.</div></div>
            <div className="glass rounded-xl p-3"><b>Post daily</b><div className="text-xs text-white/60 mt-1">Public commitment → 3x completion.</div></div>
          </div>
        </div>
      </main>
    </div>
  );
}
