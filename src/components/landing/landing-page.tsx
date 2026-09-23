import type { SiteContent } from "@/content/site";
import { localizedPath, type Locale } from "@/i18n/config";
import { ButtonLink, SectionHeading } from "../ui";
import { Testimonials } from "../testimonials";
import { Hero } from "./hero";
import { AboutPreview } from "./about-preview";
import { Audience, ServicesPreview } from "./services-preview";
import { Process } from "./process";
import { Faq } from "./faq";

export function LandingPage({ locale, content: c }: { locale: Locale; content: SiteContent }) {
  return <><Hero locale={locale} content={c} /><section className="section container approach"><SectionHeading title={c.approach.title} description={c.approach.intro} /><div className="approach-circles">{c.approach.items.map((text, index) => <div className="approach-circle" key={text}><h3>{"ABC"[index]}</h3><p>{text}</p></div>)}</div></section><AboutPreview locale={locale} content={c} /><Audience locale={locale} content={c} /><ServicesPreview locale={locale} content={c} /><Process content={c} /><Testimonials content={c} /><Faq locale={locale} content={c} /><section className="final-cta"><div className="container"><h2>{c.finalCta}</h2><ButtonLink href={localizedPath(locale, "contact")} outline>{c.ui.book}</ButtonLink></div></section></>;
}
