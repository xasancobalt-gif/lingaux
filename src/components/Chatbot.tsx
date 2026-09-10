"use client";
import { useState, useRef, useEffect } from "react";

type Msg = { role: "user"|"bot"; text: string; ticket?: string };

export default function Chatbot(){
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role:"bot", text:"Hi! I'm LINGAUX helper ✨ Ask me about the 30-day challenge, leaderboard, coins, or recording. I’m here 24/7!" }
  ]);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ if(listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; },[msgs, loading]);

  const send = async ()=>{
    const txt = input.trim();
    if(!txt) return;
    setMsgs(m=>[...m, {role:"user", text: txt}]);
    setInput("");
    setLoading(true);
    try{
      const res = await fetch("/api/chatbot",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message: txt})});
      const j = await res.json();
      if(!res.ok) throw new Error(j.error);
      setMsgs(m=>[...m, {role:"bot", text: j.answer, ticket: j.ticketId }]);
    }catch(e:any){
      setMsgs(m=>[...m, {role:"bot", text:"Sorry, I’m having trouble — I’ve raised a ticket to our support team. We’ll get back within 12h!"}]);
    } finally{ setLoading(false); }
  };

  return (
    <>
      {/* Closed — 3D pill "chat with us" */}
      {!open && (
        <button
          onClick={()=>setOpen(true)}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-3 pl-2 pr-5 py-2 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.4),0_4px_12px_rgba(124,58,237,0.3)] hover:shadow-[0_16px_50px_rgba(0,0,0,0.5),0_6px_16px_rgba(124,58,237,0.4)] transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #7C3AED 0%, #EC4899 45%, #FB923C 100%)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 12px rgba(124,58,237,0.3)",
          }}
        >
          {/* 3D orb */}
          <div className="w-10 h-10 rounded-full bg-white grid place-items-center shadow-[inset_0_2px_8px_rgba(0,0,0,0.15),0_2px_8px_rgba(0,0,0,0.2)] relative overflow-hidden">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-zinc-100"/>
            <span className="relative text-[18px] animate-[float_3s_ease-in-out_infinite]">💬</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white animate-pulse"/>
          </div>
          <span className="text-white font-bold text-sm tracking-wide drop-shadow-sm">chat with us</span>
          <span className="w-2 h-2 rounded-full bg-white/90 animate-pulse"/>
        </button>
      )}

      {/* Open — 3D workspace */}
      {open && (
        <div
          className="fixed bottom-6 right-4 md:right-6 z-40 w-[92vw] max-w-[380px] h-[520px] rounded-[28px] overflow-hidden flex flex-col"
          style={{
            background: "rgba(16,16,24,0.85)",
            backdropFilter: "blur(24px) saturate(1.4)",
            WebkitBackdropFilter: "blur(24px) saturate(1.4)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5), 0 12px 32px rgba(124,58,237,0.2), inset 0 1px 0 rgba(255,255,255,0.12)",
            transform: "perspective(1000px) rotateX(1deg)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Header with 3D character */}
          <div className="relative p-4 border-b border-white/10 overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(236,72,153,0.1) 50%, rgba(251,146,60,0.08) 100%)" }}>
            {/* Depth layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent pointer-events-none"/>
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 blur-2xl pointer-events-none animate-[pulse_4s_ease-in-out_infinite]"/>
            <div className="flex items-center justify-between relative">
              <div className="flex items-center gap-3">
                {/* 3D Bot character */}
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-400 grid place-items-center shadow-[0_8px_20px_rgba(124,58,237,0.4),inset_0_1px_0_rgba(255,255,255,0.3)] animate-[float_3.5s_ease-in-out_infinite]" style={{ transform: "translateZ(10px)" }}>
                    <span className="text-xl">🤖</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-zinc-900 grid place-items-center">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse"/>
                  </div>
                  {/* Shadow */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 rounded-full bg-black/20 blur-[4px]"/>
                </div>
                <div>
                  <div className="font-black text-sm flex items-center gap-1.5">
                    LINGAUX Helper
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[8px] font-black tracking-widest">3D</span>
                  </div>
                  <div className="text-xs text-white/60">AI • Answers in 2s • Escalates if needed</div>
                </div>
              </div>
              <button onClick={()=>setOpen(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 grid place-items-center transition border border-white/10">
                ✕
              </button>
            </div>
            {/* Floating mini characters */}
            <div className="absolute top-2 right-16 text-[10px] opacity-60 animate-[float_4s_ease-in-out_infinite]">✨</div>
            <div className="absolute bottom-1 left-16 text-[10px] opacity-40 animate-[float_3s_ease-in-out_infinite_reverse]">🎯</div>
          </div>

          {/* Messages with 3D depth */}
          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-transparent via-violet-500/[0.02] to-transparent">
            {msgs.map((m,i)=>(
              <div key={i} className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed relative ${m.role==="user" ? "ml-auto bg-white text-black shadow-[0_4px_12px_rgba(0,0,0,0.15),0_1px_0_rgba(255,255,255,0.8)_inset]" : "bg-white/[0.06] border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.08)]"}`} style={{ transform: m.role==="user" ? "translateZ(2px)" : "translateZ(1px)" }}>
                {m.text}
                {m.ticket && <div className="mt-1.5 text-xs opacity-60 flex items-center gap-1">🎫 Ticket #{m.ticket.slice(0,8)}</div>}
              </div>
            ))}
            {loading && (
              <div className="glass rounded-2xl px-3 py-2.5 text-sm text-white/60 w-fit flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"/>
                <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-bounce" style={{animationDelay:"0.1s"}}/>
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{animationDelay:"0.2s"}}/>
              </div>
            )}
          </div>

          {/* Quick chips */}
          <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
            {["How to start?", "Coins?", "Leaderboard?"].map(chip=>(
              <button key={chip} onClick={()=>{ setInput(chip); setTimeout(()=> send(), 50); }} className="shrink-0 text-xs px-3 py-1.5 rounded-full glass border-white/10 hover:bg-white/10 transition">
                {chip}
              </button>
            ))}
          </div>

          {/* Input with 3D */}
          <div className="p-3 border-t border-white/10 flex gap-2 bg-black/10">
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=> e.key==="Enter" && send()} placeholder="Ask anything…" className="flex-1 glass rounded-full px-4 py-2.5 text-sm bg-white/5 border-white/10 outline-none placeholder:text-white/40 focus:border-violet-400/30 focus:bg-white/[0.08] transition"/>
            <button onClick={send} disabled={loading || !input.trim()} className="px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-sm shadow-[0_4px_12px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_16px_rgba(124,58,237,0.4)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all">
              Send
            </button>
          </div>
          <div className="px-4 pb-3 text-xs text-white/25 text-center">Secure • We’ll reply within 12h if escalated</div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(0.5deg); }
        }
        @keyframes float_reverse {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(3px); }
        }
      `}</style>
    </>
  );
}
