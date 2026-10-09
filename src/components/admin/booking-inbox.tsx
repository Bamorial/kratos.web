"use client";
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import type { Booking, BookingStatus } from "@/cms/models";
import { adminRequest } from "./api";

type InboxPage = { items: Booking[]; nextCursor: string | null };
export function BookingInbox({ user }: { user: User }) {
  const [items, setItems] = useState<Booking[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  useEffect(() => {
    let active = true;
    adminRequest<InboxPage>(user, "bookings").then(result => { if (active) { setItems(result.items); setCursor(result.nextCursor); } }).catch(cause => { if (active) setError(cause.message); }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [user]);
  async function load(more = false) {
    setBusy(true); setError("");
    try { const result = await adminRequest<InboxPage>(user, `bookings${more && cursor ? `?cursor=${cursor}` : ""}`); setItems(previous => more ? [...previous, ...result.items] : result.items); setCursor(result.nextCursor); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load messages."); }
    finally { setBusy(false); }
  }
  async function update(booking: Booking, status?: BookingStatus) {
    if (!status && !window.confirm("Permanently delete this client message?")) return;
    setBusy(true); setError("");
    try {
      await adminRequest(user, `bookings/${booking.id}`, { method: status ? "PATCH" : "DELETE", body: JSON.stringify(status ? { status } : {}) });
      setItems(previous => status ? previous.map(item => item.id === booking.id ? { ...item, status } : item) : previous.filter(item => item.id !== booking.id));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to update the message."); }
    finally { setBusy(false); }
  }
  const visible = items.filter(item => filter === "all" || item.status === filter);
  return <section className="admin-inbox"><div className="admin-toolbar"><label>Filter loaded messages<select value={filter} onChange={event => setFilter(event.target.value as BookingStatus | "all")}><option value="all">All messages</option><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select></label><button disabled={busy} onClick={() => load()}>Refresh inbox</button></div>
    {error && <p role="alert" className="admin-error">{error}</p>}{!busy && visible.length === 0 && <div className="admin-empty"><h2>No messages here yet</h2><p>New enquiries from the contact form will appear here.</p></div>}
    {visible.map(booking => <article className="admin-message" key={booking.id}><header><div><h2>{booking.name}</h2><a href={`mailto:${booking.email}`}>{booking.email}</a></div><time dateTime={booking.createdAt}>{new Date(booking.createdAt).toLocaleString()}</time></header><p className="admin-message-meta">{booking.locale.toUpperCase()} · {booking.serviceTitle || "General enquiry"}{booking.priceCents !== null && ` · ${new Intl.NumberFormat("en", { style: "currency", currency: "EUR" }).format(booking.priceCents / 100)}`}</p><p className="admin-message-body">{booking.message}</p><footer><label>Status<select value={booking.status} disabled={busy} onChange={event => update(booking, event.target.value as BookingStatus)}><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select></label><a className="button" href={`mailto:${booking.email}?subject=${encodeURIComponent("Your enquiry — Systhera")}`}>Reply by email</a><button disabled={busy} onClick={() => update(booking)}>Delete message</button></footer></article>)}
    {busy && <p role="status">Loading…</p>}{cursor && <button disabled={busy} onClick={() => load(true)}>Load older messages</button>}
  </section>;
}
