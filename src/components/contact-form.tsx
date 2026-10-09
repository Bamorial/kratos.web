"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { SiteContent } from "@/content/site";
import type { LocalizedService } from "@/cms/models";
import { localizedPath, type Locale } from "@/i18n/config";

export function ContactForm({ content: c, locale, services, email, selectedService = "" }: { content: SiteContent; locale: Locale; services: LocalizedService[]; email: string; selectedService?: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [requestId, setRequestId] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending" || status === "sent") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const id = requestId || crypto.randomUUID();
    setRequestId(id); setStatus("sending");
    try {
      const response = await fetch("/api/bookings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id, name: data.get("name"), email: data.get("email"), message: data.get("message"), serviceId: data.get("serviceId"), website: data.get("website"), consent: data.get("consent") === "on", locale }),
      });
      if (!response.ok) throw new Error("Submission failed");
      setStatus("sent"); form.reset();
    } catch { setStatus("error"); }
  }
  return <form className="contact-form" onSubmit={submit}>
    <div className="form-row"><label><span className="sr-only">{c.contact.name}</span><input name="name" autoComplete="name" placeholder={c.contact.name} required maxLength={120} disabled={status === "sent"} /></label><label><span className="sr-only">{c.contact.email}</span><input name="email" type="email" autoComplete="email" placeholder={c.contact.email} required maxLength={254} disabled={status === "sent"} /></label></div>
    <label className="service-select">{c.contact.service}<select name="serviceId" defaultValue={selectedService} disabled={status === "sent"}><option value="">{c.contact.general}</option>{services.map(service => <option value={service.slug} key={service.slug}>{service.title}</option>)}</select></label>
    <label><span className="sr-only">{c.contact.message}</span><textarea name="message" placeholder={c.contact.message} rows={7} required maxLength={4000} disabled={status === "sent"} /></label>
    <div className="contact-honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <label className="contact-consent"><input name="consent" type="checkbox" required disabled={status === "sent"} /><span>{c.contact.consent} <Link href={localizedPath(locale, "privacy")}>{c.ui.privacy}</Link></span></label>
    <p className="form-hint">{c.contact.hint}</p><button className="button" type="submit" disabled={status === "sending" || status === "sent"}>{status === "sending" ? c.contact.sending : c.contact.submit}</button>
    {status === "sent" && <p role="status">{c.contact.ready}</p>}
    {status === "error" && <p role="alert">{c.contact.error} <a href={`mailto:${email}`}>{email}</a></p>}
  </form>;
}
