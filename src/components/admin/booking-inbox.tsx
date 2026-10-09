"use client";
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import type { Booking, BookingStatus } from "@/cms/models";
import { adminRequest } from "./api";
import { Icon } from "./icons";

const statusLabels: Record<BookingStatus | "all", string> = { all: "All", new: "New", contacted: "Contacted", closed: "Closed" };

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
  const count = (status: BookingStatus | "all") => status === "all" ? items.length : items.filter(item => item.status === status).length;
  return <section className="admin-inbox">
    <div className="admin-toolbar"><div className="admin-filters" role="group" aria-label="Filter loaded messages">{(["all", "new", "contacted", "closed"] as const).map(status => <button type="button" key={status} aria-pressed={filter === status} onClick={() => setFilter(status)}>{statusLabels[status]}<span className="admin-count">{count(status)}</span></button>)}</div>
      <button type="button" className="admin-btn admin-btn-sm" disabled={busy} onClick={() => load()}><Icon name="refresh" size={16} />Refresh</button></div>
    {error && <p role="alert" className="admin-banner admin-banner-error"><Icon name="alert" />{error}</p>}
    {!busy && visible.length === 0 && <div className="admin-empty admin-card"><span className="admin-empty-icon"><Icon name="inbox" size={26} /></span><h2>{filter === "all" ? "No messages yet" : `No ${statusLabels[filter].toLowerCase()} messages`}</h2><p>New enquiries from the contact form will appear here.</p></div>}
    <div className="admin-messages">{visible.map(booking => <article className={`admin-message admin-card is-${booking.status}`} key={booking.id}>
      <header><span className="admin-avatar" aria-hidden="true">{booking.name.charAt(0).toUpperCase()}</span><div className="admin-message-from"><h2>{booking.name}</h2><a href={`mailto:${booking.email}`}>{booking.email}</a></div><span className={`admin-badge admin-badge-${booking.status === "new" ? "warning" : booking.status === "contacted" ? "info" : "neutral"}`}>{statusLabels[booking.status]}</span></header>
      <p className="admin-message-meta"><time dateTime={booking.createdAt}>{new Date(booking.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</time><span>{booking.serviceTitle || "General enquiry"}</span>{booking.priceCents !== null && <span>{new Intl.NumberFormat("en", { style: "currency", currency: "EUR" }).format(booking.priceCents / 100)}</span>}<span>{booking.locale.toUpperCase()}</span></p>
      <p className="admin-message-body">{booking.message}</p>
      <footer><label className="admin-inline-label">Status<select value={booking.status} disabled={busy} onChange={event => update(booking, event.target.value as BookingStatus)}><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select></label>
        <div className="admin-message-actions"><button type="button" className="admin-btn admin-btn-danger-ghost" disabled={busy} onClick={() => update(booking)}><Icon name="trash" size={16} />Delete</button><a className="admin-btn admin-btn-primary" href={`mailto:${booking.email}?subject=${encodeURIComponent("Your enquiry — Systhera")}`}><Icon name="mail" size={16} />Reply by email</a></div></footer>
    </article>)}</div>
    {busy && <p className="admin-muted admin-loading" role="status">Loading…</p>}{cursor && <button type="button" className="admin-btn admin-btn-block" disabled={busy} onClick={() => load(true)}>Load older messages</button>}
  </section>;
}
