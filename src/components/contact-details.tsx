import { practice, type SiteContent } from "@/content/site";

export function ContactDetails({ content: c, full = false }: { content: SiteContent; full?: boolean }) {
  return <div className={`contact-details${full ? " contact-details-full" : ""}`}>
    <div><strong>{c.contact.email}</strong><a href={`mailto:${practice.email}`}>{practice.email}</a></div>
    <div><strong>{c.contact.phone}</strong><a href={practice.phoneHref}>{practice.phone}</a></div>
    {full && <><div><strong>{c.contact.address}</strong><address>{practice.address}</address></div><p className="emergency">{c.contact.emergency}</p></>}
  </div>;
}
