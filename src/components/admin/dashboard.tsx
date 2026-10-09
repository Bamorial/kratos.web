"use client";
import { useState } from "react";
import { signOut, type User } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import type { Collection } from "@/cms/models";
import { AuthGate } from "./auth-gate";
import { ContentManager } from "./content-manager";
import { BookingInbox } from "./booking-inbox";
import { adminRequest } from "./api";

const sections = { content: "Texts & translations", articles: "Blog articles", services: "Services & prices", bookings: "Booking inbox" } as const;
function Workspace({ user, initialized: initialState }: { user: User; initialized: boolean }) {
  const [section, setSection] = useState<Collection | "bookings">("content");
  const [initialized, setInitialized] = useState(initialState);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  function canLeave() { return !dirty || window.confirm("Discard unsaved changes?"); }
  async function initialize() {
    setBusy(true); setError("");
    try { await adminRequest(user, "initialize", { method: "POST", body: "{}" }); setInitialized(true); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to import content."); }
    finally { setBusy(false); }
  }
  return <><header className="admin-header"><div><p className="admin-eyebrow">Systhera</p><h1>Website administration</h1></div><div className="admin-account"><span>{user.email}</span><a href="/de" target="_blank" rel="noreferrer">View website ↗</a><button onClick={() => { if (canLeave()) void signOut(firebaseAuth()); }}>Sign out</button></div></header>
    <nav className="admin-navigation" aria-label="Admin sections">{Object.entries(sections).map(([key, label]) => <button key={key} aria-current={section === key ? "page" : undefined} onClick={() => { if (section !== key && canLeave()) { setDirty(false); setSection(key as typeof section); } }}>{label}</button>)}</nav>
    <main className="admin-main"><div className="admin-page-heading"><p className="admin-eyebrow">Your workspace</p><h2>{sections[section]}</h2></div>
      {!initialized && section !== "bookings" ? <section className="admin-empty"><h2>Bring your existing content into the CMS</h2><p>Import the current German, English, and Romanian texts, six articles, and two services. No existing CMS content will be overwritten. Prices remain unset until you add them.</p><button className="button" disabled={busy} onClick={initialize}>{busy ? "Importing…" : "Import existing website content"}</button>{error && <p role="alert" className="admin-error">{error}</p>}</section>
        : section === "bookings" ? <BookingInbox user={user} /> : <ContentManager key={section} user={user} collection={section} onDirtyChange={setDirty} />}
    </main></>;
}
export function Dashboard() { return <AuthGate>{(user, initialized) => <Workspace key={user.uid} user={user} initialized={initialized} />}</AuthGate>; }
