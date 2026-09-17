"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPassword(){
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle"|"sending"|"sent">("idle");

  const send = async ()=>{
    if(!email.includes("@")) return;
    setStatus("sending");
    try{
      await fetch("/api/auth/forgot",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});
    }catch{ /* always show confirmation (no account-existence reveal) */ }
    setStatus("sent");
  };

  return (
    <div className="min-h-screen bg-mesh text-white grid place-items-center p-4">
      <div className="w-full max-w-[440px] glass-strong rounded-[24px] p-6 border-white/15">
        <Link href="/" className="text-xs text-white/60 hover:text-white">← Back to LINGAUX</Link>
        <h1 className="mt-3 font-serif text-2xl font-bold">Reset your password</h1>
        <p className="mt-1 text-sm text-white/60">Enter your account email. If an account exists, a reset link valid for 1 hour is on its way.</p>
        {status === "sent" ? (
          <div className="mt-5 glass rounded-xl p-4 text-sm">
            <div className="font-bold">Check your inbox 📮</div>
            <div className="mt-1 text-white/60">If an account exists for {email}, you will receive a reset link shortly. The link expires in 1 hour and can be used once.</div>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <input value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter") send(); }} placeholder="you@company.com" autoComplete="email" className="w-full glass rounded-xl px-4 py-3 text-sm bg-white/[0.06] border-white/10 placeholder:text-white/40 outline-none focus:border-white/20"/>
            <button disabled={status==="sending" || !email.includes("@")} onClick={send} className="w-full py-3 rounded-xl bg-white text-black font-black disabled:opacity-60">
              {status==="sending" ? "Sending..." : "Send reset link →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
