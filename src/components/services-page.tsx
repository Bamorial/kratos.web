import type { SiteContent } from "@/content/site";
import type { LocalizedService } from "@/cms/models";
import { localizedPath, type Locale } from "@/i18n/config";
import { ButtonLink, Photo } from "./ui";

export function ServicesPage({ locale, content: c, services }: { locale: Locale; content: SiteContent; services: LocalizedService[] }) {
  return <div className="container inner-page services-page"><h1 className="page-title">{c.nav.services}</h1>{services.map(service => <section key={service.slug} className="two-column service-detail" id={service.slug}>
    <Photo file={service.image} className="service-detail-photo" /><div className="service-description" lang={service.language}><h2>{service.title}</h2><p className="lead">{service.description}</p>
      {service.details.map((text, index) => <p key={index}>{text}</p>)}
      <p className="service-price">{service.priceCents === null ? c.contact.priceOnRequest : new Intl.NumberFormat(locale, { style: "currency", currency: service.currency }).format(service.priceCents / 100)}{service.durationMinutes && <span> · {service.durationMinutes} {c.contact.minutes}</span>}</p>
      <ButtonLink href={`${localizedPath(locale, "contact")}?service=${encodeURIComponent(service.slug)}`}>{c.ui.book}</ButtonLink>
    </div></section>)}</div>;
}
