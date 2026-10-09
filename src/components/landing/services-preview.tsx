import { getPublishedServices } from "@/server/public-content";
import Link from "next/link";
import type { SiteContent } from "@/content/site";
import { localizedPath, type Locale } from "@/i18n/config";
import { ButtonLink, Photo, SectionHeading } from "../ui";

export function Audience({ locale, content: c }: { locale: Locale; content: SiteContent }) {
  return <section className="section container"><h2 className="center audience-heading">{c.audience.title}</h2><div className="two-column">{c.audience.cards.map(card => <article className="audience-card" key={card.path}><Photo file={card.image} className="audience-photo" /><div className="card-copy"><h3>{card.title}</h3><p>{card.text}</p><h3>{c.audience.topics}</h3><ul className="tags">{card.tags.map(tag => <li key={tag}>{tag}</li>)}</ul><div className="center"><ButtonLink href={localizedPath(locale, card.path)}>{c.ui.more} <span aria-hidden="true">→</span></ButtonLink></div></div></article>)}</div></section>;
}

export async function ServicesPreview({ locale, content: c }: { locale: Locale; content: SiteContent }) {
  const services = await getPublishedServices(locale);
  return <section className="section tinted" id="services"><div className="container"><SectionHeading title={c.nav.services} description={c.services.subtitle} /><div className="two-column">{services.map(item => <Link className="service-card" key={item.slug} href={localizedPath(locale, `services#${item.slug}`)}><Photo file={item.image} className="service-preview-photo" /><h3>{item.title}</h3><p>{item.description}</p></Link>)}</div><div className="center section-action"><ButtonLink href={localizedPath(locale, "services")}>{c.ui.more}</ButtonLink></div></div></section>;
}
