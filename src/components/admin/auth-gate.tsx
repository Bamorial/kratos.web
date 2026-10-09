"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { adminRequest } from "./api";

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
  return <section className="admin-login"><p className="admin-eyebrow">Systhera · Administration</p><h1>Welcome back</h1><p>Sign in to manage your website and client enquiries.</p>
    <form onSubmit={login}><label>Email<input name="email" type="email" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label><button className="button" disabled={loading}>{loading ? "Checking session…" : "Sign in"}</button></form>
    {error && <p role="alert" className="admin-error">{error}</p>}<Link href="/de">Return to website</Link>
  </section>;
}
