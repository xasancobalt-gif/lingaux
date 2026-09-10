"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Tab = "overview"|"users"|"posts"|"recordings"|"billing"|"moderation"|"security";

export default function AdminPage(){
  const { data: session, status } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin" || (session?.user as any)?.isAdmin;
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [toast, setToast] = useState<string|null>(null);
  const [editingPost, setEditingPost] = useState<string|null>(null);
  const [editContent, setEditContent] = useState("");
  // 2FA
  const [twoEnabled, setTwoEnabled] = useState<boolean>(false);
  const [twoQR, setTwoQR] = useState<string|null>(null);
  const [twoSecret, setTwoSecret] = useState<string|null>(null);
  const [twoCode, setTwoCode] = useState("");

  const showToast=(m:string)=>{ setToast(m); setTimeout(()=>setToast(null),3000); };

  // Load
  useEffect(()=>{
    if(!isAdmin) return;
    if(tab==="overview") fetch("/api/admin/stats").then(r=>r.json()).then(j=> setStats(j)).catch(()=>{});
    if(tab==="users") fetch(`/api/admin/users?limit=100&q=${encodeURIComponent(q)}`).then(r=>r.json()).then(j=> setUsers(j.users||[])).catch(()=>{});
    if(tab==="posts") fetch("/api/admin/posts").then(r=>r.json()).then(j=> setPosts(j.posts||[])).catch(()=>{});
    if(tab==="recordings") fetch("/api/admin/recordings").then(r=>r.json()).then(j=> setRecordings(j.recordings||[])).catch(()=>{});
    if(tab==="billing") fetch("/api/admin/subscriptions").then(r=>r.json()).then(j=> setSubs(j.subscriptions||[])).catch(()=>{});
    if(tab==="security" || tab==="overview") fetch("/api/auth/2fa/status").then(r=>r.json()).then(j=> setTwoEnabled(!!j.enabled)).catch(()=>{});
  },[tab, isAdmin, q]);

  const handle2FASetup = async ()=>{
    const r=await fetch("/api/auth/2fa/setup",{method:"POST"});
    const j=await r.json();
    if(r.ok){ setTwoQR(j.qr); setTwoSecret(j.secret); showToast("Scan QR with Google Authenticator"); }
    else showToast(j.error);
  };
  const handle2FAVerify = async ()=>{
    const r=await fetch("/api/auth/2fa/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token: twoCode})});
    const j=await r.json();
    if(r.ok){ setTwoEnabled(true); setTwoQR(null); setTwoSecret(null); setTwoCode(""); showToast("2FA enabled ✓"); }
    else showToast(j.error);
  };
  const handle2FADisable = async ()=>{
    if(!confirm("Disable 2FA? You can re-enable anytime. This is optional.")) return;
    const r=await fetch("/api/auth/2fa/disable",{method:"POST"});
    const j=await r.json();
    if(r.ok){ setTwoEnabled(false); showToast("2FA disabled — login without code again"); }
    else showToast(j.error);
  };

  if(status==="loading") return <div className="min-h-screen bg-mesh grid place-items-center text-white">Loading…</div>;
  if(status!=="authenticated") return (
    <div className="min-h-screen bg-mesh grid place-items-center p-6">
      <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center text-white">
        <h1 className="font-serif text-2xl font-bold">Admin — Sign in required</h1>
        <p className="text-sm text-white/60 mt-2">Use ghalmenandkumar@gmail.com or xasancobalt@gmail.com</p>
        <Link href="/" className="mt-6 inline-block px-6 py-3 rounded-full bg-white text-black font-bold">Go to LINGAUX →</Link>
      </div>
    </div>
  );
  if(!isAdmin) return (
    <div className="min-h-screen bg-mesh grid place-items-center p-6">
      <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center text-white border-red-500/20">
        <h1 className="font-serif text-2xl font-bold">403 — Admin only</h1>
        <p className="text-sm text-white/60 mt-2">Your account <b className="text-white">{session.user?.email}</b> is not admin. Contact ghalmenandkumar@gmail.com</p>
        <Link href="/" className="mt-6 inline-block px-6 py-3 rounded-full bg-white text-black font-bold">Back to app</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-mesh text-white">
      <header className="sticky top-0 z-30 glass-strong border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-black grid place-items-center font-black">A</div>
            <div>
              <div className="font-black tracking-widest text-sm">LINGAUX ADMIN</div>
              <div className="text-xs text-white/50">{session.user?.email} • role: {(session.user as any).role}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="px-4 py-2 rounded-full glass text-sm font-semibold">← Back to App</Link>
            <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-black">● LIVE DB</span>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar">
          {(["overview","users","posts","recordings","billing","moderation","security"] as Tab[]).map(t=>(
            <button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${tab===t? "bg-white text-black":"glass text-white/70 hover:text-white"}`}>{t.toUpperCase()}</button>
          ))}
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* OVERVIEW */}
        {tab==="overview" && (
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-serif text-xl font-bold">Overview — Full control</h2>
              <p className="text-sm text-white/60">You can edit, change, delete, add, pin, feature anything. All actions hit Prisma + DB instantly.</p>
              {stats ? (
                <div className="mt-6 grid md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="glass rounded-xl p-4 text-center"><div className="text-2xl font-black">{stats.users}</div><div className="text-xs text-white/50">Users</div></div>
                  <div className="glass rounded-xl p-4 text-center"><div className="text-2xl font-black">{stats.posts}</div><div className="text-xs text-white/50">Posts</div></div>
                  <div className="glass rounded-xl p-4 text-center"><div className="text-2xl font-black">{stats.recordings}</div><div className="text-xs text-white/50">Recordings</div></div>
                  <div className="glass rounded-xl p-4 text-center"><div className="text-2xl font-black">{stats.activeSubs}</div><div className="text-xs text-white/50">Active Subs</div></div>
                  <div className="glass rounded-xl p-4 text-center"><div className="text-2xl font-black">₹{(stats.revenuePaise/100).toLocaleString()}</div><div className="text-xs text-white/50">Revenue</div></div>
                  <div className="glass rounded-xl p-4 text-center"><div className="text-2xl font-black text-amber-400">{stats.pendingBank}</div><div className="text-xs text-white/50">Bank Pending</div></div>
                </div>
              ) : <div className="text-sm text-white/40 mt-4">Loading stats…</div>}
              <div className="mt-6 flex flex-wrap gap-2">
                <button onClick={()=>setTab("users")} className="px-4 py-2 rounded-full bg-white text-black font-bold text-sm">Manage Users</button>
                <button onClick={()=>setTab("posts")} className="px-4 py-2 rounded-full glass text-sm">Moderate Posts →</button>
                <a href="/api/admin/stats" target="_blank" className="px-4 py-2 rounded-full glass text-sm">View JSON</a>
              </div>
            </div>
            <div className="glass-card rounded-2xl p-6 border-amber-400/20">
              <div className="text-sm font-black tracking-widest text-amber-300">ADMIN CREDENTIALS</div>
              <div className="mt-2 text-sm leading-relaxed">
                <div>• <b>ghalmenandkumar@gmail.com</b> / <b>xasancobalt@gmail.com</b> — both auto-promoted to <code className="px-1.5 py-0.5 rounded bg-white/10">role=admin</code> + <code className="px-1.5 py-0.5 rounded bg-white/10">plan=pro</code> on first sign-in (credentials or Google OAuth).</div>
                <div className="mt-1">• Default password after seed: <code className="px-2 py-1 rounded bg-amber-400 text-black font-mono">LINGAUXAdmin2026!</code> — change in Profile → Change password after login.</div>
                <div className="mt-1 text-white/60">Auth: Auth.js v5 `src/lib/auth.ts:1` with `isAdmin()` `src/lib/admin.ts:1` + `requireAdmin()` `src/lib/admin-guard.ts:1`. All `/api/admin/*` return 403 if not admin.</div>
              </div>
            </div>
            <div className="glass-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 border-violet-400/20">
              <div>
                <div className="font-bold text-sm">2FA — Optional</div>
                <div className="text-xs text-white/60">Status: {twoEnabled ? <span className="text-emerald-400 font-bold">Enabled ✓</span> : <span className="text-white/50">Disabled — login with password only (default)</span>} • Keep it optional per your request.</div>
              </div>
              <button onClick={()=>setTab("security")} className="px-4 py-2 rounded-full bg-white text-black text-sm font-bold">Manage 2FA →</button>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab==="users" && (
          <div className="glass-card rounded-2xl p-6">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <h2 className="font-bold text-lg">Users • Edit / Change / Delete</h2>
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search email or name…" className="glass rounded-full px-4 py-2 text-sm bg-white/5 border-white/10 outline-none placeholder:text-white/40"/>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-white/40 text-xs"><tr><th className="text-left py-2">Email</th><th className="text-left">Role</th><th>Plan</th><th>XP</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.map((u:any)=>(
                    <tr key={u.id} className="border-t border-white/5">
                      <td className="py-3"><div className="font-semibold">{u.email}</div><div className="text-xs text-white/40">{u.name} • {u.track||"-"}</div></td>
                      <td>
                        <select value={u.role} onChange={async e=>{
                          const role=e.target.value;
                          const r=await fetch("/api/admin/users",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:u.id, role})});
                          if(r.ok){ setUsers(prev=>prev.map(x=>x.id===u.id?{...x, role}:x)); showToast(`Role → ${role}`); } else showToast("Failed");
                        }} className="glass rounded-full px-2 py-1 text-xs bg-black">
                          <option value="user">user</option><option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="text-center">
                        <select value={u.plan} onChange={async e=>{
                          const plan=e.target.value;
                          const r=await fetch("/api/admin/users",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:u.id, plan})});
                          if(r.ok){ setUsers(prev=>prev.map(x=>x.id===u.id?{...x, plan}:x)); showToast(`Plan → ${plan}`); }
                        }} className="glass rounded-full px-2 py-1 text-xs bg-black">
                          <option value="free">free</option><option value="pro">pro</option><option value="lifetime">lifetime</option>
                        </select>
                      </td>
                      <td className="text-center">{u.xp}</td>
                      <td className="text-center flex gap-1 justify-center py-2">
                        <button onClick={async()=>{
                          if(!confirm(`Delete ${u.email}?`)) return;
                          const r=await fetch(`/api/admin/users?userId=${u.id}`,{method:"DELETE"});
                          if(r.ok){ setUsers(prev=>prev.filter(x=>x.id!==u.id)); showToast("Deleted"); } else { const j=await r.json(); showToast(j.error); }
                        }} className="px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-xs text-white/40">Primary admins (ghalmen.../xasan...) cannot be deleted — 403 guard.</div>
          </div>
        )}

        {/* POSTS */}
        {tab==="posts" && (
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg">Community Posts • Pin / Feature / Hide / Edit / Delete / Add</h2>
                <button onClick={async()=>{
                  const content=prompt("New post content (admin as you):");
                  if(!content) return;
                  const r=await fetch("/api/admin/posts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content, isPinned:false})});
                  if(r.ok){ showToast("Created"); setTab("posts"); fetch("/api/admin/posts").then(r=>r.json()).then(j=>setPosts(j.posts)); }
                }} className="px-4 py-2 rounded-full bg-white text-black font-bold text-sm">+ Add Post</button>
              </div>
              <div className="mt-4 space-y-3">
                {posts.map((p:any)=>(
                  <div key={p.id} className={`glass rounded-xl p-4 ${p.isPinned? "border-amber-400/30 bg-amber-500/5": p.isHidden? "opacity-60 border-red-500/20": ""}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="text-xs text-white/40">{p.user?.email} • {new Date(p.createdAt).toLocaleString()} • {p.likes} likes {p.isPinned&&<span className="ml-2 px-2 py-0.5 rounded-full bg-amber-400 text-black text-xs font-black">PINNED</span>} {p.isFeatured&&<span className="ml-1 px-2 py-0.5 rounded-full bg-violet-600 text-white text-xs font-bold">FEATURED</span>} {p.isHidden&&<span className="ml-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs">HIDDEN</span>}</div>
                        {editingPost===p.id ? (
                          <textarea value={editContent} onChange={e=>setEditContent(e.target.value)} className="mt-2 w-full glass rounded-xl p-3 text-sm bg-white/5 border-white/10 min-h-[80px]"/>
                        ) : (
                          <div className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">{p.content}</div>
                        )}
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full glass">{p.day?`Day ${p.day}`:"Post"}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {editingPost===p.id ? (
                        <>
                          <button onClick={async()=>{
                            const r=await fetch("/api/admin/posts",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({postId:p.id, content: editContent})});
                            if(r.ok){ setPosts(prev=>prev.map(x=>x.id===p.id?{...x, content:editContent}:x)); setEditingPost(null); showToast("Edited"); }
                          }} className="px-3 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-bold">Save</button>
                          <button onClick={()=>setEditingPost(null)} className="px-3 py-1.5 rounded-full glass text-xs">Cancel</button>
                        </>
                      ) : (
                        <button onClick={()=>{ setEditingPost(p.id); setEditContent(p.content); }} className="px-3 py-1.5 rounded-full glass text-xs font-bold">Edit</button>
                      )}
                      <button onClick={async()=>{
                        const r=await fetch("/api/admin/posts",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({postId:p.id, isPinned: !p.isPinned})});
                        if(r.ok){ setPosts(prev=>prev.map(x=>x.id===p.id?{...x, isPinned: !x.isPinned}:x)); showToast(p.isPinned?"Unpinned":"Pinned to top");
                        }
                      }} className={`px-3 py-1.5 rounded-full text-xs font-bold ${p.isPinned?"bg-amber-400 text-black":"glass"}`}>{p.isPinned?"Unpin":"Pin"}</button>
                      <button onClick={async()=>{
                        const r=await fetch("/api/admin/posts",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({postId:p.id, isFeatured: !p.isFeatured})});
                        if(r.ok){ setPosts(prev=>prev.map(x=>x.id===p.id?{...x, isFeatured: !x.isFeatured}:x)); showToast(p.isFeatured?"Unfeatured":"Featured"); }
                      }} className={`px-3 py-1.5 rounded-full text-xs font-bold ${p.isFeatured?"bg-violet-600 text-white":"glass"}`}>{p.isFeatured?"Unfeature":"Feature"}</button>
                      <button onClick={async()=>{
                        const r=await fetch("/api/admin/posts",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({postId:p.id, isHidden: !p.isHidden})});
                        if(r.ok){ setPosts(prev=>prev.map(x=>x.id===p.id?{...x, isHidden: !x.isHidden}:x)); showToast(p.isHidden?"Visible again":"Hidden (only admin sees)"); }
                      }} className={`px-3 py-1.5 rounded-full text-xs font-bold ${p.isHidden?"bg-emerald-600 text-white":"bg-white/10"}`}>{p.isHidden?"Unhide":"Hide"}</button>
                      <button onClick={async()=>{
                        if(!confirm("Delete post?")) return;
                        const r=await fetch(`/api/admin/posts?postId=${p.id}`,{method:"DELETE"});
                        if(r.ok){ setPosts(prev=>prev.filter(x=>x.id!==p.id)); showToast("Deleted"); }
                      }} className="px-3 py-1.5 rounded-full bg-red-500 text-white text-xs font-bold">Delete</button>
                    </div>
                  </div>
                ))}
                {posts.length===0 && <div className="text-sm text-white/40">No posts yet.</div>}
              </div>
            </div>
          </div>
        )}

        {/* RECORDINGS */}
        {tab==="recordings" && (
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-bold text-lg">Recordings • Edit / Delete any</h2>
            <div className="mt-4 space-y-3">
              {recordings.map((r:any)=>(
                <div key={r.id} className="glass rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-sm">{r.topic}</div>
                      <div className="text-xs text-white/40">{r.user?.email} • {r.duration}s • {new Date(r.recordedAt).toLocaleString()} • {r.status} {r.review && `• Score ${r.review.overallScore}`}</div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full glass">{r.id.slice(0,8)}</span>
                  </div>
                  {r.transcript && <div className="mt-2 text-xs leading-relaxed bg-black/20 rounded-lg p-2 max-h-20 overflow-auto">{r.transcript}</div>}
                  <div className="mt-3 flex gap-2">
                    <button onClick={async()=>{
                      const nt=prompt("Edit transcript:", r.transcript||"");
                      if(nt===null) return;
                      const res=await fetch("/api/admin/recordings",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({recordingId:r.id, transcript:nt})});
                      if(res.ok){ showToast("Updated"); setRecordings(prev=>prev.map(x=>x.id===r.id?{...x, transcript:nt}:x)); }
                    }} className="px-3 py-1.5 rounded-full glass text-xs">Edit</button>
                    <button onClick={async()=>{
                      if(!confirm("Delete recording + review?")) return;
                      const res=await fetch(`/api/admin/recordings?recordingId=${r.id}`,{method:"DELETE"});
                      if(res.ok){ setRecordings(prev=>prev.filter(x=>x.id!==r.id)); showToast("Deleted"); }
                    }} className="px-3 py-1.5 rounded-full bg-red-500 text-white text-xs font-bold">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BILLING */}
        {tab==="billing" && (
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-bold text-lg">Billing • Subscriptions + Bank Pending</h2>
            <div className="mt-4 space-y-2">
              {subs.map((s:any)=>(
                <div key={s.id} className="glass rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-sm">{s.user?.email} • {s.provider} • {s.plan} • {s.status}</div>
                    <div className="text-xs text-white/40">{s.currency} {(s.amount||0)/100} • {new Date(s.createdAt).toLocaleString()} • {s.providerId?.slice(0,12)}</div>
                  </div>
                  <div className="flex gap-2">
                    {s.status==="pending_bank" && (
                      <button onClick={async()=>{
                        const r=await fetch("/api/admin/subscriptions",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({subscriptionId:s.id, status:"active"})});
                        if(r.ok){ showToast("Approved → pro"); setSubs(prev=>prev.map(x=>x.id===s.id?{...x, status:"active"}:x)); }
                      }} className="px-3 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-bold">Approve</button>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.status==="active"?"bg-emerald-500 text-white":"bg-white/10"}`}>{s.status}</span>
                  </div>
                </div>
              ))}
              {subs.length===0 && <div className="text-sm text-white/40">No subscriptions yet.</div>}
            </div>
          </div>
        )}

        {tab==="moderation" && (
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-bold text-lg">Moderation — Vulgar / harassment auto-blocked + hidden posts</h2>
            <p className="text-sm text-white/60 mt-1">All community posts go through `BLOCKED` list `src/app/api/community/route.ts:6` (Perspective API ready). Use Hide/Pin above. Flagged messages in <code className="px-1 rounded bg-white/10">Message.isFlagged</code> — extend to show here.</p>
            <div className="mt-4 glass rounded-xl p-4 text-sm">
              Next level: add <code>Perspective API</code> + <code>Hive AI</code> NSFW scan — keys in <code>PERSPECTIVE_API_KEY</code> → uncomment in routes.
            </div>
          </div>
        )}

        {tab==="security" && (
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-bold text-lg">Security • 2FA — Optional for Admins</h2>
              <p className="text-sm text-white/60 mt-1">Keep it optional — no 2FA required by default. Enable only if you want extra protection. Works with Google Authenticator / Authy (TOTP 30s).</p>
              <div className="mt-4 glass rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-sm">Two-Factor: {twoEnabled ? <span className="text-emerald-400">● Enabled</span> : <span className="text-white/50">○ Disabled (recommended to keep optional)</span>}</div>
                  <div className="text-xs text-white/50 mt-1">{twoEnabled ? "Login will require 6-digit code after password." : "Login works with just email + password. Enable if you want extra security."}</div>
                </div>
                {twoEnabled ? (
                  <button onClick={handle2FADisable} className="px-4 py-2 rounded-full bg-white/10 text-white text-sm font-bold border border-white/15">Disable 2FA</button>
                ) : (
                  <button onClick={handle2FASetup} className="px-4 py-2 rounded-full bg-white text-black text-sm font-bold">Enable 2FA →</button>
                )}
              </div>
              {twoQR && (
                <div className="mt-4 glass rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center">
                  <img src={twoQR} alt="QR" className="w-48 h-48 rounded-xl bg-white p-2"/>
                  <div className="flex-1">
                    <div className="text-sm font-bold">Scan with Authenticator</div>
                    <div className="text-xs text-white/60 mt-1">1. Open Google Authenticator → + → Scan QR</div>
                    <div className="text-xs text-white/60">2. Enter 6-digit code to verify</div>
                    <div className="mt-2 text-xs font-mono bg-black/30 rounded-lg p-2 break-all">Secret: {twoSecret}</div>
                    <div className="mt-3 flex gap-2">
                      <input value={twoCode} onChange={e=>setTwoCode(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="000000" inputMode="numeric" className="glass rounded-xl px-4 py-2 text-sm bg-white/5 border-white/10 w-32 text-center tracking-widest"/>
                      <button onClick={handle2FAVerify} className="px-4 py-2 rounded-full bg-emerald-500 text-white text-sm font-bold">Verify & Enable</button>
                      <button onClick={()=>{ setTwoQR(null); setTwoSecret(null); }} className="px-3 py-2 rounded-full glass text-sm">Cancel</button>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-4 text-xs text-white/40 leading-relaxed">
                • 2FA is <b className="text-white">optional</b> — admins ghalmenandkumar@gmail.com / xasancobalt@gmail.com can log in without it forever.<br/>
                • If enabled, Credentials login `src/lib/auth.ts:45` will throw <code>2FA_REQUIRED</code> → UI shows code input `src/app/page.tsx:99`. OAuth (Google) stays passwordless — 2FA only for email+password.<br/>
                • API: `POST /api/auth/2fa/setup` → QR, `POST /api/auth/2fa/verify` with token → enable, `POST /api/auth/2fa/disable` → off, `GET /api/auth/2fa/status` → flag.
              </div>
            </div>
            <div className="glass-card rounded-2xl p-6 border-amber-400/20">
              <div className="text-sm font-bold">How to test</div>
              <div className="mt-2 text-xs text-white/60 leading-relaxed">
                1. As admin, click Enable 2FA → scan QR → enter code → Enabled ✓<br/>
                2. Log out → Sign in with same email/password → now see “2FA required — enter 6-digit code” → enter Authenticator code → success<br/>
                3. Disable anytime → back to password-only. No lockout — admin can always disable via DB: `prisma.user.update where email → twoFactorEnabled false`.
              </div>
            </div>
          </div>
        )}

        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 glass-strong rounded-full px-5 py-3 flex items-center gap-3 border-white/15 text-sm font-semibold">
            <span className="w-8 h-8 rounded-full bg-emerald-500 text-white grid place-items-center">✓</span> {toast}
          </div>
        )}
      </main>
    </div>
  );
}
