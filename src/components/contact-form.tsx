"use client";

import { useState, type FormEvent } from "react";
import { practice, type SiteContent } from "@/content/site";

export function ContactForm({ content: c }: { content: SiteContent }) {
  const [prepared, setPrepared] = useState(false);
  function prepareEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = `${c.nav.contact} — ${data.get("name")}`;
    const body = `${data.get("message")}\n\n${data.get("name")}\n${data.get("email")}`;
    window.location.href = `mailto:${practice.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setPrepared(true);
  }
  return <form className="contact-form" onSubmit={prepareEmail}>
    <div className="form-row"><label><span className="sr-only">{c.contact.name}</span><input name="name" autoComplete="name" placeholder={c.contact.name} required maxLength={120} /></label><label><span className="sr-only">{c.contact.email}</span><input name="email" type="email" autoComplete="email" placeholder={c.contact.email} required maxLength={254} /></label></div>
    <label><span className="sr-only">{c.contact.message}</span><textarea name="message" placeholder={c.contact.message} rows={7} required maxLength={4000} /></label>
    <p className="form-hint">{c.contact.hint}</p><button className="button" type="submit">{c.contact.submit}</button>
    {prepared && <p role="status">{c.contact.ready} <a href={`mailto:${practice.email}`}>{practice.email}</a></p>}
  </form>;
}
