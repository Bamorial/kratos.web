import Link from "next/link";
import type { SiteContent } from "@/content/site";
import { localizedPath, type Locale } from "@/i18n/config";
import { AssetIcon, ButtonLink, Photo, SectionHeading } from "../ui";

export function Audience({ locale, content: c }: { locale: Locale; content: SiteContent }) {
  return <section className="section container"><h2 className="center audience-heading">{c.audience.title}</h2><div className="two-column">{c.audience.cards.map(card => <article className="audience-card" key={card.path}><Photo file={card.image} className="audience-photo" /><div className="card-copy"><h3>{card.title}</h3><p>{card.text}</p><h3>{c.audience.topics}</h3><ul className="tags">{card.tags.map(tag => <li key={tag}>{tag}</li>)}</ul><div className="center"><ButtonLink href={localizedPath(locale, card.path)}>{c.ui.more} <span aria-hidden="true">→</span></ButtonLink></div></div></article>)}</div></section>;
}

export function ServicesPreview({ locale, content: c }: { locale: Locale; content: SiteContent }) {
  const services = [{ title: c.services.therapy, text: c.services.therapyText, image: "137d0.svg", path: "therapy" }, { title: c.services.qigong, text: c.services.qigongText, image: "80d72.svg", path: "qigong" }];
  return <section className="section tinted" id="services"><div className="container"><SectionHeading title={c.nav.services} description={c.services.subtitle} /><div className="two-column">{services.map(item => <Link className="service-card" key={item.path} href={localizedPath(locale, `services#${item.path}`)}><AssetIcon file={item.image} width={230} height={230} /><h3>{item.title}</h3><p>{item.text}</p></Link>)}</div><div className="center section-action"><ButtonLink href={localizedPath(locale, "services")}>{c.ui.more}</ButtonLink></div></div></section>;
}
