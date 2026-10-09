"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { adminRequest } from "./api";
import { Brand } from "./brand";
import { Icon } from "./icons";

export function AuthGate({ children }: { children: (user: User, initialized: boolean) => ReactNode }) {
  const [session, setSession] = useState<{ user: User; initialized: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(firebaseAuth(), async user => {
      if (!active) return;
      setSession(null);
      if (!user) { setLoading(false); return; }
      setLoading(true);
      try {
        await user.getIdToken(true);
        const result = await adminRequest<{ initialized: boolean }>(user, "session");
        if (active) { setSession({ user, initialized: result.initialized }); setError(""); }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Unable to sign in.");
        await signOut(firebaseAuth());
      } finally { if (active) setLoading(false); }
    });
    return () => { active = false; unsubscribe(); };
  }, []);
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setLoading(true); setError("");
    try { await signInWithEmailAndPassword(firebaseAuth(), String(fields.get("email")), String(fields.get("password"))); }
    catch { setError("Sign-in failed. Check your email and password and try again."); setLoading(false); }
  }
  if (session) return children(session.user, session.initialized);
  return <main className="admin-login"><div className="admin-login-card"><Brand /><h1>Welcome back</h1><p>Sign in to manage your website and client enquiries.</p>
    <form onSubmit={login}><label>Email<input name="email" type="email" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
      {error && <p role="alert" className="admin-banner admin-banner-error"><Icon name="alert" />{error}</p>}
      <button className="admin-btn admin-btn-primary admin-btn-block" disabled={loading}>{loading ? "Checking session…" : "Sign in"}</button></form>
    <Link className="admin-back-link" href="/de"><Icon name="back" size={16} />Return to website</Link>
  </div></main>;
}
