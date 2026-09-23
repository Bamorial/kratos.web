import type { SiteContent } from "@/content/site";
import { localizedPath, type Locale } from "@/i18n/config";
import { AssetIcon, ButtonLink, Photo } from "./ui";

export function ServicesPage({ locale, content: c }: { locale: Locale; content: SiteContent }) {
  return <div className="container inner-page services-page"><h1 className="page-title">{c.nav.services}</h1><section className="two-column service-detail" id="qigong"><Photo file="760cb.png" className="service-detail-photo" priority /><div className="service-description"><h2>{c.services.qigong}</h2><p className="lead">{c.services.prevention}</p><p>{c.services.qigongText}</p><p>{c.services.description}</p><ol className="exercise-list">{c.services.exercises.map((text, index) => <li key={text}><span>{String(index + 1).padStart(2, "0")}</span> · {text}</li>)}</ol><ButtonLink href={localizedPath(locale, "contact")}>{c.ui.book}</ButtonLink></div></section><section className="two-column service-detail therapy-detail" id="therapy"><div className="therapy-illustration"><AssetIcon file="137d0.svg" width={240} height={340} /></div><div className="service-description"><h2>{c.services.therapy}</h2><p className="lead">{c.services.therapyText}</p>{c.about.paragraphs.map(text => <p key={text}>{text}</p>)}<ButtonLink href={localizedPath(locale, "contact")}>{c.ui.book}</ButtonLink></div></section></div>;
}
