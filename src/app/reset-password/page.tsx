"use client";

import { useCallback, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (sending) return;
      if (password.length < 8) {
        setMsg({ type: "err", text: "Password must be at least 8 characters." });
        return;
      }
      if (password !== confirm) {
        setMsg({ type: "err", text: "Passwords don't match." });
        return;
      }
      setSending(true);
      setMsg(null);
      try {
        const res = await fetch("/api/auth/reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          setMsg({ type: "ok", text: "Password updated. Redirecting to sign in…" });
          setTimeout(() => router.push("/?auth=signin&callbackUrl=/studio"), 900);
        } else {
          setMsg({ type: "err", text: data.error || "Reset failed. Try a fresh link." });
        }
      } catch {
        setMsg({ type: "err", text: "Network error — please try again." });
      } finally {
        setSending(false);
      }
    },
    [sending, password, confirm, token, router]
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "sans-serif" }}>
      <form onSubmit={submit} style={{ width: "100%", maxWidth: 420, background: "#14141C", border: "1px solid #262633", borderRadius: 16, padding: 32, display: "grid", gap: 14 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Set a new password</h1>
        <p style={{ margin: 0, color: "#9aa", fontSize: 13 }}>Choose a new password for your LINGAUX account. This link is single-use and expires in 1 hour.</p>
        <label style={{ fontSize: 12, color: "#aab" }}>
          New password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required autoFocus style={{ width: "100%", marginTop: 6, padding: 12, borderRadius: 10, border: "1px solid #333", background: "#0E0E14", color: "#fff", boxSizing: "border-box" }} />
        </label>
        <label style={{ fontSize: 12, color: "#aab" }}>
          Confirm new password
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={8} required style={{ width: "100%", marginTop: 6, padding: 12, borderRadius: 10, border: "1px solid #333", background: "#0E0E14", color: "#fff", boxSizing: "border-box" }} />
        </label>
        {msg && (
          <p style={{ margin: 0, fontSize: 13, color: msg.type === "ok" ? "#7CF29A" : "#FF7A6B" }}>{msg.text}</p>
        )}
        <button type="submit" disabled={sending || !token} style={{ padding: "14px 0", borderRadius: 999, border: "none", background: "#fff", color: "#000", fontWeight: 700, cursor: sending ? "default" : "pointer", opacity: sending || !token ? 0.5 : 1 }}>
          {sending ? "Saving…" : "Set new password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0A0A0F", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>Loading…</div>}>
      <ResetForm />
    </Suspense>
  );
}