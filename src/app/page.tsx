"use client";
import { useState, useEffect, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { CharacterStudio, CharacterCommunity, CharacterLeaderboard, CharacterPractice } from "@/components/Characters3D";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: "◈" },
  { id: "studio", label: "Studio", icon: "◎" },
  { id: "review", label: "Review", icon: "◉" },
  { id: "practice", label: "Practice", icon: "⬢" },
  { id: "academy", label: "Academy", icon: "⬣" },
  { id: "community", label: "Community", icon: "⬔" },
  { id: "messages", label: "Messages", icon: "✉" },
  { id: "profile", label: "Profile", icon: "◐" },
];

const topics = [
  "Explain why communication is the #1 career skill",
  "Teach me something you learned last week in 3 points",
  "Pitch yourself for your dream job in 60 seconds",
  "Describe a failure and what it taught you",
  "Convince me to wake up at 5am",
  "Tell a story about a time you were underestimated",
];

export default function LINGAUX() {
  const { data: session, status } = useSession();
  const sessionPro = (session?.user as any)?.plan === "pro";
  const [active, setActive] = useState("dashboard");
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"signin"|"signup">("signup");
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallSource, setPaywallSource] = useState("pro");
  const [isProLocal, setIsProLocal] = useState(false);
  const isPro = sessionPro || isProLocal;
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [reviewTab, setReviewTab] = useState<"audio"|"video"|"transcript">("audio");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [need2FA, setNeed2FA] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [toast, setToast] = useState<string|null>(null);
  const [topic, setTopic] = useState(topics[0]);
  const [hasRecorded, setHasRecorded] = useState(true);
  const [lockHours, setLockHours] = useState(18);
  const [apiStatus, setApiStatus] = useState<string>("Backend wired: Prisma + Auth.js + Supabase + OpenAI");
  // Live camera
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder|null>(null);
  const [stream, setStream] = useState<MediaStream|null>(null);
  const [cameraError, setCameraError] = useState<string|null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob|null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string|null>(null);
  const [transcript, setTranscript] = useState<string|null>(null);
  const [latestRecordings, setLatestRecordings] = useState<any[]>([]);
  const [realReview, setRealReview] = useState<any|null>(null);
  // Refer & Earn
  const [refCode, setRefCode] = useState<string|null>(null);
  const [refLink, setRefLink] = useState<string|null>(null);
  const [refCoins, setRefCoins] = useState<number>(0);
  const [refCount, setRefCount] = useState<number>(0);
  // Academy courses (real DB)
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(()=>{
    if(!recording) return;
    const id = setInterval(()=> setRecordTime(s=> s+1),1000);
    return ()=> clearInterval(id);
  },[recording]);

  useEffect(()=>{
    if(hasRecorded && lockHours>0){
      const id=setInterval(()=> setLockHours(h=> Math.max(0, h-1)), 8000);
      return ()=> clearInterval(id);
    }
  },[hasRecorded, lockHours]);

  const triggerPaywall = (src:string)=>{
    if(isPro) { setToast("You already have Pro ✨"); setTimeout(()=>setToast(null),2000); return; }
    setPaywallSource(src);
    setShowPaywall(true);
  };

  // ===== Real Backend Helpers =====
  const handleRegister = async () => {
    setAuthLoading(true);
    try {
      const ref = localStorage.getItem("lingaux_ref") || undefined;
      const res = await fetch("/api/auth/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || "LINGAUX User", email, password, track: "career", refCode: ref }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Register failed");
      setToast("Account created! Now sign in →");
      setAuthMode("signin");
    } catch (e:any) { setToast(e.message); setTimeout(()=>setToast(null),3000); }
    finally { setAuthLoading(false); }
  };

  const handleCredentialsLogin = async () => {
    setAuthLoading(true);
    const payload:any = { email, password, redirect: false };
    if(need2FA && twoFactorCode) payload.token = twoFactorCode;
    const res = await signIn("credentials", payload) as any;
    setAuthLoading(false);
    if (res?.error) {
      if(res.error.includes("2FA_REQUIRED")){
        setNeed2FA(true);
        setToast("2FA required — enter 6-digit code from Authenticator");
        setTimeout(()=>setToast(null),3000);
        return;
      }
      if(res.error.includes("INVALID_2FA")){
        setToast("Invalid 2FA code — try again");
        setTimeout(()=>setToast(null),2500);
        return;
      }
      setToast("Invalid email or password"); setTimeout(()=>setToast(null),2500);
    }
    else { setShowAuth(false); setNeed2FA(false); setTwoFactorCode(""); setToast("Signed in — streak intact 🔥"); setTimeout(()=>setToast(null),2000); }
  };

  const handleOAuth = async (provider: "google"|"apple"|"linkedin") => {
    await signIn(provider, { callbackUrl: "/" });
  };

  const handleRecordSave = async () => {
    if (status !== "authenticated") { setShowAuth(true); setToast("Sign in to save recordings (free)"); setTimeout(()=>setToast(null),2000); return; }
    try {
      const res = await fetch("/api/recordings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, duration: recordTime || 180, videoUrl: "", audioUrl: "" }),
      });
      const j = await res.json();
      if (!res.ok) {
        if (j.code === "PAYWALL") { triggerPaywall("studio-limit"); return; }
        throw new Error(j.error);
      }
      setHasRecorded(true); setLockHours(24); setRecording(false);
      setToast(`Saved! Review unlocks at ${new Date(j.unlockAt).toLocaleTimeString()} (24h lock)`); setTimeout(()=>setToast(null),3500);
      setApiStatus(`Last recording: ${j.recording.id} • ${topic.slice(0,30)}...`);
    } catch (e:any) { setToast(e.message); setTimeout(()=>setToast(null),3000); }
  };

  const loadRazorpayScript = () => new Promise<boolean>((resolve)=>{
    if((window as any).Razorpay) return resolve(true);
    const s=document.createElement("script"); s.src="https://checkout.razorpay.com/v1/checkout.js";
    s.onload=()=>resolve(true); s.onerror=()=>resolve(false); document.body.appendChild(s);
  });

  const handleSubscribe = async (provider: "stripe"|"paypal"|"razorpay"|"bank", plan: "monthly"|"annual"|"lifetime") => {
    if (status !== "authenticated") { setShowAuth(true); return; }
    if(provider==="paypal"){
      try{
        setToast("Creating PayPal Order…");
        const res=await fetch("/api/checkout/paypal",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({plan})});
        const j=await res.json();
        if(!res.ok){
          if(j.code==="NOT_CONFIGURED"){
            setToast("PayPal keys not set — mock pro unlock for demo");
            const mock=await fetch("/api/subscription",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({provider:"paypal",plan,amount:19900,currency:"USD"})});
            const mj=await mock.json(); if(!mock.ok) throw new Error(mj.error);
            setIsProLocal(true); setToast(`Mock Pro — ${plan} via PayPal 🎉`); setShowPaywall(false); setTimeout(()=>window.location.reload(),1200);
            return;
          }
          throw new Error(j.error);
        }
        if(j.approveUrl){
          setToast("Redirecting to PayPal…");
          window.location.href=j.approveUrl;
        } else {
          throw new Error("No approveUrl from PayPal");
        }
      }catch(e:any){ setToast("PayPal error: "+e.message); setTimeout(()=>setToast(null),4000); }
      return;
    }
    if(provider==="bank"){
      try{
        const res=await fetch("/api/subscription",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({provider,plan,amount:19900,currency:"INR"})});
        const j=await res.json(); if(!res.ok) throw new Error(j.error);
        setToast("Bank transfer pending — verify in 12h (mock)"); setShowPaywall(false); setTimeout(()=>setToast(null),3000);
      }catch(e:any){ setToast(e.message); }
      return;
    }
    if(provider==="stripe"){
      try{
        setToast("Creating Stripe Checkout…"); 
        const res=await fetch("/api/checkout/stripe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({plan})});
        const j=await res.json();
        if(!res.ok){
          if(j.code==="NOT_CONFIGURED"){
            // Fallback mock
            setToast("Stripe keys not set — using mock pro unlock for demo");
            const mock=await fetch("/api/subscription",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({provider:"stripe",plan,amount:1900,currency:"usd"})});
            const mj=await mock.json(); if(!mock.ok) throw new Error(mj.error);
            setIsProLocal(true); setToast(`Mock Pro unlocked — ${plan} 🎉`); setShowPaywall(false); setTimeout(()=>window.location.reload(),1200);
            return;
          }
          throw new Error(j.error);
        }
        if(j.url) window.location.href=j.url;
      }catch(e:any){ setToast(e.message); setTimeout(()=>setToast(null),4000); }
      return;
    }
    if(provider==="razorpay"){
      try{
        setToast("Creating Razorpay Order…");
        const res=await fetch("/api/checkout/razorpay",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({plan})});
        const j=await res.json();
        if(!res.ok){
          if(j.code==="NOT_CONFIGURED"){
            setToast("Razorpay keys not set — mock pro unlock");
            const mock=await fetch("/api/subscription",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({provider:"razorpay",plan,amount:19900,currency:"INR"})});
            const mj=await mock.json(); if(!mock.ok) throw new Error(mj.error);
            setIsProLocal(true); setToast(`Mock Pro — ${plan} via UPI 🎉`); setShowPaywall(false); setTimeout(()=>window.location.reload(),1200);
            return;
          }
          throw new Error(j.error);
        }
        const ok=await loadRazorpayScript();
        if(!ok) throw new Error("Failed to load Razorpay checkout.js");
        const options:any={
          key: j.keyId, amount: j.amount, currency: j.currency, name: "LINGAUX Pro", description: j.plan,
          order_id: j.orderId,
          handler: async (resp:any)=>{
            try{
              const vr=await fetch("/api/checkout/razorpay/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({orderId:resp.razorpay_order_id, paymentId: resp.razorpay_payment_id, signature: resp.razorpay_signature, plan})});
              const vj=await vr.json(); if(!vr.ok) throw new Error(vj.error);
              setToast("Payment verified ✓ Pro unlocked!"); setShowPaywall(false); setTimeout(()=>window.location.reload(),1200);
            }catch(e:any){ setToast("Verify failed: "+e.message); }
          },
          prefill:{ name: j.user?.name || "", email: j.user?.email || email },
          theme:{ color:"#A16207" },
          modal:{ ondismiss:()=> setToast("Checkout closed") }
        };
        const rzp=new (window as any).Razorpay(options);
        rzp.open();
      }catch(e:any){ setToast(e.message); setTimeout(()=>setToast(null),4000); }
      return;
    }
  };

  // ===== Live Camera =====
  useEffect(()=>{
    if (active !== "studio") {
      if (stream) { stream.getTracks().forEach(t=>t.stop()); setStream(null); }
      return;
    }
    let cancelled=false;
    (async()=>{
      try{
        setCameraError(null);
        const s = await navigator.mediaDevices.getUserMedia({ video:{ width:1280, height:720, facingMode:"user" }, audio:true });
        if(cancelled) { s.getTracks().forEach(t=>t.stop()); return; }
        setStream(s);
        if(videoRef.current) videoRef.current.srcObject = s;
      }catch(e:any){
        setCameraError(e.message || "Camera/mic permission denied. Check browser settings.");
      }
    })();
    return ()=>{ cancelled=true; };
  },[active]);

  useEffect(()=>{
    if(stream && videoRef.current) videoRef.current.srcObject = stream;
  },[stream]);

  // Fetch latest recordings when Review tab opened + authenticated
  useEffect(()=>{
    if(active!=="review" || status!=="authenticated") return;
    (async()=>{
      try{
        const r = await fetch("/api/recordings?limit=3");
        const j = await r.json();
        if(r.ok) setLatestRecordings(j.recordings || []);
        if(j.recordings?.[0]?.review) setRealReview(j.recordings[0].review);
        else if(j.recordings?.[0]?.id){
          const rv = await fetch(`/api/review?recordingId=${j.recordings[0].id}`);
          const rj = await rv.json();
          if(rj.review) setRealReview(rj.review);
        }
      }catch{}
    })();
  },[active, status]);

  // Referral: capture ?ref= and fetch wallet
  useEffect(()=>{
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if(ref){
      localStorage.setItem("lingaux_ref", ref.toUpperCase());
      // clean URL without reload
      const u = new URL(window.location.href); u.searchParams.delete("ref"); window.history.replaceState({}, "", u.toString());
      setToast(`Referral code ${ref.toUpperCase()} applied — sign up to give 80 coins to inviter!`);
      setTimeout(()=>setToast(null),3000);
    }
  },[]);
  useEffect(()=>{
    if(status!=="authenticated") return;
    fetch("/api/referral").then(r=>r.json()).then(j=>{
      if(j.code){ setRefCode(j.code); setRefLink(j.link); setRefCoins(j.coins||0); setRefCount(j.referrals?.length||0); }
    }).catch(()=>{});
  },[status]);

  useEffect(()=>{
    if(active==="academy"){
      fetch("/api/courses").then(r=>r.json()).then(j=> setCourses(j.courses||[])).catch(()=>{});
    }
  },[active]);

  const startLiveRecord = async () => {
    if(!stream){ setCameraError("No camera — grant permission first"); return; }
    setRecordedBlob(null); setPreviewUrl(null); setTranscript(null);
    setRecording(true); setRecordTime(0);
    const chunks: BlobPart[] = [];
    const mr = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm" });
    mediaRecorderRef.current = mr;
    mr.ondataavailable = e => { if(e.data.size>0) chunks.push(e.data); };
    mr.onstop = async () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      setRecordedBlob(blob);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setRecording(false);
      // Auto-transcribe via Whisper (if key) + upload
      setIsUploading(true);
      try{
        // 1. Transcribe for instant feedback
        const fd = new FormData(); fd.append("file", blob, "recording.webm"); fd.append("topic", topic);
        const tr = await fetch("/api/transcribe", { method:"POST", body: fd });
        const tj = await tr.json();
        if(tr.ok) setTranscript(tj.transcript);
        // 2. Upload to Supabase + create DB row
        const fd2 = new FormData(); fd2.append("file", blob, "recording.webm"); fd2.append("topic", topic); fd2.append("duration", String(recordTime || Math.round(blob.size/16000) || 180));
        const up = await fetch("/api/recordings/upload", { method:"POST", body: fd2 });
        const uj = await up.json();
        if(!up.ok){
          if(uj.code==="PAYWALL") triggerPaywall("studio-limit");
          else throw new Error(uj.error);
        } else {
          setHasRecorded(true); setLockHours(24);
          setToast(`Uploaded ✓ ${uj.storedIn} • ID ${uj.recording.id.slice(0,8)} • Unlocks in 24h`); setTimeout(()=>setToast(null),4000);
          setApiStatus(`Uploaded: ${uj.recording.id} • ${topic.slice(0,25)}…`);
          // 3. Auto trigger review if Whisper succeeded and user is pro (or force)
          if(status==="authenticated"){
             // store recording id for review tab
             (window as any).__lastRecordingId = uj.recording.id;
             if(tj.transcript){
               // Try review with transcriptOverride, force=1 for demo
               await fetch(`/api/review?force=1`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ recordingId: uj.recording.id, transcript: tj.transcript }) }).catch(()=>{});
             }
          }
        }
      }catch(e:any){ setToast("Upload/transcribe error: "+e.message); }
      finally{ setIsUploading(false); }
    };
    mr.start(100);
  };

  const stopLiveRecord = () => {
    mediaRecorderRef.current?.stop();
    // onstop will handle upload
  };

  const formatTime = (s:number)=> `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  return (
    <div className="min-h-screen bg-mesh text-white flex flex-col">
      {/* TOP BAR - Glass */}
      <header className="sticky top-0 z-40 glass-strong border-b border-white/[0.08]">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-[64px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <img src="/brand/lingaux-logo.png" alt="LINGAUX" className="w-9 h-9 rounded-xl object-contain shadow-lg bg-transparent"/>
              <div>
                <div className="font-serif font-bold tracking-[0.18em] text-[16px] leading-none">LINGAUX</div>
                <div className="text-[10px] tracking-[0.2em] text-white/50 font-medium">SPEAK • LEARN • PROGRESS</div>
              </div>
              <div className="hidden lg:flex ml-4 items-center gap-2 text-[11px] font-semibold px-3 py-1 rounded-full glass border-amber-400/20 text-amber-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/> SYSTEM ONLINE • 12,483 ACTIVE
              </div>
            </div>
            <nav className="hidden xl:flex items-center gap-1">
              {tabs.slice(0,5).map(t=>(
                <button key={t.id} onClick={()=>setActive(t.id)} className={`px-3.5 py-2 rounded-full text-[13px] font-medium transition ${active===t.id ? "glass-strong text-white glow-gold border-amber-400/30" : "text-white/60 hover:text-white hover:bg-white/[0.06]"}`}>
                  {t.label}
                </button>
              ))}
              <a href="/guide" className="px-3.5 py-2 rounded-full text-[13px] font-medium text-white/60 hover:text-white">Guide</a>
              <a href="/leaderboard" className="px-3.5 py-2 rounded-full text-[13px] font-medium text-white/60 hover:text-white">Leaderboard</a>
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden md:flex items-center gap-2 glass rounded-full px-3 py-1.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm">🔥</div>
              <div className="text-xs leading-none"><div className="font-bold">7 Day Streak</div><div className="text-white/50 text-[10px]">Keep going!</div></div>
              <div className="ml-2 hidden lg:block w-20 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full w-[70%] bg-gradient-to-r from-amber-400 to-orange-500"/></div>
            </div>
            <div className="hidden md:flex items-center gap-1.5 glass rounded-full px-2.5 py-1.5">
              <span className="text-amber-300">⚡</span><span className="text-sm font-bold">1,240</span><span className="text-xs text-white/50 hidden lg:inline">XP</span>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black">LVL 8</span>
            </div>
            {status==="authenticated" && (
              <div className="hidden md:flex items-center gap-1 glass rounded-full px-2.5 py-1.5">
                <span className="text-amber-300">◆</span><span className="text-sm font-bold">{refCoins}</span><span className="text-xs text-white/50 hidden lg:inline">coins</span>
              </div>
            )}
            {status==="authenticated" && (
              <div className="hidden md:flex items-center gap-2 glass rounded-full px-3 py-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
                <span className="font-semibold">{session?.user?.name || session?.user?.email?.split("@")[0]}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${isPro? "bg-amber-400 text-black":"bg-white/15"}`}>{isPro? "PRO":"FREE"}</span>
              </div>
            )}
            {(session?.user as any)?.role==="admin" || (session?.user as any)?.isAdmin ? (
              <a href="/admin" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400 text-black text-xs font-black">◆ ADMIN</a>
            ) : null}
            {isPro ? (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-black text-xs font-bold glow-gold">◆ PRO</div>
            ):(
              <button onClick={()=>triggerPaywall("header")} className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-[13px] font-bold hover:bg-zinc-100 transition">Upgrade to Pro</button>
            )}
            {status==="authenticated" ? (
              <button onClick={()=> signOut()} className="w-9 h-9 rounded-full glass flex items-center justify-center overflow-hidden border-white/15" title="Sign out">
                <img src={session?.user?.image || "https://i.pravatar.cc/100?img=33"} alt="avatar" className="w-full h-full object-cover"/>
              </button>
            ) : (
              <button onClick={()=> setShowAuth(true)} className="w-9 h-9 rounded-full glass flex items-center justify-center overflow-hidden border-white/15">
                <img src="https://i.pravatar.cc/100?img=33" alt="avatar" className="w-full h-full object-cover"/>
              </button>
            )}
          </div>
        </div>
        {/* Mobile tab scroll */}
        <div className="xl:hidden border-t border-white/[0.06] overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 px-3 py-2">
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>setActive(t.id)} className={`whitespace-nowrap px-3.5 py-2 rounded-full text-[13px] font-medium transition ${active===t.id ? "bg-white text-black font-bold" : "text-white/60 glass"}`}>{t.icon} {t.label}</button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-[1600px] w-full mx-auto">
        {/* Sidebar - Desktop */}
        <aside className="hidden xl:flex w-[260px] shrink-0 flex-col gap-4 p-4 sticky top-[64px] h-[calc(100vh-64px)] overflow-y-auto">
          <div className="glass-card rounded-[20px] p-4">
            <div className="flex items-center gap-3">
              <img src="https://i.pravatar.cc/100?img=33" className="w-10 h-10 rounded-full object-cover"/>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold leading-none">Aarav S.</div>
                <div className="text-xs text-white/50 truncate">aarav@lingaux.app • {isPro?"Pro":"Free"}</div>
              </div>
              <span className={`w-2 h-2 rounded-full ${isPro? "bg-emerald-400":"bg-amber-400"} animate-pulse`}/>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="glass rounded-xl py-2"><div className="text-sm font-bold">23</div><div className="text-[10px] text-white/50">Records</div></div>
              <div className="glass rounded-xl py-2"><div className="text-sm font-bold">+34%</div><div className="text-[10px] text-white/50">Growth</div></div>
              <div className="glass rounded-xl py-2"><div className="text-sm font-bold">8.2</div><div className="text-[10px] text-white/50">Score</div></div>
            </div>
          </div>

          <nav className="space-y-1">
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>setActive(t.id)} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition text-left ${active===t.id ? "glass-strong text-white border-amber-400/20 shadow-[0_0_20px_rgba(161,98,7,0.15)]" : "text-white/60 hover:text-white hover:bg-white/[0.04]"}`}>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${active===t.id ? "bg-white text-black" : "glass"}`}>{t.icon}</span>
                {t.label}
                {t.id==="community" && !isPro && <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-black font-black">PRO</span>}
                {t.id==="messages" && <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-white text-[11px] grid place-items-center font-bold">3</span>}
              </button>
            ))}
            {((session?.user as any)?.role==="admin" || (session?.user as any)?.isAdmin) && (
              <a href="/admin" className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-black bg-amber-400 text-black mt-2">
                <span className="w-8 h-8 rounded-lg bg-black text-amber-400 grid place-items-center">◆</span> ADMIN PANEL
              </a>
            )}
          </nav>

          <div className="glass-card rounded-[20px] p-4 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-gradient-to-br from-amber-400/30 to-violet-500/20 blur-2xl"/>
            <div className="text-xs font-bold tracking-widest text-amber-300">LINGAUX PRO</div>
            <div className="mt-1 text-sm font-bold leading-tight">Unlock Triple-Scan AI + Community</div>
            <div className="mt-1 text-xs text-white/60">Join 8,200+ pros transforming daily.</div>
            <button onClick={()=>triggerPaywall("sidebar")} className="mt-3 w-full py-2.5 rounded-xl bg-white text-black text-sm font-bold">View Plans — from ₹199/mo</button>
            <div className="mt-2 text-[11px] text-white/40 text-center">PayPal • UPI • Cards • Bank</div>
          </div>

          <div className="text-[11px] text-white/30 px-2 leading-relaxed">
            Health: <span className="text-emerald-400">● 99.9% Uptime</span> • GDPR • SOC 2<br/> Need help? support@lingaux.app
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-7 pb-[88px] xl:pb-6">
          {/* DASHBOARD */}
          {active==="dashboard" && (
            <div className="space-y-6">
              {/* Hero */}
              <div className="relative overflow-hidden rounded-[28px] glass-card p-6 md:p-8 lg:p-10">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-amber-500/15 pointer-events-none"/>
                <div className="absolute -right-20 -top-20 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-indigo-500/25 to-violet-500/15 blur-[50px] pointer-events-none"/>
                <div className="relative grid lg:grid-cols-[1.15fr_0.85fr] gap-8 items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 text-xs font-semibold text-white/80 border-white/10">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/> Based on LINGAUX 30-Day System • 343K+ validated
                    </div>
                    <h1 className="mt-4 font-serif text-[32px] md:text-[44px] font-bold leading-[0.9] tracking-tight">
                      Master communication<br/>
                      <span className="text-gradient-gold">in 30 days.</span> <span className="text-gradient-neon">For real.</span>
                    </h1>
                    <p className="mt-3 text-white/65 text-[14px] md:text-[15px] leading-relaxed max-w-[560px]">
                      Record 5 mins. Wait 24h. Triple-scan with AI. Fix 1 weakness/week. Science-backed loop — now your OS. Solve career, social & creator anxiety in one place.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button onClick={()=> setActive("studio")} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold text-sm hover:bg-zinc-100 transition">
                        <span className="w-7 h-7 rounded-full bg-black text-white grid place-items-center">▶</span> Start 5-Min Record — Free
                      </button>
                      <button onClick={()=> setActive("review")} className="px-6 py-3 rounded-full glass font-semibold text-sm hover:bg-white/10 transition">See how Triple-Scan works</button>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-white/50">
                      <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded-full glass grid place-items-center text-[11px]">✓</span> No credit card</span>
                      <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded-full glass grid place-items-center text-[11px]">✓</span> 2-min setup</span>
                      <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded-full glass grid place-items-center text-[11px]">✓</span> Cancel anytime</span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-6 -right-6 z-10 hidden lg:block"><CharacterLeaderboard/></div>
                    <div className="glass-card rounded-[24px] p-4 md:p-5">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold tracking-widest text-white/60">TODAY&apos;S PROGRESS</div>
                        <div className="text-xs px-2.5 py-1 rounded-full bg-emerald-500 text-white font-bold">Day 11 / 30</div>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        {[
                          {k:"Clarity",v:"8.4",d:"+0.6"},
                          {k:"Pace",v:"7.9",d:"+0.3"},
                          {k:"Confidence",v:"8.7",d:"+1.1"},
                        ].map(c=>(
                          <div key={c.k} className="glass rounded-2xl p-3 text-center">
                            <div className="text-[11px] text-white/50 font-semibold tracking-widest">{c.k}</div>
                            <div className="text-xl font-black">{c.v}</div>
                            <div className="text-[11px] font-bold text-emerald-400">{c.d} this week</div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden flex">
                        <div className="h-full w-[68%] bg-gradient-to-r from-violet-500 to-indigo-500"/>
                        <div className="h-full w-[15%] bg-gradient-to-r from-amber-400 to-orange-500"/>
                      </div>
                      <div className="mt-2 flex justify-between text-[11px] text-white/50"><span>Week 2: Vocal Variety</span><span>68%</span></div>
                      <div className="mt-4 flex items-center gap-3 glass rounded-xl p-3">
                        <img src="https://i.pravatar.cc/100?img=15" className="w-9 h-9 rounded-full"/>
                        <div className="flex-1 min-w-0"><div className="text-xs font-bold">Coach Mira left feedback</div><div className="text-xs text-white/60 truncate">&quot;Your pause before the punchline was perfect — do it 2x more.&quot;</div></div>
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
                      </div>
                    </div>
                    {/* floating */}
                    <div className="hidden lg:flex absolute -right-4 -bottom-6 glass-strong rounded-2xl px-4 py-3 items-center gap-3 shadow-xl rotate-[1deg]">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 grid place-items-center text-black font-black">30</div>
                      <div><div className="text-sm font-bold leading-none">Game Plan PDF</div><div className="text-xs text-white/60">Auto-generated • Pro</div></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  {label:"Daily Streak", value:"7 days", sub:"Best: 21 days • +12% vs last week", icon:"🔥", cta:"Keep streak"},
                  {label:"Total Speaking Time", value:"4.2 hours", sub:"23 recordings • Avg 11m/session", icon:"⏱", cta:"View history"},
                  {label:"Community Rank", value:"#342", sub:"Top 18% globally • 12,483 members", icon:"🏆", cta:"Leaderboard"},
                ].map(s=>(
                  <div key={s.label} className="glass-card rounded-2xl p-5 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl"/>
                    <div className="flex items-start justify-between">
                      <div className="w-9 h-9 rounded-xl glass grid place-items-center">{s.icon}</div>
                      <button onClick={()=> triggerPaywall("stats")} className="text-xs font-semibold px-3 py-1.5 rounded-full glass">{s.cta} →</button>
                    </div>
                    <div className="mt-3 text-xs font-bold tracking-widest text-white/50">{s.label.toUpperCase()}</div>
                    <div className="text-2xl font-black">{s.value}</div>
                    <div className="text-xs text-white/50 mt-1">{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Refer & Earn */}
              <div className="glass-card rounded-[24px] p-6 border-amber-400/20 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/10 blur-2xl"/>
                <div className="relative flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 text-xs font-black tracking-widest text-amber-300">◆ REFER & EARN • 80 COINS = 80RS</div>
                    <h3 className="mt-1 font-serif text-xl font-bold">Invite friends, earn for Pro</h3>
                    <p className="text-sm text-white/60 mt-1">1 signup = 80 coins. Coins work only on LINGAUX for subscriptions & products (1 coin = 1rs).</p>
                  </div>
                  <div className="glass rounded-xl px-4 py-2 text-center">
                    <div className="text-xs text-white/50">Wallet</div><div className="text-xl font-black text-amber-300">{refCoins} coins</div><div className="text-xs text-white/40">{refCount} referrals</div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="flex-1 min-w-[220px] glass rounded-xl px-3 py-2 flex items-center gap-2">
                    <span className="text-xs text-white/50 truncate">{refLink || (status==="authenticated" ? "Loading link…" : "Sign in to get your link")}</span>
                  </div>
                  <button onClick={async()=>{ if(refLink){ await navigator.clipboard.writeText(refLink); setToast("Link copied ✓"); setTimeout(()=>setToast(null),2000); } else if(status!=="authenticated"){ setShowAuth(true); } }} className="px-5 py-2 rounded-full bg-white text-black font-bold text-sm">Copy Link</button>
                  <a href="/guide" className="px-5 py-2 rounded-full glass font-semibold text-sm">How it works</a>
                  <Link href="/leaderboard" className="px-5 py-2 rounded-full glass font-semibold text-sm">Leaderboard</Link>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="px-3 py-1 rounded-full glass">Use coins at checkout: choose “Pay with coins”</span>
                  <span className="px-3 py-1 rounded-full glass">Shop: 1:1 Coach 999rs, PDF 499rs etc.</span>
                </div>
              </div>

              {/* 4 problems */}
              <div className="glass-card rounded-[24px] p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-xl font-bold">One engine. Four transformations.</h3>
                    <p className="text-sm text-white/60 mt-1">LINGAUX isn’t just “public speaking” — it fixes the real anxieties.</p>
                  </div>
                  <button onClick={()=>setActive("academy")} className="px-4 py-2 rounded-full bg-white text-black text-sm font-bold">Explore tracks</button>
                </div>
                <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {t:"Career & Interviews", d:"STAR answers, salary negotiation, executive presence", m:"8.9/10 avg improvement", g:"from-violet-500 to-indigo-500"},
                    {t:"Social & Confidence", d:"Small talk, networking, dating conversations", m:"+42% confidence in 2 weeks", g:"from-emerald-500 to-teal-500"},
                    {t:"Creator & Voice", d:"Reels, podcasts, pitching with vocal variety", m:"2.3x viewer retention", g:"from-amber-500 to-orange-500"},
                    {t:"Leadership", d:"Meetings, storytelling, difficult feedback", m:"Trusted by 300+ teams", g:"from-pink-500 to-rose-500"},
                  ].map(card=>(
                    <div key={card.t} className="rounded-2xl p-[1px] bg-gradient-to-br from-white/15 to-white/5">
                      <div className="rounded-2xl glass p-4 h-full">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.g} grid place-items-center text-white`}>◆</div>
                        <div className="mt-3 font-bold text-sm">{card.t}</div>
                        <div className="mt-1 text-xs text-white/60 leading-relaxed">{card.d}</div>
                        <div className="mt-3 text-xs font-bold text-emerald-300">{card.m}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* How it works - LINGAUX steps */}
              <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
                <div className="glass-card rounded-[24px] p-6">
                  <div className="text-xs font-black tracking-[0.2em] text-white/50">HOW IT WORKS • THE LINGAUX LOOP</div>
                  <div className="mt-4 space-y-4">
                    {[
                      {n:"01", t:"Record 5-min impromptu", d:"Pick a random topic. No script. Camera on. The discomfort is the data.", a:"Studio →"},
                      {n:"02", t:"Wait 24h (Detachment)", d:"Science: you judge yourself objectively only after a day. App locks review.", a:"18h left →"},
                      {n:"03", t:"Triple-Scan Review", d:"Audio (fillers), Video muted (body), Transcript (structure). AI scores each.", a:"See scan →"},
                      {n:"04", t:"1 Weakness / Week", d:"Focus on ONE leak for 7 days. Daily 10-min drills. Track effort, not perfection.", a:"My plan →"},
                    ].map(s=>(
                      <div key={s.n} className="flex gap-4 glass rounded-2xl p-4">
                        <div className="w-10 h-10 rounded-xl bg-white text-black grid place-items-center font-black text-sm shrink-0">{s.n}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm">{s.t}</div>
                          <div className="text-xs text-white/60 mt-1 leading-relaxed">{s.d}</div>
                        </div>
                        <button onClick={()=>setActive(s.n==="01"?"studio": s.n==="03"?"review":"practice")} className="hidden sm:inline-flex self-center text-xs font-bold px-3 py-1.5 rounded-full bg-white text-black shrink-0">{s.a}</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="glass-card rounded-[24px] p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-violet-500/10 pointer-events-none"/>
                    <div className="relative">
                      <div className="inline-flex items-center gap-2 text-xs font-black tracking-widest text-amber-300"><span>◆</span> TODAY&apos;S DRILL • 10 MIN</div>
                      <div className="mt-3 font-bold">The Pause Drill — Kill filler words</div>
                      <div className="mt-1 text-sm text-white/60">Replace “umm” with 1.5s silence. Record 3 takes. AI detects hesitation.</div>
                      <div className="mt-4 flex gap-2">
                        <button onClick={()=>setActive("practice")} className="flex-1 py-2.5 rounded-xl bg-white text-black font-bold text-sm">Start drill</button>
                        <button className="px-4 py-2.5 rounded-xl glass text-sm font-semibold">How?</button>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-white/50"><span className="w-2 h-2 rounded-full bg-emerald-400"/> 4,203 completed today</div>
                    </div>
                  </div>
                  <div className="glass-card rounded-[24px] p-6">
                    <div className="flex items-center justify-between"><div className="font-bold text-sm">Global Leaderboard</div><span className="text-xs px-2 py-1 rounded-full glass">Live</span></div>
                    <div className="mt-4 space-y-2">
                      {[
                        {r:1, n:"Sofia K.", xp:3420, a:"https://i.pravatar.cc/100?img=5"},
                        {r:2, n:"Kenji T.", xp:3180, a:"https://i.pravatar.cc/100?img=12"},
                        {r:3, n:"You • Aarav", xp:1240, a:"https://i.pravatar.cc/100?img=33", me:true},
                        {r:4, n:"Priya M.", xp:1190, a:"https://i.pravatar.cc/100?img=26"},
                      ].map(p=>(
                        <div key={p.r} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${p.me? "glass-strong border-amber-400/20":"glass"}`}>
                          <span className={`w-6 h-6 rounded-full grid place-items-center text-xs font-black ${p.r===1?"bg-amber-400 text-black": p.r===2?"bg-zinc-300 text-black": p.r===3?"bg-amber-600 text-white":"bg-white/10"}`}>{p.r}</span>
                          <img src={p.a} className="w-7 h-7 rounded-full"/>
                          <span className="flex-1 text-sm font-semibold">{p.n}</span>
                          <span className="text-xs font-bold text-amber-300">{p.xp} XP</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STUDIO */}
          {active==="studio" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-[28px] font-bold leading-none">Studio <span className="text-gradient-gold">• Record</span></h2>
                  <p className="text-sm text-white/60 mt-2">LINGAUX Step 1 — 5-min impromptu. Imperfect is perfect.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 text-xs font-semibold"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/> Camera • Mic • Transcript ready</span>
                  <button onClick={()=> setTopic(topics[Math.floor(Math.random()*topics.length)])} className="px-4 py-2 rounded-full bg-white text-black text-sm font-bold">New topic ↻</button>
                </div>
              </div>
              <div className="hidden lg:flex justify-end -mt-2"><CharacterStudio/></div>

              <div className="grid lg:grid-cols-[1.25fr_0.75fr] gap-6">
                <div className="glass-card rounded-[24px] overflow-hidden">
                  <div className="p-4 flex items-center justify-between border-b border-white/10">
                    <div className="text-xs font-black tracking-widest text-white/60">TOPIC • IMPROMPTU</div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${recording? "bg-red-500 text-white animate-pulse":"glass"}`}>{recording? `● REC ${formatTime(recordTime)} / 05:00`:"READY"}</span>
                  </div>
                  <div className="p-6">
                    <div className="glass rounded-2xl p-5 border-amber-400/20">
                      <div className="text-xs font-black tracking-widest text-amber-300">YOUR PROMPT</div>
                      <div className="mt-2 text-lg md:text-xl font-bold leading-tight">“{topic}”</div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="px-2.5 py-1 rounded-full glass">No prep • No script</span>
                        <span className="px-2.5 py-1 rounded-full glass">Structure: Point → Example → Point</span>
                        <span className="px-2.5 py-1 rounded-full glass">Aim: 4-5 mins</span>
                      </div>
                    </div>

                    <div className="mt-6 aspect-[16/9] rounded-2xl bg-black relative overflow-hidden border border-white/10">
                      {/* Live camera */}
                      <video ref={videoRef} autoPlay muted playsInline className={`absolute inset-0 w-full h-full object-cover ${previewUrl ? "hidden" : ""}`} />
                      {previewUrl && (
                        <video src={previewUrl} controls className="absolute inset-0 w-full h-full object-cover bg-black" />
                      )}
                      {!stream && !previewUrl && (
                        <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-zinc-900 to-black">
                          <div className="text-center p-6">
                            <div className="mx-auto w-16 h-16 rounded-full glass grid place-items-center text-white/60">◎</div>
                            <div className="mt-3 text-sm font-bold">{cameraError ? "Camera blocked" : "Initializing camera..."}</div>
                            <div className="text-xs text-white/50 mt-1 max-w-[260px]">{cameraError ? cameraError : "Allow camera & mic to start"}</div>
                            {cameraError && <button onClick={()=> window.location.reload()} className="mt-3 px-4 py-2 rounded-full bg-white text-black text-xs font-bold">Retry</button>}
                          </div>
                        </div>
                      )}
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full backdrop-blur border ${recording ? "bg-red-500 text-white border-red-400 animate-pulse" : "bg-black/60 text-white border-white/15"}`}>
                          {recording ? `● REC ${formatTime(recordTime)} / 05:00` : previewUrl ? "▶ Preview" : "● LIVE"}
                        </span>
                        {isUploading && <span className="text-xs px-3 py-1 rounded-full bg-amber-400 text-black font-bold animate-pulse">Uploading…</span>}
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur border border-white/10">LINGAUX STUDIO • {stream ? "720p • LIVE" : previewUrl ? "Playback" : "Waiting"}</span>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur border border-white/10">{formatTime(recordTime)} • {recording ? "5:00 target" : "Press Start"}</span>
                      </div>
                      {/* Center hint when not recording */}
                      {!recording && !previewUrl && stream && (
                        <div className="absolute inset-0 grid place-items-center pointer-events-none">
                          <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-white text-black grid place-items-center mx-auto shadow-xl text-xl">●</div>
                            <div className="mt-2 text-xs text-white/70">Look at lens • Hands visible</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {cameraError && <div className="mt-3 glass rounded-xl p-3 text-xs text-amber-300 border-amber-400/20">⚠ {cameraError} — Use Chrome/Edge, allow permissions, or try “New topic ↻” to retry.</div>}
                    {transcript && (
                      <div className="mt-3 glass rounded-xl p-3">
                        <div className="text-xs font-black tracking-widest text-white/50">TRANSCRIPT • WHISPER {process.env.NEXT_PUBLIC_SUPABASE_URL ? "" : "(mock if no OPENAI_API_KEY)"}</div>
                        <div className="mt-2 text-xs leading-relaxed text-white/80 line-clamp-3">{transcript}</div>
                      </div>
                    )}
                    {apiStatus && <div className="mt-3 text-xs text-white/40 text-center">{apiStatus}</div>}

                    <div className="mt-6 flex flex-wrap gap-3">
                      {!recording ? (
                        previewUrl ? (
                          <>
                            <button onClick={()=>{ setPreviewUrl(null); setRecordedBlob(null); setTranscript(null); setRecordTime(0); }} className="flex-1 min-w-[140px] py-3 rounded-full glass font-bold">↻ Retake</button>
                            <button onClick={()=> setActive("review")} className="flex-1 min-w-[140px] py-3 rounded-full bg-white text-black font-black">Go to Review →</button>
                          </>
                        ) : (
                          <button onClick={startLiveRecord} disabled={!stream || isUploading} className="flex-1 min-w-[180px] py-3 rounded-full bg-white text-black font-black flex items-center justify-center gap-2 disabled:opacity-50">
                            <span className="w-8 h-8 rounded-full bg-red-500 text-white grid place-items-center">●</span> Start 5-Min Record
                          </button>
                        )
                      ):(
                        <button onClick={stopLiveRecord} className="flex-1 min-w-[180px] py-3 rounded-full bg-red-500 text-white font-black animate-pulse">■ Stop & Upload</button>
                      )}
                      <button onClick={()=>{setRecordTime(0); setRecording(false); setPreviewUrl(null); setRecordedBlob(null); mediaRecorderRef.current?.stop();}} className="px-6 py-3 rounded-full glass font-semibold">Reset</button>
                      <button onClick={()=>triggerPaywall("studio-ai")} className="px-6 py-3 rounded-full glass font-semibold border-amber-400/20">AI Topic → Pro</button>
                    </div>
                    <div className="mt-3 text-xs text-white/50 text-center">Tip: Don&apos;t restart if you stumble. Recovery is the skill.</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="glass-card rounded-2xl p-5">
                    <div className="font-bold text-sm">After you record</div>
                    <div className="mt-3 space-y-3">
                      <div className={`flex gap-3 p-3 rounded-xl border ${hasRecorded? "bg-amber-500/10 border-amber-400/20":"glass border-white/10"}`}>
                        <div className={`w-8 h-8 rounded-lg grid place-items-center shrink-0 ${hasRecorded? "bg-amber-400 text-black":"glass"}`}>◷</div>
                        <div className="flex-1">
                          <div className="text-sm font-bold">Detachment Lock — 24h</div>
                          <div className="text-xs text-white/60">{hasRecorded ? `${lockHours}h left until you can review objectively` : "App will lock review to remove self-judgment bias"}</div>
                          {hasRecorded && <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-amber-400" style={{width: `${((24-lockHours)/24)*100}%`}}/></div>}
                        </div>
                      </div>
                      <div className="flex gap-3 p-3 rounded-xl glass">
                        <div className="w-8 h-8 rounded-lg glass grid place-items-center shrink-0">◉</div>
                        <div><div className="text-sm font-bold">Then Triple-Scan</div><div className="text-xs text-white/60">Audio • Muted Video • Transcript — AI finds your 4 leaks</div></div>
                      </div>
                    </div>
                    <button onClick={()=>setActive("review")} className="mt-4 w-full py-2.5 rounded-xl glass font-semibold text-sm">Go to Review →</button>
                  </div>

                  <div className="glass-card rounded-2xl p-5">
                    <div className="text-xs font-black tracking-widest text-white/50">PRACTICE EVEN ALONE</div>
                    <div className="mt-3 space-y-2 text-sm">
                      {["Record while walking — forces vocal energy","Mute playback first — see body language","Read transcript aloud — fix structure"].map(t=>(
                        <div key={t} className="flex gap-2 glass rounded-xl px-3 py-2.5"><span className="text-emerald-400">✓</span><span className="text-white/80 text-xs leading-relaxed">{t}</span></div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl p-[1px] bg-gradient-to-br from-amber-400/30 to-violet-500/20">
                    <div className="rounded-2xl bg-[#0A0A0F] p-4">
                      <div className="text-xs font-black tracking-widest text-amber-300">NEED INSPIRATION?</div>
                      <div className="mt-2 text-sm font-bold">Watch LINGAUX&apos;s 60-sec breakdown</div>
                      <div className="mt-2 aspect-video rounded-xl overflow-hidden bg-black border border-white/10 grid place-items-center relative">
                        <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60" className="absolute inset-0 w-full h-full object-cover opacity-70"/>
                        <button className="relative w-12 h-12 rounded-full bg-white text-black grid place-items-center shadow-xl">▶</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REVIEW */}
          {active==="review" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-[28px] font-bold leading-none">Review <span className="text-gradient-neon">• Triple-Scan</span></h2>
                  <p className="text-sm text-white/60 mt-2">LINGAUX Step 2 — Audio • Muted Video • Transcript. The uncomfortable truth.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="glass rounded-full px-3 py-1.5 text-xs font-bold border-emerald-400/20 text-emerald-300">● Scan complete • 4 leaks found</span>
                  <button onClick={()=>triggerPaywall("review-export")} className="px-4 py-2 rounded-full bg-white text-black text-sm font-bold">Export PDF</button>
                </div>
              </div>
              {/* Real DB banner */}
              <div className="glass-card rounded-2xl p-4 border-violet-400/20">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm">
                    <span className="font-black tracking-widest text-xs text-violet-300">LIVE DB • </span>
                    {status==="authenticated" ? (
                      latestRecordings.length ? (
                        <span>Latest: <b>{latestRecordings[0].topic.slice(0,40)}</b> • {new Date(latestRecordings[0].recordedAt).toLocaleString()} • {latestRecordings[0].status} {realReview ? `• Score ${realReview.overallScore}` : "• No review yet (24h lock or Pro needed)"}</span>
                      ) : <span>No recordings yet — go to Studio and hit Record. DB is wired.</span>
                    ) : <span>Sign in to see your real recordings from DB. Showing mock preview below.</span>}
                  </div>
                  {latestRecordings[0] && !realReview && (
                    <button onClick={async()=>{
                      const r = await fetch(`/api/review?recordingId=${latestRecordings[0].id}`);
                      const j = await r.json();
                      if(j.review) { setRealReview(j.review); setToast("Review loaded from DB"); }
                      else if(j.locked) setToast(`Locked: ${j.hoursLeft}h left (use ?force=1 for demo)`);
                      else setToast(j.error || "No review");
                      setTimeout(()=>setToast(null),3000);
                    }} className="px-4 py-2 rounded-full bg-white text-black text-xs font-bold">Load Real Review</button>
                  )}
                  {latestRecordings[0] && realReview && (
                    <span className="text-xs px-3 py-1 rounded-full bg-emerald-500 text-white font-bold">✓ Real AI scores loaded</span>
                  )}
                </div>
                {transcript && <div className="mt-3 glass rounded-xl p-3 text-xs leading-relaxed max-h-24 overflow-auto"><b>Latest transcript (Whisper):</b> {transcript}</div>}
              </div>

              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {[
                  {id:"audio", label:"Audio Only", sub:"Fillers • Pace • Monotone"},
                  {id:"video", label:"Video Muted", sub:"Eye • Gestures • Posture"},
                  {id:"transcript", label:"Transcript", sub:"Structure • Vocab • Repetition"},
                ].map(t=>(
                  <button key={t.id} onClick={()=>setReviewTab(t.id as any)} className={`shrink-0 text-left px-4 py-3 rounded-2xl border transition min-w-[180px] ${reviewTab===t.id? "bg-white text-black border-white":"glass border-white/10 text-white"}`}>
                    <div className="text-sm font-black">{t.label}</div>
                    <div className={`text-xs ${reviewTab===t.id?"text-black/60":"text-white/50"}`}>{t.sub}</div>
                  </button>
                ))}
              </div>

              <div className="grid lg:grid-cols-[1.25fr_0.75fr] gap-6">
                <div className="glass-card rounded-[24px] p-5 md:p-6">
                  {reviewTab==="audio" && (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold">Audio Scan — 5:03 • 612 words</h3>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-400 text-black font-black">Score 6.8 → 8.1 potential</span>
                      </div>
                      <div className="h-[86px] rounded-xl bg-black border border-white/10 p-3 flex items-end gap-[3px] overflow-hidden">
                        {Array.from({length:48}).map((_,i)=>(
                          <div key={i} className="flex-1 rounded-full bg-gradient-to-t from-violet-600 to-indigo-400" style={{height: `${18+ Math.sin(i*0.7)*20 + ( (i*37)%30 ) }%`, opacity: 0.85}}/>
                        ))}
                      </div>
                      <div className="grid sm:grid-cols-3 gap-3">
                        {[
                          {k:"Filler words", v:"23", d:"um(12) ah(7) like(4)", bad:true},
                          {k:"Pace", v:"118 wpm", d:"Too slow • Target 135-155", bad:true},
                          {k:"Pauses", v:"4", d:"Good pauses • Need 8-10", bad:false},
                        ].map(c=>(
                          <div key={c.k} className={`rounded-2xl p-4 border ${c.bad? "bg-red-500/10 border-red-500/20":"bg-emerald-500/10 border-emerald-500/20"}`}>
                            <div className="text-xs font-bold tracking-widest opacity-60">{c.k}</div>
                            <div className="text-xl font-black mt-1">{c.v}</div>
                            <div className="text-xs opacity-70 mt-1">{c.d}</div>
                          </div>
                        ))}
                      </div>
                      <div className="glass rounded-2xl p-4">
                        <div className="text-sm font-bold">AI Coach says</div>
                        <div className="text-sm text-white/70 mt-1 leading-relaxed">You open strong but use “like” as a crutch at 1:12, 2:40, 3:55. Replace with 1.2s silence. Your pace is 12% slow — try 10% faster next take and add 4 strategic pauses.</div>
                        <button onClick={()=>setActive("practice")} className="mt-3 px-4 py-2 rounded-full bg-white text-black text-xs font-bold">Practice Pace Drill →</button>
                      </div>
                    </div>
                  )}
                  {reviewTab==="video" && (
                    <div className="space-y-4">
                      <h3 className="font-bold">Video Muted — Body Language</h3>
                      <div className="aspect-video rounded-xl bg-black border border-white/10 overflow-hidden relative">
                        <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&auto=format&fit=crop&q=60" className="w-full h-full object-cover opacity-80"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
                        <div className="absolute bottom-3 left-3 flex gap-2">
                          <span className="text-xs px-2.5 py-1 rounded-full bg-red-500 text-white font-bold">Eye contact 42% • Fix</span>
                          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-400 text-black font-bold">Hands hidden 68%</span>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="glass rounded-2xl p-4"><div className="font-bold text-sm">Eye Contact — 42%</div><div className="text-xs text-white/60 mt-1">You look at notes, not lens. Tape a dot near camera.</div><div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full w-[42%] bg-red-500"/></div></div>
                        <div className="glass rounded-2xl p-4"><div className="font-bold text-sm">Gesture Variety — Low</div><div className="text-xs text-white/60 mt-1">Same chop gesture 14x. Try open-palm + point.</div><div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full w-[35%] bg-amber-500"/></div></div>
                      </div>
                    </div>
                  )}
                  {reviewTab==="transcript" && (
                    <div className="space-y-4">
                      <h3 className="font-bold">Transcript — Structure</h3>
                      <div className="rounded-xl bg-black border border-white/10 p-4 font-mono text-xs leading-relaxed text-white/80">
                        <span className="text-white/40">[00:00]</span> So today I wanna talk about communication and um like it&apos;s really important because... <span className="bg-amber-400 text-black px-1 rounded">um / like ×3</span> ...<br/><br/>
                        <span className="text-white/40">[01:20]</span> The first point is confidence. Confidence is key. <span className="bg-red-500/20 text-red-300 px-1 rounded border border-red-500/30">Repetition, no example</span><br/><br/>
                        <span className="text-white/40">[03:10]</span> <span className="bg-emerald-500/20 text-emerald-300 px-1 rounded border border-emerald-500/30">Good story: “When I pitched to my manager...”</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1.5 rounded-full bg-red-500/15 border border-red-500/20 text-xs font-bold text-red-300">No clear framework</span>
                        <span className="px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/20 text-xs font-bold text-amber-300">Vocab: “very” ×6</span>
                        <span className="px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-xs font-bold text-emerald-300">Strong ending</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="glass-card rounded-2xl p-5 border-amber-400/20">
                    <div className="text-xs font-black tracking-widest text-amber-300">YOUR 4 WEAKNESSES • FOCUS 1/WEEK</div>
                    <div className="mt-4 space-y-3">
                      {[
                        {w:"Filler “like/um”", p:"W1", c:"bg-red-500", imp:"Impact: High"},
                        {w:"Pace too slow (118 wpm)", p:"W2", c:"bg-amber-500", imp:"Impact: High"},
                        {w:"Eye contact 42%", p:"W3", c:"bg-orange-500", imp:"Impact: Medium"},
                        {w:"No framework", p:"W4", c:"bg-violet-500", imp:"Impact: Medium"},
                      ].map(i=>(
                        <div key={i.w} className="flex items-center gap-3 glass rounded-xl p-3">
                          <span className={`w-10 h-10 rounded-xl ${i.c} text-white grid place-items-center font-black text-xs`}>{i.p}</span>
                          <div className="flex-1 min-w-0"><div className="text-sm font-bold leading-none">{i.w}</div><div className="text-xs text-white/50">{i.imp}</div></div>
                          <span className="w-2 h-2 rounded-full bg-emerald-400"/>
                        </div>
                      ))}
                    </div>
                    <button onClick={()=>setActive("practice")} className="mt-4 w-full py-2.5 rounded-xl bg-white text-black font-bold text-sm">Create 30-Day Game Plan →</button>
                    <div className="mt-2 text-center text-xs text-white/40">Auto-generates PDF for printing</div>
                  </div>
                  <div className="glass-card rounded-2xl p-5">
                    <div className="font-bold text-sm">Effort Tracker</div>
                    <div className="mt-3 grid grid-cols-7 gap-1.5">
                      {Array.from({length:28}).map((_,i)=>(
                        <div key={i} className={`aspect-square rounded-lg border ${i<11 ? "bg-emerald-500 border-emerald-400" : i===11 ? "bg-white border-white animate-pulse" : "glass border-white/10"}`}/>
                      ))}
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-white/50"><span>Effort over outcome</span><span>11/30 days</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PRACTICE */}
          {active==="practice" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-[28px] font-bold">Practice <span className="text-gradient-gold">• Dojo</span></h2>
                <div className="hidden lg:block"><CharacterPractice/></div>
              </div>
              <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
                <div className="glass-card rounded-[24px] p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-black tracking-widest text-white/60">WEEK 2 • VOCAL VARIETY</div>
                    <span className="text-xs px-3 py-1 rounded-full bg-violet-600 text-white font-bold">Active</span>
                  </div>
                  <h3 className="mt-3 text-xl font-bold">Drill: The 3-Speed Sentance</h3>
                  <p className="text-sm text-white/60 mt-1">Say one sentence at 3 speeds: slow (power), medium (clarity), fast (excitement). AI scores variance.</p>
                  <div className="mt-5 grid sm:grid-cols-3 gap-3">
                    {["Slow • 90 wpm","Medium • 135 wpm","Fast • 170 wpm"].map(t=>(
                      <div key={t} className="glass rounded-2xl p-4 text-center">
                        <div className="w-10 h-10 rounded-xl bg-white text-black mx-auto grid place-items-center font-black">▶</div>
                        <div className="mt-2 text-xs font-bold">{t}</div>
                        <button onClick={()=>setToast("Recording drill — AI listening...")} className="mt-2 w-full py-1.5 rounded-full glass text-xs font-bold">Try</button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 glass rounded-2xl p-4 flex items-center gap-4">
                    <div className="flex-1"><div className="text-sm font-bold">Today’s target: 10 mins</div><div className="text-xs text-white/60">3 takes • 1 reflection note</div></div>
                    <div className="text-right"><div className="text-2xl font-black">6:42</div><div className="text-xs text-emerald-400 font-bold">On track</div></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="glass-card rounded-2xl p-5">
                    <div className="font-bold text-sm">Your 30-Day Calendar</div>
                    <div className="mt-3 grid grid-cols-7 gap-1.5 text-center text-xs">
                      {["M","T","W","T","F","S","S"].map((d,i)=> <div key={`${d}-${i}`} className="text-white/40 font-bold py-1">{d}</div>)}
                      {Array.from({length:30}).map((_,i)=>(
                        <div key={i} className={`aspect-square grid place-items-center rounded-lg text-xs font-bold border ${i<11? "bg-emerald-500 text-white border-emerald-400": i===11? "bg-white text-black border-white": "glass border-white/10 text-white/60"}`}>{i+1}</div>
                      ))}
                    </div>
                  </div>
                  <div className="glass-card rounded-2xl p-5">
                    <div className="font-bold text-sm">Solo Practice (No partner needed)</div>
                    <ul className="mt-3 space-y-2 text-xs text-white/70 list-disc list-inside">
                      <li>Shadow a TED talk: pause & mimic intonation</li>
                      <li>Record voice note to future self — playback tomorrow</li>
                      <li>1-min “explain to a 10-year-old” daily</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACADEMY */}
          {active==="academy" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <h2 className="font-serif text-[28px] font-bold">Academy <span className="text-gradient-neon">• Learn</span></h2>
                <div className="flex gap-2">
                  <span className="glass rounded-full px-3 py-1.5 text-xs font-bold">Free: 3 lessons</span>
                  <button onClick={()=>triggerPaywall("academy")} className="px-4 py-2 rounded-full bg-white text-black text-sm font-bold">Unlock All — Pro</button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(courses.length ? courses : [
                  {title:"The 30-Day Game Plan", slug:"30-day-game-plan", duration:"8 lessons • LINGAUX method", free:true, image:"https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=60"} as any,
                ]).map((c:any)=>(
                  <div key={c.slug || c.t} className="group glass-card rounded-2xl overflow-hidden">
                    <div className="h-36 relative overflow-hidden">
                      <img src={c.image || c.img} className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-500" alt={c.title || c.t}/>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"/>
                      {!c.free && !isPro && <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] grid place-items-center"><span className="px-3 py-1.5 rounded-full bg-amber-400 text-black text-xs font-black">◆ PRO LOCKED</span></div>}
                      <span className={`absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full font-bold ${c.free? "bg-emerald-500 text-white":"bg-white text-black"}`}>{c.free? "FREE":"PRO"}</span>
                    </div>
                    <div className="p-4">
                      <div className="font-bold text-sm leading-tight">{c.title || c.t}</div>
                      <div className="text-xs text-white/50 mt-1">{c.duration || c.l}</div>
                      <button onClick={()=> (c.free || isPro) ? setToast(`Opening ${c.title||c.t}…`) : triggerPaywall("academy-lesson")} className={`mt-3 w-full py-2 rounded-xl font-bold text-sm ${ (c.free||isPro)? "bg-white text-black":"glass border-amber-400/20 text-white"}`}>{(c.free||isPro)? "Start →":"Unlock with Pro →"}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COMMUNITY */}
          {active==="community" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-[28px] font-bold">Community <span className="text-gradient-gold">• Paid</span></h2>
                  <p className="text-sm text-white/60 mt-1">Share progress videos • Get peer + coach feedback • Weekly challenges</p>
                </div>
                <button onClick={()=>triggerPaywall("community-post")} className="px-5 py-2.5 rounded-full bg-white text-black font-bold text-sm">+ Post Progress Video</button>
              </div>
              <div className="hidden lg:flex justify-end -mt-2"><CharacterCommunity/></div>
              {!isPro && (
                <div className="glass-card rounded-2xl p-4 border-amber-400/20 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3"><span className="w-8 h-8 rounded-full bg-amber-400 text-black grid place-items-center font-black">◆</span><div><div className="text-sm font-bold">You’re viewing as Free — videos blurred</div><div className="text-xs text-white/60">Join Pro to post, comment & get feedback.</div></div></div>
                  <button onClick={()=>triggerPaywall("community-blur")} className="px-5 py-2.5 rounded-full bg-amber-400 text-black font-bold text-sm">Unlock for ₹199/mo</button>
                </div>
              )}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {u:"Sofia • Day 23", t:"Finally nailed the pause! Thanks to feedback from @Kenji", l:89, c:12, img:"https://i.pravatar.cc/150?img=5", v:"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=60"},
                  {u:"Kenji • Day 11", t:"My before/after - filler words 23 → 4 in 2 weeks!", l:142, c:28, img:"https://i.pravatar.cc/150?img=12", v:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=60"},
                  {u:"Aarav • Day 11", t:"Day 11 check-in: working on pace. Feedback?", l:34, c:7, img:"https://i.pravatar.cc/150?img=33", v:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=60"},
                  {u:"Priya • Day 30", t:"30 days done. Got promoted. This works.", l:210, c:41, img:"https://i.pravatar.cc/150?img=26", v:"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&auto=format&fit=crop&q=60"},
                  {u:"Marcus • Day 7", t:"Week 1 drill - killing “like”. Harder than gym.", l:56, c:9, img:"https://i.pravatar.cc/150?img=15", v:"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=60"},
                  {u:"Elena • Day 18", t:"Storytelling challenge entry - The failed pitch", l:98, c:19, img:"https://i.pravatar.cc/150?img=32", v:"https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&auto=format&fit=crop&q=60"},
                ].map(p=>(
                  <div key={p.u} className="glass-card rounded-2xl overflow-hidden">
                    <div className="h-44 relative overflow-hidden bg-black">
                      <img src={p.v} className={`w-full h-full object-cover ${!isPro?"blur-[8px] scale-110":""}`}/>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"/>
                      <button className="absolute inset-0 grid place-items-center"><span className="w-11 h-11 rounded-full bg-white text-black grid place-items-center shadow-xl">▶</span></button>
                      {!isPro && <span className="absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full bg-black/70 backdrop-blur border border-white/15 text-white font-bold">🔒 Pro to watch</span>}
                      <span className="absolute bottom-3 left-3 text-xs px-2 py-1 rounded-full bg-black/60 backdrop-blur text-white/90 border border-white/10">0:47 • 1080p</span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2">
                        <img src={p.img} className="w-7 h-7 rounded-full"/>
                        <span className="text-xs font-bold">{p.u}</span>
                        <span className="ml-auto text-xs px-2 py-1 rounded-full glass">Day 11</span>
                      </div>
                      <div className="mt-2 text-sm leading-relaxed text-white/85">{p.t}</div>
                      <div className="mt-3 flex items-center gap-3 text-xs text-white/50">
                        <span>♡ {p.l}</span><span>💬 {p.c}</span><span className="ml-auto">2h ago</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MESSAGES */}
          {active==="messages" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-[28px] font-bold">Messages <span className="text-gradient-neon">• Private</span></h2>
                <span className="glass rounded-full px-3 py-1.5 text-xs font-bold border-emerald-400/20 text-emerald-300">E2E encrypted • Moderated</span>
              </div>
              <div className="grid lg:grid-cols-[340px_1fr] gap-4 h-[560px]">
                <div className="glass-card rounded-2xl p-3 flex flex-col overflow-hidden">
                  <div className="flex items-center gap-2 p-2">
                    <input placeholder="Search conversations..." className="flex-1 glass rounded-full px-4 py-2 text-sm bg-white/[0.06] border-white/10 placeholder:text-white/40 outline-none focus:border-white/20"/>
                  </div>
                  <div className="mt-2 space-y-1 overflow-y-auto pr-1">
                    {[
                      {n:"Mira • Coach", m:"Great pause at 2:34! Try 2x more", t:"2m", unread:2, a:"https://i.pravatar.cc/100?img=9"},
                      {n:"Sofia K.", m:"Loved your Day 11 video 🔥", t:"1h", unread:1, a:"https://i.pravatar.cc/100?img=5"},
                      {n:"Practice Pod #3", m:"Kenji: who's up for live room tonight?", t:"3h", unread:3, a:"https://i.pravatar.cc/100?img=12"},
                      {n:"Priya M.", m:"You: Thanks for feedback!", t:"1d", unread:0, a:"https://i.pravatar.cc/100?img=26"},
                    ].map(c=>(
                      <div key={c.n} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer ${c.unread? "glass-strong border-amber-400/15":"hover:bg-white/[0.04]"}`}>
                        <img src={c.a} className="w-9 h-9 rounded-full"/>
                        <div className="flex-1 min-w-0"><div className="text-sm font-bold leading-none truncate">{c.n}</div><div className="text-xs text-white/60 truncate">{c.m}</div></div>
                        <div className="text-right"><div className="text-xs text-white/40">{c.t}</div>{c.unread>0 && <div className="mt-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs grid place-items-center font-bold ml-auto">{c.unread}</div>}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto pt-3 border-t border-white/10">
                    <div className="glass rounded-xl p-3 flex items-start gap-2">
                      <span className="text-amber-300 mt-0.5">🛡</span>
                      <div className="text-xs leading-relaxed text-white/60"><b className="text-white">Safe space:</b> Vulgar, sexual, harassment auto-blocked. 3 strikes = ban. Be kind, be constructive.</div>
                    </div>
                  </div>
                </div>
                <div className="glass-card rounded-2xl flex flex-col overflow-hidden">
                  <div className="p-4 flex items-center gap-3 border-b border-white/10">
                    <img src="https://i.pravatar.cc/100?img=9" className="w-9 h-9 rounded-full"/>
                    <div><div className="font-bold text-sm">Mira • Coach</div><div className="text-xs text-emerald-400">● Online • Usually replies in 2h</div></div>
                    <button className="ml-auto px-3 py-1.5 rounded-full glass text-xs font-semibold">View profile</button>
                  </div>
                  <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-black/20">
                    <div className="max-w-[78%] glass rounded-2xl rounded-bl-sm p-3 text-sm">Aarav, your transcript shows <b>no framework</b> — try PREP: Point → Reason → Example → Point. Want a 5-min drill on it?</div>
                    <div className="max-w-[78%] ml-auto bg-white text-black rounded-2xl rounded-br-sm p-3 text-sm">Yes please! Also — is my eye contact really 42%? Feels higher</div>
                    <div className="max-w-[78%] glass rounded-2xl rounded-bl-sm p-3 text-sm">It is 42% measured at lens. Trick: stick a tiny smiley next to camera. Your brain will look. Try tomorrow&apos;s record.</div>
                    <div className="glass rounded-xl p-3 flex items-center gap-2 border-amber-400/20">
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-400 text-black font-bold">AI Moderation</span>
                      <span className="text-xs text-white/60">This chat is scanned for vulgar/sexual/harassment. Be respectful.</span>
                    </div>
                  </div>
                  <div className="p-3 border-t border-white/10 flex gap-2">
                    <input placeholder={isPro? "Type a message... be kind and specific":"Pro to message privately → Upgrade"} disabled={!isPro} className="flex-1 glass rounded-full px-4 py-2.5 text-sm bg-white/[0.06] border-white/10 placeholder:text-white/40 outline-none disabled:opacity-60"/>
                    <button onClick={()=> isPro ? setToast("Sent!") : triggerPaywall("messages")} className="px-5 py-2.5 rounded-full bg-white text-black font-bold text-sm">{isPro? "Send":"🔒"}</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PROFILE */}
          {active==="profile" && (
            <div className="space-y-6 max-w-[900px]">
              <h2 className="font-serif text-[28px] font-bold">Profile <span className="text-white/50">• Billing & Settings</span></h2>
              <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-6">
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <img src="https://i.pravatar.cc/100?img=33" className="w-16 h-16 rounded-2xl object-cover"/>
                    <div className="flex-1">
                      <div className="font-bold text-lg leading-none">Aarav S.</div>
                      <div className="text-sm text-white/60">aarav@lingaux.app • Joined Sep 2025</div>
                      <div className="mt-2 flex gap-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${isPro? "bg-amber-400 text-black":"glass text-white"}`}>{isPro? "◆ PRO":"FREE"}</span>
                        <span className="text-xs px-2.5 py-1 rounded-full glass">Level 8 • 1,240 XP</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                    <div className="glass rounded-xl p-3"><div className="text-lg font-black">23</div><div className="text-xs text-white/50">Records</div></div>
                    <div className="glass rounded-xl p-3"><div className="text-lg font-black">11</div><div className="text-xs text-white/50">Day streak</div></div>
                    <div className="glass rounded-xl p-3"><div className="text-lg font-black">8.2</div><div className="text-xs text-white/50">Avg score</div></div>
                  </div>
                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-white/60">Email</span><span className="font-medium">aarav@lingaux.app</span></div>
                    <div className="flex justify-between text-sm"><span className="text-white/60">Password</span><button className="text-xs px-3 py-1 rounded-full glass">Change</button></div>
                    <div className="flex justify-between text-sm"><span className="text-white/60">Two-factor</span><span className="text-emerald-400 text-xs font-bold">● Enabled</span></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className={`rounded-2xl p-[1px] ${isPro? "bg-gradient-to-br from-amber-400 to-orange-500":"bg-white/10"}`}>
                    <div className="rounded-2xl bg-[#0A0A0F] p-5">
                      <div className="flex items-center justify-between">
                        <div className="font-black tracking-widest text-sm">{isPro? "PRO ACTIVE":"UPGRADE TO PRO"}</div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-black ${isPro? "bg-emerald-500 text-white":"bg-amber-400 text-black"}`}>{isPro? "ACTIVE":"POPULAR"}</span>
                      </div>
                      <div className="mt-2 text-3xl font-black">{isPro? "₹199":"₹199"}<span className="text-sm font-medium text-white/60">/month</span></div>
                      <ul className="mt-3 space-y-1.5 text-sm text-white/70">
                        <li>✓ Unlimited Triple-Scan AI</li><li>✓ Paid community + private chat</li><li>✓ Certificates + Game Plan PDF</li><li>✓ Cancel anytime</li>
                      </ul>
                      {!isPro ? (
                        <button onClick={()=>triggerPaywall("profile")} className="mt-4 w-full py-3 rounded-xl bg-white text-black font-black">Upgrade Now</button>
                      ):(
                        <button onClick={()=>{setIsProLocal(false); setToast("Downgraded to Free — for demo"); setTimeout(()=>setToast(null),2000);}} className="mt-4 w-full py-3 rounded-xl glass font-bold">Manage billing • Downgrade</button>
                      )}
                      <div className="mt-3 text-xs text-white/40 text-center">PayPal • Razorpay UPI • Cards • Bank Transfer • GST invoice</div>
                    </div>
                  </div>
                  <div className="glass-card rounded-2xl p-5">
                    <div className="font-bold text-sm">Site health</div>
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex justify-between"><span className="text-white/60">Uptime</span><span className="text-emerald-400 font-bold">99.98% • 4ms edge</span></div>
                      <div className="flex justify-between"><span className="text-white/60">Data</span><span>GDPR • E2E messages</span></div>
                      <div className="flex justify-between"><span className="text-white/60">Support</span><span>support@lingaux.app • 12h</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Bottom nav mobile */}
      <div className="xl:hidden fixed bottom-0 inset-x-0 z-30 glass-strong border-t border-white/10">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {tabs.slice(0,5).map(t=>(
            <button key={t.id} onClick={()=>setActive(t.id)} className={`flex flex-col items-center gap-1 py-1.5 rounded-xl ${active===t.id? "bg-white text-black":"text-white/60"}`}>
              <span className="text-[16px] leading-none">{t.icon}</span>
              <span className="text-[10px] font-bold leading-none">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AUTH MODAL */}
      {showAuth && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={()=>setShowAuth(false)}/>
          <div className="relative w-full max-w-[440px] glass-strong rounded-[24px] overflow-hidden border-white/15 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-amber-500/10 pointer-events-none"/>
            <div className="relative p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white text-black grid place-items-center font-black">LINGAUX</div>
                  <h3 className="mt-3 font-serif text-2xl font-bold leading-none">{authMode==="signup" ? "Create your LINGAUX" : "Welcome back"}</h3>
                  <p className="text-sm text-white/60 mt-1">{authMode==="signup" ? "Free to start • No card needed" : "Sign in to continue your streak"}</p>
                </div>
                <button onClick={()=>setShowAuth(false)} className="w-8 h-8 rounded-full glass grid place-items-center">✕</button>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {[
                  {k:"Google", sub:"One tap", id:"google"},
                  {k:"Apple", sub:"Face ID", id:"apple"},
                  {k:"LinkedIn", sub:"For career", id:"linkedin"},
                ].map(p=>(
                  <button key={p.k} onClick={()=>handleOAuth(p.id as any)} className="glass rounded-xl py-2.5 text-center hover:bg-white hover:text-black transition group">
                    <div className="text-xs font-black">{p.k}</div><div className="text-[11px] opacity-60 group-hover:opacity-60">{p.sub}</div>
                  </button>
                ))}
              </div>

              <div className="my-4 flex items-center gap-3"><div className="h-px flex-1 bg-white/10"/><span className="text-xs text-white/40">or continue with email</span><div className="h-px flex-1 bg-white/10"/></div>

              <div className="flex gap-2 p-1 rounded-full glass w-fit">
                <button onClick={()=>setAuthMode("signup")} className={`px-4 py-1.5 rounded-full text-sm font-bold ${authMode==="signup"?"bg-white text-black":"text-white/60"}`}>Sign up</button>
                <button onClick={()=>setAuthMode("signin")} className={`px-4 py-1.5 rounded-full text-sm font-bold ${authMode==="signin"?"bg-white text-black":"text-white/60"}`}>Sign in</button>
              </div>

              <div className="mt-4 space-y-3">
                {authMode==="signup" && (
                  <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="w-full glass rounded-xl px-4 py-3 text-sm bg-white/[0.06] border-white/10 placeholder:text-white/40 outline-none focus:border-white/20"/>
                )}
                <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" className="w-full glass rounded-xl px-4 py-3 text-sm bg-white/[0.06] border-white/10 placeholder:text-white/40 outline-none focus:border-white/20"/>
                <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password • min 8 chars" type="password" autoComplete={authMode==="signup"?"new-password":"current-password"} className="w-full glass rounded-xl px-4 py-3 text-sm bg-white/[0.06] border-white/10 placeholder:text-white/40 outline-none focus:border-white/20"/>
                {need2FA && (
                  <input value={twoFactorCode} onChange={e=>setTwoFactorCode(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="2FA code • 6 digits (if enabled)" inputMode="numeric" className="w-full glass rounded-xl px-4 py-3 text-sm bg-amber-500/10 border-amber-400/30 placeholder:text-white/40 outline-none focus:border-amber-400/50"/>
                )}
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-white/60"><input type="checkbox" className="rounded"/> Remember me</label>
                  <a className="text-white hover:underline">Forgot password?</a>
                </div>
                <button disabled={authLoading} onClick={()=> authMode==="signup" ? handleRegister() : handleCredentialsLogin()} className="w-full py-3 rounded-xl bg-white text-black font-black disabled:opacity-60">
                  {authLoading ? "Please wait..." : need2FA ? "Verify 2FA & Sign in →" : authMode==="signup" ? "Create account →" : "Sign in →"}
                </button>
                <button onClick={()=>{setToast("Magic link: configure Resend + Auth.js email provider to enable"); setTimeout(()=>setToast(null),2500);}} className="w-full py-3 rounded-xl glass font-bold text-sm">✉ Send magic link (passwordless)</button>
                <div className="text-xs text-white/40 leading-relaxed text-center">
                  By continuing you agree to Terms & Privacy. We allow paste + password managers • <span className="text-white/70">WCAG AA Auth</span>. OAuth = no cognitive test needed.
                </div>
                <div className="glass rounded-xl p-3 flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-white text-black font-bold">OTP</span>
                  <span className="text-xs text-white/60">India: Phone OTP via RazorpayX • UPI users can login with number</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAYWALL MODAL */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={()=>setShowPaywall(false)}/>
          <div className="relative w-full max-w-[720px] glass-strong rounded-[28px] overflow-hidden border-white/15 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/15 via-violet-600/10 to-indigo-600/15 pointer-events-none"/>
            <div className="relative p-6 md:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-black tracking-widest text-amber-300"><span>◆</span> LINGAUX PRO • UNLOCK EVERYTHING</div>
                  <h3 className="mt-2 font-serif text-2xl md:text-3xl font-bold leading-none">Go Pro. <span className="text-gradient-gold">Transform faster.</span></h3>
                  <p className="text-sm text-white/60 mt-2">Triggered from: <span className="text-white font-semibold">{paywallSource}</span> • Join 8,200+ pros • Cancel anytime</p>
                </div>
                <button onClick={()=>setShowPaywall(false)} className="w-9 h-9 rounded-full glass grid place-items-center shrink-0">✕</button>
              </div>

              <div className="mt-6 grid md:grid-cols-3 gap-3">
                {[
                  {name:"Monthly", price:"₹199", sub:"Billed monthly • Most flexible", popular:false},
                  {name:"Annual", price:"₹1,490", sub:"₹124/mo • Save 38%", popular:true},
                  {name:"Lifetime", price:"₹3,999", sub:"Pay once • Forever", popular:false},
                ].map(p=>(
                  <div key={p.name} className={`rounded-2xl p-[1.5px] ${p.popular? "bg-gradient-to-br from-amber-400 to-orange-500":"bg-white/10"}`}>
                    <div className={`rounded-2xl p-4 h-full ${p.popular? "bg-[#0A0A0F]":"glass"}`}>
                      <div className="flex items-center justify-between">
                        <div className="font-black text-sm">{p.name}</div>
                        {p.popular && <span className="text-xs px-2 py-1 rounded-full bg-amber-400 text-black font-black">POPULAR</span>}
                      </div>
                      <div className="mt-2 text-2xl font-black">{p.price}</div>
                      <div className="text-xs text-white/60">{p.sub}</div>
                      <button onClick={()=> handleSubscribe("stripe", p.name.toLowerCase() as any)} className={`mt-3 w-full py-2.5 rounded-xl font-black text-sm ${p.popular? "bg-white text-black":"glass"}`}>Choose {p.name}</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <div className="text-xs font-black tracking-widest text-white/50">CHOOSE PAYMENT • GLOBAL + INDIA</div>
                <div className="mt-3 grid sm:grid-cols-2 gap-3">
                  {[
                    {t:"Stripe", d:"Cards • Apple Pay • Google Pay", icon:"💳", id:"stripe"},
                    {t:"PayPal", d:"Global • Buyer protection", icon:"🅿️", id:"paypal"},
                    {t:"Razorpay", d:"UPI • NetBanking • Wallets • Cards (India)", icon:"🇮🇳", id:"razorpay"},
                    {t:"Coins", d:`Wallet: ${refCoins} coins • 80=80rs • Platform only`, icon:"◆", id:"coins"},
                    {t:"Bank Transfer", d:"NEFT/IMPS • Manual verification in 12h", icon:"🏦", id:"bank"},
                  ].map(m=>(
                    <button key={m.t} onClick={()=> handleSubscribe(m.id as any, "monthly")} className="text-left glass rounded-2xl p-4 flex gap-3 hover:bg-white hover:text-black transition group">
                      <span className="w-10 h-10 rounded-xl bg-white text-black grid place-items-center shrink-0 group-hover:bg-black group-hover:text-white transition">{m.icon}</span>
                      <div><div className="font-bold text-sm">{m.t}</div><div className="text-xs opacity-60 leading-tight">{m.d}</div></div>
                    </button>
                  ))}
                </div>
                <div className="mt-4 glass rounded-2xl p-4">
                  <div className="text-sm font-bold">What you unlock instantly</div>
                  <div className="mt-2 grid sm:grid-cols-2 gap-2 text-xs text-white/70">
                    <span>✓ Unlimited AI Triple-Scan (all 3 modes)</span><span>✓ Paid community posting + video</span>
                    <span>✓ Private 1:1 & group chat</span><span>✓ Game Plan PDF + Certificates</span>
                    <span>✓ All Academy courses</span><span>✓ Remove blur + export</span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-white/40 text-center">Secure • GST invoice • 7-day refund • support@lingaux.app • UPI: lingaux@razorpay</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-strong rounded-full px-5 py-3 flex items-center gap-3 border-white/15 shadow-xl max-w-[92vw]">
          <span className="w-8 h-8 rounded-full bg-white text-black grid place-items-center font-black">✓</span>
          <span className="text-sm font-semibold whitespace-nowrap">{toast}</span>
          <button onClick={()=>setToast(null)} className="ml-2 w-7 h-7 rounded-full glass grid place-items-center text-xs">✕</button>
        </div>
      )}

      {/* FOOTER mini */}
      <footer className="border-t border-white/5 glass mt-8">
        <div className="max-w-[1600px] mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-4 text-xs text-white/40">
          <span>© 2026 LINGAUX Labs • Made for global speakers • <a className="text-white/70 hover:text-white">Privacy</a> • <a className="text-white/70 hover:text-white">Terms</a> • <a className="text-white/70 hover:text-white">Refund</a></span>
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/> All systems operational • Edge • 4ms</span>
        </div>
      </footer>
    </div>
  );
}
