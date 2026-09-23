import type { SiteContent } from "@/content/site";
import { localizedPath, type Locale } from "@/i18n/config";
import { AssetIcon, ButtonLink, SectionHeading } from "../ui";

export function Faq({ locale, content: c }: { locale: Locale; content: SiteContent }) {
  return <section className="section container" id="faq"><SectionHeading title={c.faq.title} description={c.faq.intro} /><div className="faq-list">{c.faq.items.map((item, index) => <details key={item.question} open={index < 3}><summary><h3>{item.question}</h3><span className="faq-symbol" aria-hidden="true"><AssetIcon file="4cc45.svg" width={33} height={33} /></span></summary><p>{item.answer}</p></details>)}</div><div className="center section-action"><p>{c.faq.remaining}</p><ButtonLink href={localizedPath(locale, "contact")}>{c.nav.contact}</ButtonLink></div></section>;
}
