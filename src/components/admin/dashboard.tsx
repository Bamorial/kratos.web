"use client";
import { useState } from "react";
import { signOut, type User } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { AuthGate } from "./auth-gate";
import { ContentManager } from "./content-manager";
import { BookingInbox } from "./booking-inbox";
import { adminRequest } from "./api";
import { Brand } from "./brand";
import { Icon, type IconName } from "./icons";

const sections = {
  content: { label: "Texts & translations", short: "Texts", icon: "text", description: "Edit the page copy for each language. Changes stay private until you publish them." },
  articles: { label: "Blog articles", short: "Blog", icon: "article", description: "Write and publish blog posts. German is required; English and Romanian are optional." },
  services: { label: "Services & prices", short: "Services", icon: "tag", description: "Manage the services, prices and session lengths shown on the website." },
  bookings: { label: "Booking inbox", short: "Inbox", icon: "inbox", description: "Enquiries sent through the contact form. Reply by email and track their status." },
} as const satisfies Record<string, { label: string; short: string; icon: IconName; description: string }>;
type Section = keyof typeof sections;

function Workspace({ user, initialized: initialState }: { user: User; initialized: boolean }) {
  const [section, setSection] = useState<Section>("content");
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
  const current = sections[section];
  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <Brand />
      <nav className="admin-navigation" aria-label="Admin sections">{(Object.keys(sections) as Section[]).map(key => <button key={key} type="button" aria-label={sections[key].label} aria-current={section === key ? "page" : undefined} onClick={() => { if (section !== key && canLeave()) { setDirty(false); setSection(key); } }}><Icon name={sections[key].icon} /><span className="admin-nav-label">{sections[key].label}</span><span className="admin-nav-short">{sections[key].short}</span></button>)}</nav>
      <div className="admin-account">
        <a className="admin-btn admin-btn-ghost admin-view-site" href="/de" target="_blank" rel="noreferrer" aria-label="View website (opens in a new tab)"><Icon name="external" /><span>View website</span></a>
        <div className="admin-user"><span className="admin-avatar" aria-hidden="true">{(user.email ?? "?").charAt(0).toUpperCase()}</span><span className="admin-user-email">{user.email}</span>
          <button type="button" className="admin-icon-btn" aria-label="Sign out" title="Sign out" onClick={() => { if (canLeave()) void signOut(firebaseAuth()); }}><Icon name="logout" /></button></div>
      </div>
    </aside>
    <main className="admin-main">
      <header className="admin-page-heading"><h1>{current.label}</h1><p>{current.description}</p></header>
      {!initialized && section !== "bookings" ? <section className="admin-empty admin-card"><span className="admin-empty-icon"><Icon name="globe" size={26} /></span><h2>Bring your existing content into the CMS</h2><p>Import the current German, English, and Romanian texts, six articles, and two services. No existing CMS content will be overwritten. Prices remain unset until you add them.</p><button type="button" className="admin-btn admin-btn-primary" disabled={busy} onClick={initialize}>{busy ? "Importing…" : "Import existing website content"}</button>{error && <p role="alert" className="admin-banner admin-banner-error">{error}</p>}</section>
        : section === "bookings" ? <BookingInbox user={user} /> : <ContentManager key={section} user={user} collection={section} onDirtyChange={setDirty} />}
    </main>
  </div>;
}
export function Dashboard() { return <AuthGate>{(user, initialized) => <Workspace key={user.uid} user={user} initialized={initialized} />}</AuthGate>; }
